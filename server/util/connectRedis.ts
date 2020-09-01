import redis = require("redis");

const port = 6379;
const host = '127.0.0.1';
const password = '123456';

export const setKey = (key: string, value: string, callback: any) => {
    const client = redis.createClient(port, host);
    client.auth(password);
    client.on("connect", () => {
        client.set(key, value, redis.print);
    });
};

export const getKey = async (key: any, callback: any) => {
    const client = redis.createClient(port, host);
    await client.auth(password);
    await client.on('connect', async () => {
        await client.get(key, (error: any, value: any) => {
            if (error) {
                throw error;
            } else {
                callback(value);
                client.quit();
            }
        });
    })
}

export const hset = (hash: any, key: any, value: any, callback: any) => {
    const client = redis.createClient(port, host);
    client.auth(password);
    client.on('connect', () => {
        client.hset(hash, key, value, callback);
    })
}
export const hget = (hash: any, key: any, callback: any) => {
    const client = redis.createClient(port, host);
    client.auth(password);
    client.on('connect', () => {
        client.hget(hash, key, callback);
    })
}
export const hgetall = (hash: any, callback: any) => {
    const client = redis.createClient(port, host);
    client.auth(password);
    client.on('connect', () => {
        client.hgetall(hash, callback);
    })
}
export const hmset = (hash: any, paramArr: any, callback: any) => {
    const client = redis.createClient(port, host);
    client.auth(password);
    client.on('connect', () => {
        client.hmset(hash, ...paramArr, callback);
    })
}
export const mget = (keys: string[], callback: Function) => {
    const client = redis.createClient(port, host);
    client.auth(password);
    client.on('connect', () => {
        client.mget(keys, (error: any, value: any) => {
            if (error) {
                throw error
            } else {
                callback(value);
                client.quit();
            }
        })
    })
}

/*
    id:string : {
        is_group:boolean
        avatar:string,
        nickname:string,
    }
*/