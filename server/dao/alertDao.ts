import mongoClient from '../util/connectMongo';
import mongo = require('mongodb');
import * as modal from '../modal';

export const insertAlert = (alert: modal.alert, callback: Function) => {
    mongoClient('alert', (result: modal.mongoResult) => {
        if (result.error) {
            throw Error(result.error)
        } else {
            result.collection && result.collection.insertOne(alert, (error: any, result: any) => {
                if (error) {
                    throw error
                } else {
                    callback();
                }
            })
        }
    })
}

export const findAll = (user_id: string, callback: Function) => {
    mongoClient('alert', (result: modal.mongoResult) => {
        if (result.error) {
            throw Error(result.error)
        } else {
            result.collection && result.collection.find({ 'to': user_id }).toArray().then((res: any[]) => {
                callback(res)
            })
        }
    })
}

export const updateAlert = (type: string, alert_id: string, update_item: any, callback: Function) => {
    mongoClient('alert', (result: modal.mongoResult) => {
        if (result.error) {
            throw result.error
        } else {
            result.collection && result.collection.updateOne(
                { _id: new mongo.ObjectID(alert_id) },
                { $set:{
                    [type]: update_item
                } },
                (err: any, res: any) => {
                    if (err) {
                        throw err;
                    } else {
                        callback({ result: res });
                    }
                })
        }
    })
}