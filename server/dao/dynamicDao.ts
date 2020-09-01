import mongoClient from '../util/connectMongo';
import * as modal from '../modal';
import mongo = require('mongodb');
import { threadId } from 'worker_threads';

export const insertDynamic = (dynamicItem: modal.dynamicItem, callback: Function) => {
    mongoClient('dynamic', (result: modal.mongoResult) => {
        if (result.error) {
            throw Error(result.error)
        } else {
            result.collection && result.collection.insertOne(dynamicItem, (error: any, dynamic_res: any) => {
                if (error) {
                    throw error
                } else {
                    //添加每个用户的user_id和dynamic_id的映射表
                    mongoClient('dynamicMap', (result: modal.mongoResult) => {
                        if (result.error) {
                            throw Error(result.error)
                        } else {
                            mongoClient('dynamicMap', (result: modal.mongoResult) => {
                                if (!result.error) {
                                    result.collection.update(
                                        { 'user_id': dynamicItem.user_id },
                                        { '$push': { 'dynamic_ids': dynamic_res.ops[0]._id } },
                                        (err: any, res: any) => {
                                            if (err) {
                                                throw err;
                                            } else {
                                                callback({ result: res });
                                                console.log('添加动态map成功')
                                            }
                                        })
                                }
                            })


                        }
                    });
                }
            });
        }
    })

}

export const insertDynamicMap = (user_id: string, callback: Function) => {
    mongoClient('dynamicMap', (result: modal.mongoResult) => {
        if (result.error) {
            throw Error(result.error)
        } else {
            result.collection.insertOne({ 'user_id': user_id }, (error: any, res: any) => {
                if (!error) { 
                    callback();
                }
            });
        }
    })
}

export const inertDynamicPicture = (filePath: string, callback: Function) => {
    mongoClient('dynamic', (result: modal.mongoResult) => {
        if (result.error) {
            throw Error(result.error)
        } else {
            result.collection && result.collection.insertOne({
                picture: filePath,
            }, callback);
        }
    })
}

export const findDynamicsByUserId = (user_id: string, callback: Function) => {
    mongoClient('dynamic', (result: modal.mongoResult) => {
        if (result.error) {
            throw Error(result.error);
        } else {
            result.collection && result.collection.find({ "user_id": user_id }).toArray(callback);
        }
    })
}

export const deleteDynamicById = (dynamic_id: string, callback: Function) => {
    mongoClient('dynamic', (result: modal.mongoResult) => {
        if (result.error) {
            throw Error(result.error);
        } else {
            result.collection && result.collection.deleteOne({ "_id": dynamic_id }, callback);
        }
    })
}

export const findDynamicIdByFriends = (ids: string[], callback: Function) => {
    let dynamic_ids: any[] = [];
    ids.forEach((id: string, index: number) => {
        if (id) {
            mongoClient('dynamicMap', (result: modal.mongoResult) => {
                if (result.error) {
                    throw result.error
                } else {
                    result.collection && result.collection.find({ 'user_id': id }).toArray((err: any, result: any) => {
                        if (result.length > 0 && result[0].dynamic_ids) {
                            dynamic_ids = dynamic_ids.concat(result[0].dynamic_ids);
                        }
                        if (index === ids.length - 1) {
                            callback({ result: dynamic_ids });
                        }
                    });
                }
            })
        }
    });
}

export const findDynamicById = (id: string, callback: Function) => {
    mongoClient('dynamic', (result: modal.mongoResult) => {
        if (result.error) {
            throw result.error
        } else {
            result.collection && result.collection.find({ '_id': new mongo.ObjectID(id) }).toArray(callback);
        }
    })
}

export const handleLikeDynamic = (type: '0' | '1', dynamic_id: string, id: string, callback: Function) => {
    mongoClient('dynamic', (result: modal.mongoResult) => {
        if (result.error) {
            throw result.error
        } else {
            if (type == '1') { //点赞
                result.collection.updateOne(
                    { '_id': new mongo.ObjectID(dynamic_id) },
                    { '$push': { 'like': id } },
                    (err: any, res: any) => {
                        if (err) {
                            throw err;
                        } else {
                            callback({ result: res });
                        }
                    })
            } else { //取消点赞
                result.collection.updateOne(
                    { '_id': new mongo.ObjectID(dynamic_id) },
                    { '$pull': { 'like': id } },
                    (err: any, res: any) => {
                        if (err) {
                            throw err;
                        } else {
                            callback({ result: res });
                        }
                    })
            }

        }
    })
}

//收藏或取消收藏
const changeUserStarList = (type: '0' | '1', dynamic_id: string, id: string, callback: Function) => {
    mongoClient('dynamicMap', (result: modal.mongoResult) => {
        if (result.error) {
            throw result.error
        } else {
            if (type == '1') { //收藏
                result.collection.updateOne(
                    { 'user_id': id },
                    { '$push': { 'star': dynamic_id } },
                    (err: any, res: any) => {
                        if (err) {
                            throw err;
                        } else {
                            callback({ result: res });
                        }
                    })
            } else { //取消收藏
                result.collection.updateOne(
                    { 'user_id': id },
                    { '$pull': { 'star': dynamic_id } },
                    (err: any, res: any) => {
                        if (err) {
                            throw err;
                        } else {
                            callback({ result: res });
                        }
                    })
            }
        }
    })
}

export const handleStarDynamic = (type: '0' | '1', dynamic_id: string, id: string, callback: Function) => {
    mongoClient('dynamic', (result: modal.mongoResult) => {
        if (result.error) {
            throw result.error
        } else {
            if (type == '1') { //点赞
                result.collection.updateOne(
                    { '_id': new mongo.ObjectID(dynamic_id) },
                    { '$push': { 'star': id } },
                    (err: any, res: any) => {
                        if (err) {
                            throw err;
                        } else {
                            changeUserStarList('1', dynamic_id, id, callback);
                        }
                    })
            } else { //取消点赞
                result.collection.updateOne(
                    { '_id': new mongo.ObjectID(dynamic_id) },
                    { '$pull': { 'star': id } },
                    (err: any, res: any) => {
                        if (err) {
                            throw err;
                        } else {
                            changeUserStarList('0', dynamic_id, id, callback);
                        }
                    })
            }
        }
    })
}

//获取收藏列表ids
export const queryDynamicMapByUserid = (user_id: string, callback: Function) => {
    mongoClient('dynamicMap', (result: modal.mongoResult) => {
        if (!result.error) {
            result.collection && result.collection.find({ user_id }).toArray((err: any, result: any) => {
                if (!err) {
                    callback(result)
                } else {
                    throw err;
                }
            });
        }
    })
}