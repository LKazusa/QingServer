const fs = require('fs');
const globalConfig:any = {};
const conf = fs.readFileSync("./server.conf");
const confArr = conf.toString().split('\r\n');

confArr.forEach((element: string) => {
    const con:string[] = element.split('=');
    globalConfig[con[0]] = con[1].trim();
});

export default globalConfig;