module.exports = function init(site) {

    let mongodb = require('mongodb')
    let mongoClient = mongodb.MongoClient
    let url = site.mongodbURL || '127.0.0.1:27017'

    var xdb = {}
    xdb.lib = mongodb
    xdb.client = mongoClient
    xdb.connection = 'mongodb://' + url

    xdb.connectDB = function (name, callback) {
        xdb.client.connect(xdb.connection + '/' + name, function (err, db) {
            callback(err, db)
        })
    }


    return xdb
}