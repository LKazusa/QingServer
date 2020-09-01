import * as groupDao from '../dao/groupDao';
import * as userDao from '../dao/userDao';
import * as redisUtil from '../util/connectRedis';
import * as modal from '../modal';
import { Request, Response } from 'express';
import _ from 'lodash';
const qs = require('qs');

const path = new Map();

//创建群组
//先向redis中存放基本信息，然后修改用户和好友的group信息
const addGroup = (request: any, response: any) => {
    const group = request.body;
    const temp = {
        group_name: group.group_name,
        avatar: '',
    }
    redisUtil.setKey(group.group_id, JSON.stringify(temp), (err: any, ele: any) => {
        if (err) {
            throw err;
        }
    });
    const queryIds = qs.parse(group).member_ids;
    queryIds.push(group.lead_id)
    queryIds.forEach((id: string, index: number) => {
        userDao.queryGroupById(id, (result: modal.result) => {
            if (result.error) {
                throw result.error;
            }
            let groupStr = result.result[0].group;
            if (groupStr) {
                groupStr += ',' + group.group_id
            } else {
                groupStr = group.group_id;
            }
            userDao.updateGroup(id, groupStr, (result: modal.result) => {
                if (result.error) {
                    throw result.error
                }
                if (index === queryIds.length - 1) {
                    response.json({
                        result: 'ok'
                    })
                }
            })

        })
    });
    const template = qs.parse(group);
    const groupObj: modal.groupItem = {
        id: template.group_id,
        group_name: template.group_name,
        lead_id: template.lead_id,
        member: template.member_ids.join(',') + ',' + template.lead_id,
        time: Date.now() + '',
        avatar: ''
    };
    groupDao.InsertGroup(groupObj, (result: any) => {
        console.log(result);
    })
}

const findGroupById = (request: any, response: any) => {
    const { id } = request.query;
    groupDao.queryGroupById(id, (result: any) => {
        response.json({ result });
    })
}

const updateGroup = (request: Request, response: Response) => {
    const { id, user_id } = request.query;
    let ids = '';
    groupDao.queryGroupById(id, (result: any) => {
        result.member.forEach((item: any, index: number) => {
            if (item.id !== user_id) {
                ids += item.id + ',';
            }
            if (index === result.member.length - 1) {
                groupDao.updateGroup('member', parseInt(id), [ids], (result: modal.result) => {
                    if (!result.error) {
                        userDao.queryUserByType('id', user_id, (result: modal.result) => {
                            if (!result.error) {
                                const arr = result.result[0].group.split(',');
                                const resultArr = arr.filter((group_id: string) => id != group_id)
                                userDao.updateGroup(user_id, resultArr.join(','), (result: modal.result) => {
                                    if (!result.error) {
                                        response.send('ok')
                                    }
                                })
                            }
                        })
                    } else {
                        response.status(500);
                    }
                })
            }
        })
    })
}
const deleteGroupMember = (group_id: string, member: string[], callback: Function) => {
    _.each(member, (id: string, index: number) => {
        userDao.queryUserByType('id', id, (result: modal.result) => {
            if (result.error) {
                callback('error')
                throw result.error
            } else {
                const group = result.result[0].group.split(',');
                const resultGroup = _.filter(group, (id: string) => id !== group_id).join(',');
                userDao.updateUser(id, 'group', resultGroup, (result: modal.result) => {
                    if (result.error) {
                        callback('error')
                        throw result.error
                    } else {
                        if (index === member.length - 1) {
                            callback('success');
                        }
                    }
                })
            }
        })
    })
}

//解散群聊
const deleteGroup = (request: Request, response: Response) => {
    const { group_id, lead_id, member } = request.query;
    //删除group表里的相应数据
    groupDao.deleteGroup(group_id, (deleteResult: modal.result) => {
        if (deleteResult.error) {
            response.status(500).send('error');
            console.log(deleteResult.error)
        } else {
            //修改群主的信息
            userDao.queryUserByType('id', [lead_id], (result: modal.result) => {
                if (result.error) {
                    response.status(500).send('error');
                    console.log(result.error)
                } else {
                    const groupArr = result.result[0].group.split(',').filter((id: string) => id);
                    const resultGroup = _.filter(groupArr, (id: string) => id !== group_id).join(',');
                    userDao.deleteLeadUserData(lead_id, resultGroup, (result: modal.result) => {
                        if (result.error) {
                            throw result.error
                        } else {
                            //修改群成员的信息
                            deleteGroupMember(group_id, member, (message: 'success' | 'error') => {
                                if (message === 'success') {
                                    response.status(200).send('success');
                                } else {
                                    response.status(500).send('error');
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

//同意添加用户至群组中
const userAddGroup = (user_id: string, group_id: string, callback: Function) => {
    userDao.userJoinGroup(user_id, group_id, (result: modal.result) => {
        if (!result.error) {
            console.log('连接成功')
            groupDao.insertUserToGroup(group_id, user_id, (result: modal.result) => {
                if (!result.error) {
                    console.log('insert success')
                    callback({ result: 'success' })
                } else {
                    callback({ error: result.error })
                }
            })
        } else {
            callback({ error: result.error })
        }
    })
}

path.set('/api/addGroup', addGroup);
path.set('/api/findGroupById', findGroupById);
path.set('/api/deleteMember', updateGroup);
path.set('/api/deleteGroup', deleteGroup);
path.set('userAddGroup', userAddGroup);

export default path;