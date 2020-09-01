import globalConfig from './config';
import loginService from './service/loginService';
import registerService from './service/registerService';
import userService from './service/userService';
import chatService from './service/chatService';
import baseService from './service/baseService';
import dynamicService from './service/dynamicService';
import groupService from './service/groupService';
import commentService from './service/commentService';
import alertService from './service/alertService';

//整合接口和service
const pathMap = new Map();
const combineService = (map:Map<any,any>) => {
    map.forEach((value,key) => {
        if(!pathMap.get(key)){
            pathMap.set(key,value);
        }else {
            throw Error('path 错误，url:' + key);
        }
    });
}

combineService(loginService);
combineService(registerService);
combineService(userService);
combineService(chatService);
combineService(baseService);
combineService(dynamicService);
combineService(groupService);
combineService(commentService);
combineService(alertService);

export default pathMap;