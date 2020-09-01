import * as userDao from '../dao/userDao';
import * as groupDao from '../dao/groupDao';
import * as modal from '../modal';
import * as redisUtil from '../util/connectRedis';
import * as chatDao from '../dao/chatDao';
import { Request, Response } from 'express';
import * as crypto from '../util/crypto';
const qs = require('qs');

const path = new Map();
const queryUserInfoById = (request: any, response: any) => {
    const { id } = request.query;
    userDao.queryUserByType('id', [id], (result: modal.result) => {
        if (result.error) {
            console.log(result.error)
        } else {
            const obj = result.result[0];
            delete obj.password;
            response.json({
                result: obj
            })
        }
    })
}
//leftArr为要插入的数组，rightArr是已经完成的数组
const concatArr = (leftArr: any[], rightArr: any[]) => {
    if (leftArr.length === 0) return rightArr;
    if (rightArr.length === 0) return leftArr;

    const result: any = [];
    for (let i = 0; i < leftArr.length; i++) {
        let flag = true;
        for (let j = 0; j < rightArr.length; j++) {
            if (leftArr[i].id === rightArr[j].id) {
                flag = false;
            }
        }
        flag && result.push(leftArr[i]);
    }
    return result;
}

//通过用户id获取好友或者群组基本信息
//在好友列表界面中使用
const queryfriendsByUserId = async (request: any, response: any) => {
    const { id, type } = request.query;
    if (type === 'user') {
        queryUserInfoById(id, (user: modal.userData) => {
            response.json({
                userInfo: {
                    id: user.id,
                    avatar: user.avatar,
                    nickname: user.nickname,
                    sign: user.sign,
                    phone: user.phone,
                    email: user.email
                }
            });
        })
    } else if (type === 'group') {
        groupDao.queryGroupByName('id', id, async (result: modal.result) => {
            if (result.error) {
                console.log(result.error)
            } else {
                if (result.result.length > 0) {
                    const group = result.result[0];
                    group.memberArr = [];
                    await redisUtil.getKey(group.lead_id, (err: any, result: string) => {
                        if (err) {
                            throw err
                        }
                        group.lead = JSON.parse(result);
                    });
                    await group.member.split(',').forEach(async (id: string) => {
                        await redisUtil.getKey(id, (err: any, result: string) => {
                            if (err) {
                                throw err
                            }
                            group.memberArr.push(JSON.parse(result));
                        })
                    })
                    response.json({
                        groupInfo: group
                    })
                }

            }
        })
    }


}

//根据用户名或者昵称或者群组名称查找
const queryUserOrGroup = async (request: any, response: any) => {
    const { query_str } = request.query;
    let resultArr: any[] = [];

    await userDao.queryUserByTypeUseLike('nickname', query_str, (result: modal.result) => {
        if (result.error) {
            console.log(result.error);
        } else {
            //将查询结果插入resultArr
            resultArr = result.result;
            userDao.queryUserByTypeUseLike('username', query_str, (result: modal.result) => {
                if (result.error) {
                    console.log(result.error);
                } else {
                    //将查询结果插入resultArr
                    resultArr = concatArr(result.result, resultArr);
                    groupDao.queryGroupByName('group_name', query_str, (result: modal.result) => {
                        if (result.error) {
                            console.log(result.error)
                        } else {
                            //将查询结果插入resultArr
                            resultArr = resultArr.concat(result.result);
                            if (resultArr.length > 0) {
                                resultArr.forEach((ele: any) => {
                                    ele.password && delete ele.password;
                                })
                            }
                            response.json({
                                queryResult: resultArr
                            })
                        }
                    })
                }
            });
        }
    });
}

const addFriend = (from: string, to: string, callback: Function) => {
    const group_id = Date.now().toString() + Math.floor(Math.random() * 1000);
    userDao.addFriend(from, to, (result: any) => {
        if (!result.changedRows) throw Error();

        userDao.addFriend(to, from, (result: any) => {
            if (!result.changedRows) throw Error();

            chatDao.addChatMapToFriend(from, to, group_id, (err: any, result: any) => {
                if (err) throw err;

                chatDao.addChatMapToFriend(to, from, group_id, (arr: any, result: any) => {
                    if (err) throw err;
                    callback();
                });
            });
        });
    });
}

const getFriends = (request: any, response: any) => {
    const { ids } = request.query;
    const idsArr = ids.split(',');
    const result: any[] = [];
    idsArr.forEach((id: string, index: number) => {
        id && redisUtil.getKey(id, (res: any) => {
            const temp = JSON.parse(res);
            temp.id = id;
            result.push(temp);

            if (index === idsArr.length - 1) {
                response.json({
                    friend_list: result
                })
            }
        })
    })
}

//用户修改基本信息（昵称，签名，电话，email）
const updateUserData = (request: any, response: any) => {
    const data: modal.updateItem = qs.parse(request.body);
    if (data.type === 'nickname') {
        redisUtil.getKey(data.id, (user: string) => {
            const userData = JSON.parse(user);
            userData.nickname = data.message;
            redisUtil.setKey(data.id, JSON.stringify(userData), (err: any, ele: any) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('one user update');
                }
            })
        })
    }
    userDao.updateUser(data.id, data.type, data.message, (result: modal.result) => {
        if (!result.error) {
            response.send({ msg: 'success' })
        } else {
            response.status(500);
        }
    })
}

//用户修改头像
const updateAvatar = (req: Request, res: Response) => {
    const path = req.file ? req.file.path : req.body.file.path;
    userDao.updateUser(req.body.id, 'avatar', 'http://localhost:12306/' + path.slice(7), (result: modal.result) => {
        if (!result.error) {
            redisUtil.getKey(req.body.id, (user: string) => {
                const userData = JSON.parse(user);
                userData.avatar = 'http://localhost:12306/' + path.slice(7);
                redisUtil.setKey(req.body.id, JSON.stringify(userData), (err: any, ele: any) => {
                    if (!err) {
                        res.send('http://localhost:12306/' + path.slice(7));
                    }
                })
            })
        }
    })
}

//修改密码
const updatePassword = (request: Request, response: Response) => {
    const { newPassword, oldPassword, id } = qs.parse(request.body);
    const target = crypto.decrypt(newPassword);
    const origin = crypto.decrypt(oldPassword);
    userDao.queryUserByType('id', [id], (result: modal.result) => {
        if (result.error) {
            console.log(result.error)
        } else {
            const obj = result.result[0];
            if (obj.password === origin) {
                userDao.updateUser(id, 'password', target, (result: modal.result) => {
                    if (result.error) {
                        console.log(result.error)
                    } else {
                        response.send('success');
                    }
                })
            } else {
                response.status(500).send('password error')
            }
        }
    })
}

//删除好友
const deleteFriend = (user_id:string, friend_id:string,callback:Function) => {
    userDao.queryUserByType('id', user_id, (result: modal.result) => {
        if (!result.error) {
            const friends: string[] = result.result[0].friends.split(',');
            const index = friends.indexOf(friend_id);
            index > -1 && friends.splice(index,1);

            userDao.updateUser(user_id,'friends',friends.toString(),() => {
                callback({result:'success'});
            })
        }
    })
}

path.set('/api/updateUserData', updateUserData);
path.set('/api/getUserById', queryUserInfoById);
path.set('/api/getFriendsByUserId', queryfriendsByUserId);
path.set('/api/queryUserOrGroup', queryUserOrGroup);
path.set('addFriend', addFriend);
path.set('/api/getFriends', getFriends);
path.set('/api/updateAvatar', updateAvatar);
path.set('/api/updatePassword', updatePassword);
path.set('deleteFriend', deleteFriend);

export default path;