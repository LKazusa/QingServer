import * as chatDao from '../dao/chatDao';
import * as redis from '../util/connectRedis';
import * as modal from '../modal';
import _ from 'lodash';
import { Request, Response } from 'express';
const path = new Map();

const insertOneChat = (chatItem:modal.sendData,callback:Function) => {
    chatDao.insertToChat(chatItem,(err:any,result:any) => {
        if(!err){
            callback(result.ops[0]);
        }
    })
}

const findChatsByGroupId = (request:any,response:any) => {
    const group_id = request.query.group_id;
    chatDao.findChat(group_id,(result:any) => {
            const chat_list:any[] = [];
            if(result.length === 0) {
                response.json({result:[]});
            }else{
                result.forEach((ele:any,index:number) => {
                    redis.getKey(ele.from,(item:string) => {
                        const temp = JSON.parse(item);
                        chat_list.push({
                            nickname:temp.nickname,
                            id:ele.from,
                            avatar:temp.avatar,
                            time:parseInt(ele.time),
                            img: ele.img,
                            message:ele.message
                        })
                        if(index === result.length - 1){
                            response.json({result:_.orderBy(chat_list,['time'],'asc')});
                        }
                    })
                });
            }
            

    })
}

//获取聊天列表，包含好友和群组，ids是好友和群组的ids字符串
const queryChatList = (req:any,res:any) => {
    const {ids,user_id} = req.query;
    let result:any[] = [];
    if(ids.length > 0){
        ids.split(',').forEach((id:string,index:number) => {
            id && redis.getKey(id,(value:any) =>{
                if(value){
                    let temp = JSON.parse(value);
                    temp.id = id;
                    result.push(temp);
                }
                if(index == ids.split(',').length - 1){
                    chatDao.queryChatMapById(user_id+'',(data:any) => {
                        res.json({
                            chat_list: result,
                            group_map: data
                        })
                    })
                }
            })
        })
    }
}

const uploadMessageImg = (request:Request,response:Response) => {
    const path = request.file ? request.file.path : request.body.file.path;
    response.send('http://localhost:12306/' + path.slice(7));
}

path.set('insertOneChat',insertOneChat);
path.set('/api/findChatsByGroupId',findChatsByGroupId);
path.set('/api/queryChatList',queryChatList);
path.set('/api/uploadMessageImg',uploadMessageImg);
export default path;