export interface result {
    result?:any,
    error?:any
}
export interface mongoResult {
    collection?:any,
    error?:any
}

//前端发送的群组信息
export interface group {
    lead_id:string,
    member_ids:string[],
    group_name:string,
    group_id:string,
    is_group:boolean
}
//存储进数据库的群组信息
export interface groupItem {
    id:string,
    group_name:string,
    lead_id:string,
    member:string,
    time:string,
    avatar?:string
}

//用户发送的消息
export interface sendData {
    group_id:string,
    from : string,
    to: string,
    time: number,
    img:string,
    message: string,
    type?: 'picture' | 'file'
}
//推送给用户的消息
export interface receiveData {
    id?: string,
    nickname?: string,
    avatar?: string,
    message?: string,
    img:string,
    time?:number
}

//用户对象
export interface userData {
    id:string,
    username:string,
    phone:string,
    sign:string,
    avatar:string,
    email:string,
    is_admin:number,
    nickname:string,
    password:string
}

//评论对象
export interface commentItem {
    user_id:string,
    dynamic_id:string,
    at?:string,
    message:string,
    avatar?:string,
    nickname:string,
    time:number,
}

//用户动态对象
export interface dynamicItem{
    user_id : string,
    picture:string,
    content:string,
    time:number,
    like:string[],
    comments:string[],
}

//更新用户的字段
export type updateType = 'nickname' | 'password' | 'avatar' | 'sign' | 'phone' | 'email' | 'group' | 'friends';

export interface updateItem{
    id:string,
    type:updateType,
    message:string
}

//token错误
export interface tokenError {
    name:string,
    message:string,
    expiredAt:string
}

//解码后的token
export interface token {
    user_id:string,
    iat:number,
    exp:number
}

//推送通知
export interface alert {
    type?:string,
    title?:string, 
    from:string,
    to:string,
    content?:string,
    is_look?:boolean,
    time?:number,
    payload?:any
}

export interface likeData {
    dynamic_id:string,
    from:string,
    to:string,
}

export interface applyJoin{
    user_id:string,
    group_id:string,
    group_name:string,
    state:'apply' | 'agree' | 'disagree'
}