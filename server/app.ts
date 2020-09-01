const server = require('http').createServer();
import loader from './loader';
import globalConfig from './config';
const io = require('socket.io')();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
import multer = require('multer');
import * as redisUtil from './util/connectRedis';
import _ from 'lodash';
import path = require('path');
import fs = require('fs');
import * as modal from './modal';
import * as tokenUtil from './util/tokenUtil';
import * as alertUtil from './util/insertAlert';

const app = new express();

//解决post传json问题
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

//解决跨域
app.use(cors());
app.use((req: object, res: any, next: Function) => {
    res.header('Access-Control-Allow-Origin', "http://localhost:8000")
    res.header('Access-Control-Allow-Headers', 'Authorization,X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Referer')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Allow', 'GET, POST, PATCH, OPTIONS, PUT, DELETE')
    next();
});

app.use('/dynamicimg', express.static(path.join(__dirname, 'dynamicimg')));
app.use('/avatar', express.static(path.join(__dirname, 'avatar')));

//处理上传的好友动态的图片
const storage = multer.diskStorage({
    //设置上传后文件路径
    destination: function (req, file, cb) {
        cb(null, './server/dynamicimg')
    },
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
});

//处理修改的头像
const avatarStorage = multer.diskStorage({
    //设置上传后文件路径
    destination: function (req, file, cb) {
        cb(null, './server/avatar')
    },
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        const id = req.body.id;
        //如果当前的头像是默认头像的话，直接写入新头像
        if (req.body.origin.indexOf('https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX') === -1) {
            const oldFile = fs.readFileSync(path.join(__dirname, 'avatar/') + file.fieldname + '-' + id + "." + fileFormat[fileFormat.length - 1]);
            if (oldFile) {
                fs.unlinkSync(path.join(__dirname, 'avatar/') + file.fieldname + '-' + id + "." + fileFormat[fileFormat.length - 1]);
            }
        }
        cb(null, file.fieldname + '-' + id + "." + fileFormat[fileFormat.length - 1]);
    }
});
const uploadSingle = multer({ storage: storage });
const avatarSingle = multer({ storage: avatarStorage });

//拦截，验证token
app.use((req: any, res: any, next: Function) => {
    const url: string = req.originalUrl;
    let flag = false;
    const urlArr = ['/api/register', '/api/login', '/api/addDymanicPiture', '/api/updateAvatar', '/api/uploadMessageImg'];
    urlArr.forEach((ignoreUrl: string) => {
        if (url.indexOf(ignoreUrl) !== -1) {
            flag = true;
        }
    })
    if (flag) {
        next();
    } else {
        const result: any = tokenUtil.verify(req.get('Authorization'));
        if (result.error) {
            res.send("请重新登录");
        } else {
            next();
        }
    }
});

//注册
app.post('/api/register', loader.get('/api/register'));
//登录
app.get('/api/login', loader.get('/api/login'));
//在聊天模块中获取用户和群组的简略信息列表
app.get('/api/getchatList', loader.get('/api/getchatList'));
//查找群组或好友
app.get('/api/queryUserOrGroup', loader.get('/api/queryUserOrGroup'));
//创建群聊
app.post('/api/addGroup', loader.get('/api/addGroup'));
//通过用户id获取好友或者群组详细信息
//在列表界面中使用
app.get('/api/getFriendsByUserId', loader.get('/api/getFriendsByUserId'));
//用户上传动态时上传图片
app.post('/api/addDymanicPiture', uploadSingle.single('picture'), loader.get('/api/addDymanicPiture'));
//用户上传动态
app.post('/api/insertDynamic', loader.get('/api/insertDynamic'));
//根据用户传来的userid数组，返回相应的dynamic_id数组
app.get('/api/getDynamicId', loader.get('/api/getDynamicId'));
//根据dynamic_id查询详细信息
app.get('/api/findDynamicById', loader.get('/api/findDynamicById'));
//根据id数组，返回相应的聊天列表
app.get('/api/queryChatList', loader.get('/api/queryChatList'));
//根据group_id,返回该对话的所有聊天记录
app.get('/api/findChatsByGroupId', loader.get('/api/findChatsByGroupId'));
//获取好友的简略信息
app.get('/api/getFriends', loader.get('/api/getFriends'));
//根据id获取用户详细信息
app.get('/api/getUserById', loader.get('/api/getUserById'));
//根据id获取群组详细信息
app.get('/api/findGroupById', loader.get('/api/findGroupById'));
//添加评论
app.post('/api/addComment', loader.get('/api/addComment'));
//修改用户基本信息
app.post('/api/updateUserData', loader.get('/api/updateUserData'));
//删除某个成员
app.get('/api/deleteMember', loader.get('/api/deleteMember'));
//修改头像
app.post('/api/updateAvatar', avatarSingle.single('picture'), loader.get('/api/updateAvatar'))
//修改密码
app.post('/api/updatePassword', loader.get('/api/updatePassword'));
//发送图片
app.post('/api/uploadMessageImg', uploadSingle.single('picture'), loader.get('/api/uploadMessageImg'));
//解散群聊
app.get('/api/deleteGroup', loader.get('/api/deleteGroup'));
//处理点赞动态
app.get('/api/like', loader.get('/api/like'));
//处理收藏动态
app.get('/api/star', loader.get('/api/star'));
//获取所有alert
app.get('/api/getAllAlert', loader.get('/api/getAllAlert'));
//获取未读的通知
app.get('/api/queryBeforeReadAlert', loader.get('/api/queryBeforeReadAlert'));
//清除未读通知
app.get('/api/readAlert', loader.get('/api/readAlert'));
//获取收藏列表
app.get('/api/getStarList', loader.get('/api/getStarList'));
//根据dynamic_id获取评论
app.get('/api/findComments', loader.get('/api/findComments'));

app.listen(globalConfig.port);

const userSocketsMap = new Map();  //socketid和userid的映射表

io.listen(9191,{origins:'*'});

io.sockets.on('connection', (socket: any) => {
    socket.on('online', (data: any) => {
        if (userSocketsMap.get(data.userId)) {
            userSocketsMap.get(data.userId).emit('otherLogin', '其他人登录了您的账号!');
        }
        userSocketsMap.set(data.userId, socket);

        socket.on('send', (data: modal.sendData) => {
            //将数据存到数据库
            loader.get('insertOneChat')(data, (result: any) => {
                if (result.error) {
                    console.log(result);
                } else {
                    //实时发送到好友的客户端
                    const toPerson = userSocketsMap.get(data.to);
                    if (toPerson) {
                        redisUtil.getKey(data.from, (user: string) => {
                            const userData = JSON.parse(user);
                            const receiveData: modal.receiveData = {
                                id: data.from,
                                nickname: userData.nickname,
                                avatar: userData.avatar,
                                message: data.message,
                                img: data.img,
                                time: data.time
                            };
                            toPerson.emit('sendToPerson', receiveData);
                        });
                    }
                }
            });
        });

        socket.on('join', (group_id: string) => {
            //加入房间
            socket.join(group_id);
        });
        socket.on('sendToGroup', (data: modal.sendData) => {
            redisUtil.getKey(data.from, (user: string) => {
                const userData = JSON.parse(user);
                loader.get('insertOneChat')(data, (res: any) => { });
                const receiveData: modal.receiveData = {
                    id: data.from,
                    nickname: userData.nickname,
                    avatar: userData.avatar,
                    message: data.message,
                    img: data.img,
                    time: data.time
                };
                socket.broadcast.to(data.group_id).emit('groupMessage', receiveData);
            })
        })

        socket.on('leave', (group_id: string) => {
            socket.leave(group_id);
        })
        //点赞通知
        socket.on('like', (likeData: modal.alert) => {
            if (likeData.from !== likeData.to) {
                const io = userSocketsMap.get(likeData.to)
                alertUtil.likeAlert(likeData, io);
            }
        });
        //创建群组通知
        socket.on('createGroup', (alertData: modal.alert) => {
            const { ids } = alertData.payload;
            _.each(ids, (id: string) => {
                const io = userSocketsMap.get(id);
                alertUtil.createGroupAlert(id, alertData, io);
            });
        });
        //解散群组通知
        socket.on('dismissGroup', (alertData: modal.alert) => {
            const { ids } = alertData.payload;
            _.each(ids, (id: string) => {
                if (id) {
                    const io = userSocketsMap.get(id);
                    alertUtil.dismissGroupAlert(id, alertData, io);
                }
            });
        });
        //添加评论通知
        socket.on('addComments', (likeData: modal.alert) => {
            if (likeData.from !== likeData.to) {
                const io = userSocketsMap.get(likeData.to)
                alertUtil.addCommentsAlert(likeData, io);
            }
        });
        //删除好友
        socket.on('deleteFriend', (deleteData: modal.alert, callback: Function) => {
            if (deleteData.from !== deleteData.to) {
                const io = userSocketsMap.get(deleteData.to)
                alertUtil.deleteFriendAlert(deleteData, io, callback);
            }
        });
        //添加好友
        socket.on('sendAddFriend', (likeData: modal.alert, callback: Function) => {
            if (likeData.from !== likeData.to) {
                const io = userSocketsMap.get(likeData.to)
                alertUtil.addFriendAlert(likeData, io);
            }
            callback();
        });
        //同意添加好友
        socket.on('agreeAddFriend', (addFriendData: modal.alert, callback: Function) => {
            const { to: from, from: to } = addFriendData.payload;
            const io = userSocketsMap.get(to);
            loader.get('addFriend')(from, to, () => {
                alertUtil.addFriendResultAlert({ to, from }, io, true);
                callback();
            });
        })
        //拒绝添加好友
        socket.on('disagreeAddFriend', (addFriendData: modal.alert) => {
            const { to: from, from: to } = addFriendData.payload;

            const io = userSocketsMap.get(to);
            alertUtil.addFriendResultAlert({ to, from }, io, false);
        });
        //用户申请加入群组
        socket.on('userApplyJoinGroup', (applyJoinData: modal.alert, callback: Function) => {
            const io = userSocketsMap.get(applyJoinData.to)
            alertUtil.applyJoinGroup(applyJoinData, io, callback);
        });
        //群主对于申请加群的回复
        socket.on('replyApplyJoin', (replayApplyJoinData: modal.alert, callback: Function) => {
            const io = userSocketsMap.get(replayApplyJoinData.payload.to);
            const user_id = replayApplyJoinData.payload.to;
            const { group_id } = replayApplyJoinData.payload;
            if (replayApplyJoinData.type === 'agreeJoin') { //同意加群
                loader.get('userAddGroup')(user_id, group_id, (result: modal.result) => {
                    if (!result.error) {
                        callback();
                        alertUtil.replyApplyJoin(replayApplyJoinData, io);
                    }
                });
            } else if (replayApplyJoinData.type === 'disagreeJoin') { //拒绝加群
                alertUtil.replyApplyJoin(replayApplyJoinData, io);
            }
        });

        //监听用户下线，同时更新socketMap
        socket.on('disconnect', () => {
            userSocketsMap.set(data.userId, null);
            console.log('disconnect socketio');
        });
    })
})