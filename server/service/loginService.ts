import * as userDao from '../dao/userDao';
import * as modal from '../modal';
import * as tokenUtil from '../util/tokenUtil';
import {decrypt} from '../util/crypto'

const path = new Map();

const handleLogin = (request:any,response:any) => {
    let {username,password} = request.query;
    password = decrypt(password);
    userDao.queryUserByType('username',username,async (result:modal.result) =>{
        if(result.error){
            response.send(500);
            throw result.error;
        }else if(result.result[0]) {
            if(result.result[0].password === password){
                delete result.result[0].password
                result.result[1] = tokenUtil.sign(result.result[0].id); 
                response.json({
                    msg:'success',
                    ...result.result
                });
            }else {
                response.json({
                    errorMsg:'用户名或密码错误'
                });
            }
        }
    })
}
path.set('/api/login',handleLogin);

export default path;