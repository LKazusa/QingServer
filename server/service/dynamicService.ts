import * as dynamicDao from '../dao/dynamicDao';
import * as userDao from '../dao/userDao';
import * as modal from '../modal';
import * as redisUtil from '../util/connectRedis'
import { findComments } from './commentService';
import { Request, Response } from 'express';
import _ from 'lodash';

const path = new Map();

//获取当前用户的朋友圈,得到一个由get请求的由逗号分割的字符串
const queryFriendsDynamic = async (request: any, response: any) => {
    const { ids } = request.query;
    const idArr = ids.split(',');
    const dynamicArr: any[] = [];

    idArr.forEach(async (id: string) => {
        dynamicDao.findDynamicsByUserId(id, (error: any, result: any) => {
            if (error) {
                console.log(error)
            } else {
                console.log(result);
            }
        })
    })

}

const addDymanicPiture = (request: any, response: any) => {
    const path = request.file ? request.file.path : request.body.file.path;
    dynamicDao.inertDynamicPicture('http://localhost:12306/' + path.slice(7), (err: any, res: any) => {
        if (err) {
            throw err;
        } else {
            response.status(200).send({
                dynamic_id: res.ops[0]._id,
                picture: res.ops[0].picture
            })
        }
    })
}

const insertDynamic = (request: any, response: any) => {
    dynamicDao.insertDynamic(request.body, (result: modal.result) => {
        if (result.error) {
            throw result.error;
        } else {
            response.status(200).send({
                msg: 'success'
            })
        }
    })
}

//根据id数组，获取相应的dynamic_id数组
const getDynamicId = (request: any, response: any) => {
    dynamicDao.findDynamicIdByFriends(request.query.friends.split(','), (result: modal.result) => {
        if (result.error) {
            throw result.error
        } else {
            response.json({
                dynamic_ids: result.result
            })
        }
    })
}

//根据dynamic_id获取相应的数据
const findDynamicById = (request: any, response: any) => {
    dynamicDao.findDynamicById(request.query.dynamic_id, (err: any, res: any) => {
        if (err) {
            throw err
        } else {
            const dynamic = res[0];
            dynamic && redisUtil.getKey(dynamic.user_id, (user: string) => {
                const userData: any = JSON.parse(user);
                dynamic.avatar = userData.avatar;
                dynamic.nickname = userData.nickname;
                dynamic.dynamic_id = dynamic._id;
                findComments(dynamic.dynamic_id, (comments: any[]) => {
                    dynamic.comments = comments;
                    response.json({
                        ...dynamic
                    })
                })
            })

        }
    })
}

//处理点赞接口
const handleLikeDynamic = (request: Request, response: Response) => {
    const { id, like_type, dynamic_id } = request.query;
    dynamicDao.handleLikeDynamic(like_type, dynamic_id, id, (result: modal.result) => {
        if (!result.error) {
            response.send('success');
        } else {
            response.status(500).send('error');
        }
    })
}

//处理收藏动态接口
const handleStarDynamic = (request: Request, response: Response) => {
    const { id, star_type, dynamic_id } = request.query;
    dynamicDao.handleStarDynamic(star_type, dynamic_id, id, (result: modal.result) => {
        if (!result.error) {
            response.send('success');
        } else {
            response.status(500).send('error');
        }
    })
}

//判断数组中是否有空值
const judgeNullItem = (arr: any[]) => {
    if (arr instanceof Array) {
        let flag = true;
        _.each(arr, (item: any) => {
            if(!item) {flag = false} 
        })
        return flag;
    }else {
        return false;
    }
}

//处理获取收藏列表
const getStarList = (request: Request, response: Response) => {
    const { user_id } = request.query;
    const dynamic_arr: any[] = [];
    dynamicDao.queryDynamicMapByUserid(user_id, (dynamic_map: any[]) => {
        const ids = _.map(dynamic_map, (item: any) => item.star)[0];
        if (!ids || ids.length === 0) {
            return response.json({
                list: []
            })
        } else {
            _.each(ids.reverse(), (dynamic_id: string, index: number) => {
                dynamicDao.findDynamicById(dynamic_id, (err: any, res: any) => {
                    if (!err) {
                        const dynamic = res[0];
                        dynamic && redisUtil.getKey(dynamic.user_id, (user: string) => {
                            const userData: any = JSON.parse(user);
                            dynamic.avatar = userData.avatar;
                            dynamic.nickname = userData.nickname;
                            dynamic.dynamic_id = dynamic._id;
                            dynamic_arr[index] = dynamic;
                            if (dynamic_arr.length === ids.length && judgeNullItem(dynamic_arr)) {
                                return response.json({
                                    list: dynamic_arr
                                });
                            }
                        })
                    }
                })
            })
        }
        return;
    });
}

path.set('/api/queryFriendsDynamic', queryFriendsDynamic)
path.set('/api/addDymanicPiture', addDymanicPiture)
path.set('/api/insertDynamic', insertDynamic);
path.set('/api/getDynamicId', getDynamicId);
path.set('/api/findDynamicById', findDynamicById);
path.set('/api/like', handleLikeDynamic);
path.set('/api/star', handleStarDynamic);
path.set('/api/getStarList', getStarList);

export default path;