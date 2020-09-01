import createConnection from '../util/connectMySql';
import * as userDao from './userDao';
import * as modal from '../modal';
import mongoClient from '../util/connectMongo';
import * as redisUtil from '../util/connectRedis';
import _ from 'lodash';

//创建群组
export const InsertGroup = (group: modal.groupItem, callback: Function) => {
    let insertSql = 'insert into qingliao.`group` (id,group_name,lead_id,member,time,avatar) values (?,?,?,?,?,?)';
    const insertArr = [group.id, group.group_name, group.lead_id, group.member, group.time, group.avatar || ''];

    const connection = createConnection();
    connection.connect();
    connection.query(insertSql, insertArr, (error: any, result: modal.result) => {
        if (error) {
            throw error;
        } else {
            callback(result);
        }
    });
}
//根据name或者id查找群组
export const queryGroupByName = (type: 'group_name' | 'id', name: string, callback: Function) => {
    let querySql = 'select * from qingliao.`group` where ' + type + ' like ?';
    const queryArr = ["%" + name + "%"];

    const connection = createConnection();
    connection.query(querySql, queryArr, (err: any, result: modal.result) => {
        if (!err) {
            callback({ result: result });
        } else {
            callback({ error: err });
        }
    })
}

export const addGroup = (group: modal.group, callback: Function) => {
    mongoClient('chatMap', (result: modal.mongoResult) => {
        if (result.error) {
            throw result.error
        } else {
            result.collection && result.collection.insertOne(group, callback);
        }
    })
}

export const queryGroupById = (id: string, callback: Function) => {
    let sql = 'select * from qingliao.`group` where id = ?';

    const connection = createConnection();
    connection.connect();
    connection.query(sql, [id], (error: any, result: any) => {
        if (error) {
            throw error
        } else {
            const group = result[0];
            if (!group) {
                callback({});
                return;
            }
            const ids = group.member.split(',').filter((ele: string) => ele);
            group.member = [];
            redisUtil.mget(ids, (resultArr: any[]) => {
                _.map(resultArr, (userStr: string, index: number) => {
                    group.member.push({ id: ids[index], ...JSON.parse(userStr) });
                })
                callback(group);
            });
        }
    });
}

export const updateGroup = (type: 'group_name' | 'member' | 'avatar', id: number, updateArr: any[], callback: Function) => {
    let sql = 'update qingliao.`group` set ' + type + '=? where id = ?';
    const connection = createConnection();
    connection.connect();
    connection.query(sql, updateArr.concat(id), (error: any, result: any) => {
        if (error) {
            callback({ error })
        } else {
            callback({ result })
        }
    })
}

export const deleteGroup = (group_id: string, callback: Function) => {
    let sql = 'delete from qingliao.`group` where id = ?';
    const connection = createConnection();
    connection.connect();
    connection.query(sql, [group_id], (error: any, result: any) => {
        if (error) {
            callback({ error: error })
        } else {
            callback({ result: result })
        }
    });
}

//添加群成员
export const insertUserToGroup = (group_id: string, user_id: string, callback: Function) => {
    let sql = 'update qingliao.`group` set member = concat(member, ?) where id = ?';

    const connection = createConnection();
    connection.connect();
    connection.query(sql, [',' + user_id, group_id], (error: any, result: any) => {
        if (error) {
            callback({ error: error })
        } else {
            callback({ result: result })
        }
    });
}