import createConnection from '../util/connectMySql';
import * as modal from '../modal';

export const insertUser = (user: modal.userData, callback: Function) => {
    let insertSql = 'insert into user (id,username,avatar,nickname,password,is_admin,phone,email) values (?,?,?,?,?,?,?,?);';
    const params = [user.id, user.username, user.avatar, user.nickname, user.password, user.is_admin || 0, user.phone || null, user.email];

    const connection = createConnection();
    connection.connect();
    connection.query(insertSql, params, (error: any, result: Object) => {
        if (!error) {
            callback({
                result: result
            })
        } else {
            callback({
                error: error
            })
        }
    });
    connection.end();
}

//根据id或者用户名或者姓名查询用户
//type : nickname/username/id
export const queryUserByType = (type: 'id' | 'username' | 'nickname', params: string | number[], callback: Function) => {
    let querySql = `select * from user where ${type} = ?;`;
    const connection = createConnection();
    connection.connect();
    connection.query(querySql, params, (error: any, result: Object) => {
        if (!error) {
            callback({
                result: result
            })
        } else {
            callback({
                error: error
            })
        }
    })
    connection.end();
}
//根据id或者用户名或者姓名进行模糊查询用户
//type : nickname/username/id
export const queryUserByTypeUseLike = (type: 'id' | 'username' | 'nickname', params: string, callback: Function) => {
    let querySql = `select * from user where ${type} like ?;`;
    const queryArr = ['%' + params + '%']
    const connection = createConnection();
    connection.connect();

    connection.query(querySql, queryArr, (error: any, result: Object) => {
        if (!error) {
            callback({
                result: result
            })
        } else {
            callback({
                error: error
            })
        }
    })
    connection.end();
}


//自定义修改
const changeUser = (sql: string, params: string | number[], callback: Function) => {
    const connection = createConnection();
    connection.connect();
    connection.query(sql, params, (error: any, result: Object) => {
        if (!error) {
            callback({
                result: result
            })
        } else {
            callback({
                error: error
            })
        }
    })
    connection.end();
}

export const addFriend = (user_id: string, friend_id: string, callback: Function) => {
    let sql = `update user set friends = ? where id = ?`;

    queryUserByType('id', user_id, (result: modal.result) => {
        if (result.error) {
            throw result.error;
        } else if (result.result[0]) {
            let friendStr = result.result[0].friends;
            if (friendStr) {
                friendStr += ',' + friend_id;
            } else {
                friendStr = friend_id;
            }
            changeUser(sql, [friendStr, user_id], (result: modal.result) => {
                if (result.error) {
                    throw result.error
                } else {
                    callback(result.result);
                }
            })
        }
    })
}

export const queryGroupById = (id: string, callback: Function) => {
    let sql = `select * from user where id = ?`;
    const connection = createConnection();
    connection.connect();

    connection.query(sql, [id], (error: any, result: Object) => {
        if (!error) {
            callback({
                result: result
            })
        } else {
            callback({
                error: error
            })
        }
    })
}

export const updateGroup = (user_id: string, group: string, callback: Function) => {
    let sql = `update user set user.group = ? where user.id = ?`;
    const connection = createConnection();
    connection.connect();

    connection.query(sql, [group, user_id], (error: any, result: Object) => {
        if (!error) {
            callback({
                result: result
            })
        } else {
            callback({
                error: error
            })
        }
    })
}

export const updateUser = (user_id: string, type: modal.updateType, updateItem: string, callback: Function) => {
    let sql = `update user set user.${type} = ? where user.id = ?`;
    const connection = createConnection();

    connection.connect();

    connection.query(sql, [updateItem, user_id], (error: any, result: any) => {
        if (!error) {
            callback({
                result: result
            })
        } else {
            callback({
                error: error
            })
        }
    });
}

export const deleteLeadUserData = (id: string,group: string, callback: Function) => {
    let sql = 'update user set user.group = ? where user.id = ?';
    const connection = createConnection();

    connection.connect();

    connection.query(sql, [group, id], (error: any, result: any) => {
        if (!error) {
            callback({ result })
        } else {
            callback({ error })
        }
    });
}
//加入某群
export const userJoinGroup = (user_id: string, group_id: string, callback: Function) => {
    let sql = 'update user set user.group = concat(user.group, ?) where id = ?';
    const connection = createConnection();

    connection.connect();
    connection.query(sql, [',' + group_id, user_id], (error: any, result: any) => {
        if (!error) {
            callback({ result })
        } else {
            callback({ error })
        }
    });
}