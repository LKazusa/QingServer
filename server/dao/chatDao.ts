import mongoClient from '../util/connectMongo';
import * as modal from '../modal';

/*
    QingLiao 库
    chat :collection : [
        {
            group_id: string,
            from: string,
            to: string,
            content:string,
            time :number
        }
    ]
*/

//根据group_id来找到某个聊天室的全部内容
export const findChat = (group_id:number,callback:Function) => {
    mongoClient('chat', (result:modal.mongoResult) => {
        if (result.error) {
            throw new Error(result.error);
        } else {
            result.collection && result.collection.find({"group_id": group_id}).toArray().then((res:any[]) => {
                callback(res)
            });
        }
    });
}

//将聊天记录插入到指定的聊天室内
export const insertToChat = (chatItem:modal.sendData,callback:Function) => {
    mongoClient('chat', (result:modal.mongoResult) => {
        if (result.error) {
            throw new Error(result.error);
        } else {
            result.collection && result.collection.insertOne(chatItem, callback);
        }
    });
}

export const queryChatMapById = (id:string, callback:Function) => {
    mongoClient('chatMap',(result:modal.mongoResult) => {
        if(result.error){
            throw result.error
        }else{
            result.collection && result.collection.find({'user_id':id}).toArray().then((res:any) => {
                callback(res);
            });
        }
    })
}

//添加好友时，更新chatmap
export const addChatMapToFriend = (user_id:string,friend_id:string,group_id:string,callback:Function) => {
    mongoClient('chatMap',(result:modal.mongoResult) => {
        if(result.error){
            throw result.error
        }else {
            result.collection && result.collection.insertOne({
                user_id,
                friend_id,
                group_id,
                is_group:false,
            },callback);
        }
    })
}