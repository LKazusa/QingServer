import loader from '../loader';
import * as redisUtil from '../util/connectRedis';
import * as modal from '../modal';
//点赞
export const likeAlert = (alert: modal.alert, io: any) => {
    redisUtil.getKey(alert.from, (user: string) => {
        const userData = JSON.parse(user);
        const nickname = userData.nickname;

        const title = '点赞通知';
        const content = `您的好友${nickname}为您的动态点了赞`;
        io && io.emit('like', { title, content });

        const alertData: modal.alert = {
            type: 'like',
            title,
            from: alert.from,
            to: alert.to,
            content,
            time: new Date().getTime(),
            is_look: io ? true : false,
        };
        //存储斤数据库
        loader.get('insertAlert')(alertData, () => { });
    })
}
//创建群组
// payload:{
//     group_id:string,
//     group_name:string,
//     ids:string[]
// }
export const createGroupAlert = (id: string, alert: modal.alert, io: any) => {
    redisUtil.getKey(alert.from, (user: string) => {
        const userData = JSON.parse(user);
        const nickname = userData.nickname;

        const type = 'addGroup';
        const title = '群组通知';
        const content = `您的好友${nickname}拉您进了群:${alert.payload.group_name}`;
        io && io.emit('createGroup', { title, content, type });

        const alertData: modal.alert = {
            type: 'addGroup',
            title,
            from: alert.from,
            to: id,
            content,
            time: new Date().getTime(),
            is_look: io ? true : false
        };
        //存储斤数据库
        loader.get('insertAlert')(alertData, () => { });
    })
}
//解散群组
export const dismissGroupAlert = (id: string, alert: modal.alert, io: any) => {
    const title = '群组通知';
    const content = `${alert.payload.group_name}已被群主解散`;
    const type = 'dismissGroup'
    io && io.emit('dismissGroup', { title, content, type });

    const alertData: modal.alert = {
        type,
        title,
        from: alert.from,
        to: id,
        content,
        time: new Date().getTime(),
        is_look: io ? true : false
    };
    //存储斤数据库
    loader.get('insertAlert')(alertData, () => { });
}
//添加评论
export const addCommentsAlert = (alert: modal.alert, io: any) => {
    redisUtil.getKey(alert.from, (user: string) => {
        const userData = JSON.parse(user);
        const nickname = userData.nickname;

        const title = '评论通知';
        const content = `您的好友${nickname}给您的动态评论了`;
        io && io.emit('addComments', { title, content });

        const alertData: modal.alert = {
            type: 'comment',
            title,
            from: alert.from,
            to: alert.to,
            content,
            time: new Date().getTime(),
            is_look: io ? true : false,
        };
        //存储斤数据库
        loader.get('insertAlert')(alertData, () => { });
    })
}
//好友申请结果
export const addFriendResultAlert = (alert: modal.alert, io: any, flag: boolean) => {
    redisUtil.getKey(alert.from, (user: string) => {
        const userData = JSON.parse(user);
        const nickname = userData.nickname;

        const title = '好友申请通知';
        const content = flag ? `${nickname}通过了您的好友申请` : `${nickname}拒绝了您的好友申请`;
        io && io.emit('addFriendResult', { title, content });

        const alertData: modal.alert = {
            type: 'addFriendResult',
            title,
            from: alert.from,
            to: alert.to,
            content,
            time: new Date().getTime(),
            is_look: io ? true : false,
        };
        //存储进数据库
        loader.get('insertAlert')(alertData, () => { });
    })
}
//好友申请
export const addFriendAlert = (alert: modal.alert, io: any) => {
    redisUtil.getKey(alert.from, (user: string) => {
        const userData = JSON.parse(user);
        const nickname = userData.nickname;

        const title = '好友申请通知';
        const content = `${nickname}想添加您为好友`;
        io && io.emit('addFriend', {
            title,
            content,
            payload: {
                from: alert.from,
                to: alert.to
            }
        });

        const alertData: modal.alert = {
            type: 'addFriend',
            title,
            from: alert.from,
            to: alert.to,
            content,
            time: new Date().getTime(),
            is_look: false,
            payload: {
                from: alert.from,
                to: alert.to
            }
        };
        //存储进数据库
        loader.get('insertAlert')(alertData, () => { });
    })
}

export const applyJoinGroup = (alert: modal.alert, io: any, callback: Function) => {
    redisUtil.getKey(alert.from, (user: string) => {
        const userData = JSON.parse(user);
        const nickname = userData.nickname;

        const title = '申请加群通知';
        const content = `${nickname}想加入群${alert.payload.group_name}`;
        io && io.emit('applyJoinGroup', {
            title,
            content,
            payload: {
                from: alert.to,
                to: alert.from,
                group_id: alert.payload.group_id,
                group_name: alert.payload.group_name
            }
        });
        callback();
        const alertData: modal.alert = {
            type: 'applyJoinGroup',
            title,
            from: alert.from,
            to: alert.to,
            content,
            time: new Date().getTime(),
            is_look: false,
            payload: {
                from: alert.from,
                to: alert.to,
                group_id: alert.payload.group_id,
                group_name: alert.payload.group_name
            }
        };
        loader.get('insertAlert')(alertData, () => { });
    });
}

export const replyApplyJoin = (alert: modal.alert, io: any) => {
    const title = '申请加群结果通知';
    let content = '';
    if (alert.type === 'agreeJoin') {
        content = `群主已同意您加入群：${alert.payload.group_name}`;
    } else if (alert.type === 'disagreeJoin') {
        content = `群主拒绝您加入群：${alert.payload.group_name}`;
    }
    io && io.emit('replyApplyJoin', {
        title,
        content,
        payload: {
            from: alert.payload.from,
            to: alert.payload.to,
            group_id: alert.payload.group_id,
            group_name: alert.payload.group_name
        },
    });
    const alertData: modal.alert = {
        type: 'replyApplyJoin',
        title,
        from: alert.from,
        to: alert.to,
        content,
        time: new Date().getTime(),
        is_look: io ? true : false,
        payload: {
            from: alert.from,
            to: alert.to
        }
    };
    loader.get('insertAlert')(alertData, () => { });
}

export const deleteFriendAlert = (alert: modal.alert, io: any, callback: Function) => {
    redisUtil.getKey(alert.from, (user: string) => {
        const userData = JSON.parse(user);
        const nickname = userData.nickname;

        const title = '好友解除通知';
        const content = `您与${nickname}的好友状态已被解除`;
        loader.get('deleteFriend')(alert.from, alert.to, (result: modal.result) => {
            if (result.result) {
                loader.get('deleteFriend')(alert.to, alert.from, (result: modal.result) => {
                    if (result.result) {
                        io && io.emit('deleteFriendAlert', {
                            title,
                            content,
                            payload: {
                                from: alert.from,
                                to: alert.to
                            }
                        });
                        callback();
                    }
                })
            }
        })

    });

}