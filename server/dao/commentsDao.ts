import mongoClient from '../util/connectMongo';
import * as modal from '../modal';

export const findCommentsByDynamicId = (dynamic_id:string,callback:Function) => {
    mongoClient('comments',(result:modal.mongoResult) => {
        if(result.error){
            throw Error(result.error)
        }else {
            result.collection && result.collection.find({"dynamic_id":dynamic_id}).toArray().then((res:any[]) => {
                callback(res)
            });
        }
    })
}

export const insertOneComment = (commentItem:modal.commentItem,callback:Function) => {
    mongoClient('comments',(result:modal.mongoResult) => {
        if(result.error){
            throw Error(result.error)
        }else {
            result.collection && result.collection.insertOne(commentItem,callback);
        }
    })
}
