module.exports = function init(site) {

    let mongodb = require('mongodb')
    let mongoClient = mongodb.MongoClient
    let url = site.dbURL || '127.0.0.1:27017'
    let dbConnection = 'mongodb://' + url

    mongo = {}

    mongo.getDb = function (name, callback) {
        mongoClient.connect(dbConnection + '/' + name, function (err, db) {
            callback(err, db)
        })
    }


    return mongo
}