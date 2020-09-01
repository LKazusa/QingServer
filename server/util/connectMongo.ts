const client = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

function mongoConnect (collection:string, callback:Function) {
    client.connect(url,function(err:any, db:any){
        if(!err){
            const database = db.db('qingliao');
            callback({
                error: false,
                collection: database.collection(collection)
            });
            db.close();
        }else{
            callback({
                error:err
            })
        }
    });
}
export default mongoConnect;