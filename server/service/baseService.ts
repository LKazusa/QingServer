import * as redisUtil from '../util/connectRedis';

const path = new Map();

//获取当前的聊天列表，前端通过get请求传过来一个由逗号分割的id字符串
const getChatList = async (request:any,response:any) => {
    const {chatList} = request.query;
    const chatArr:any[] = [];
    if(chatList){
        await chatList.split(',').forEach(async (id:string) => {
            if(id.trim().length > 0){
                await redisUtil.getKey(id,(err:any,value:any) => {
                    if(err){
                        response.status(500);
                        throw err;
                    } 
                    chatArr.push({
                        id:id,
                        ...JSON.parse(value)
                    });
                }); 
            }
        })
    }
    response.json({
        msg:'success',
        chatArr
    })
}

path.set('/api/getchatList',getChatList);
export default path;