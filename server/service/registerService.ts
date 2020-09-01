import * as userDao from '../dao/userDao';
import * as groupDao from '../dao/groupDao';
import * as modal from '../modal';
import * as redisUtil from '../util/connectRedis';
import * as tokenUtil from '../util/tokenUtil';
import * as dynamicDao from '../dao/dynamicDao';
import { decrypt } from '../util/crypto';
import { Request, Response } from 'express';

const path = new Map();

const handleRegister = (request: Request, response: Response) => {
    const user = request.body;
    user.password = decrypt(user.password);
    //将id作为key，昵称和头像作为value，存入redis数据库
    const data = JSON.stringify({ nickname: user.nickname, avatar: user.avatar, is_group: user.is_group });
    redisUtil.setKey(user.id, data, (err: any, ele: any) => {
        if (err) {
            throw err;
        } else {
            console.log('one data insert to redis');
        }
    });
    //插入mysql数据库
    userDao.insertUser(user, (result: modal.result) => {
        if (result.error) {
            response.status(500).json({ error: result.error })
        } else if (result.result) {
            //同时初始化该用户的朋友圈，存入MongoDB数据库
            dynamicDao.insertDynamicMap(user.id, () => {
                response.json({ user: result.result, token: tokenUtil.sign(user.id) });
            })
        }
    });
}

path.set('/api/register', handleRegister);


export default path;