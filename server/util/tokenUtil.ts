import jwt from 'jsonwebtoken';
import fs = require('fs');
import * as redisUtil from './connectRedis';

const privateKey = fs.readFileSync(__dirname + '/config/private.key');
const publicKey = fs.readFileSync(__dirname + '/config/public.key');

//生成token
export const sign = (user_id:string) => {
    const token = jwt.sign({user_id:user_id},privateKey,{ algorithm: 'RS256',expiresIn:60*60*24 });
    redisUtil.hset('token',user_id,token,(error:any,result:any) => {

    });
    return token;
}

//token验证
export const verify = (token:string) => {
    try {
       return jwt.verify(token,publicKey,(error:any,decoded:any) => {
            if(error) {
                return {error:error}
            }else{
                return {result:decoded}
            }
        }) 
    } catch (error) {
        
    }
}
