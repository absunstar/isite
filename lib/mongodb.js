module.exports = function init(site) {

    let mongodb = require('mongodb')
    let mongoClient = mongodb.MongoClient

    let url = site.options.mongodb.url + ':' + site.options.mongodb.port
    if (site.options.mongodb.userName && site.options.mongodb.password) {
        url = site.options.mongodb.userName + ':' + site.options.mongodb.password + '@' + site.options.mongodb.url + ':' + site.options.mongodb.port
    }

    var _mongo = {}
    _mongo.lib = mongodb
    _mongo = mongodb.ObjectID
    _mongo.client = mongoClient
    _mongo.connection = 'mongodb://' + url

    //ulimit -n 10000
    _mongo.dbList = []

    _mongo.connectDB = function (name, callback) {
        _mongo.client.connect(_mongo.connection + '/' + name + '?maxPoolSize=0', function (err, db) {
            callback(err, db)
        })
    }

    _mongo.insertOneAsyncBusy = false
    _mongo.insertOneAsyncList = []
    _mongo.insertOneAsync = function (obj, callback) {
        if (obj) {
            _mongo.insertOneAsyncList.push({
                obj: obj,
                callback: callback
            })
            _mongo.insertOneAsync(null)
        } else {

            if (_mongo.insertOneAsyncBusy) {
                return
            }

            var _obj = _mongo.insertOneAsyncList[0]
            if (_obj) {
                _mongo.insertOneAsyncBusy = true
                _mongo.insertOne(_obj.obj, function (err, obj) {
                    _mongo.insertOneAsyncList.splice(0, 1)
                    _obj.callback(err, obj)
                    _mongo.insertOneAsyncBusy = false
                    _mongo.insertOneAsync(null)
                })
            }
        }
    }

    _mongo.insertOne = function (obj, callback) {

        _mongo.connectDB(obj.dbName, function (err, db) {
            if (!err) {
                db.collection(obj.collectionName).insertOne(obj.doc, function (err, result) {
                    db.close()
                    if (!err) {
                        callback(null, result.ops[0])
                    } else {
                        callback(err)
                    }
                })
            } else {
                callback(err)
            }
        })
    }


    _mongo.insert = _mongo.insertMany = function (obj, callback) {

        _mongo.connectDB(obj.dbName, function (err, db) {
            if (!err) {
                db.collection(obj.collectionName).insertMany(obj.docs, function (err, result) {
                    db.close()
                    if (!err) {
                        callback(null, result)
                    } else {
                        callback(err)
                    }
                })
            } else {
                callback(err)
            }
        })
    }


    _mongo.findOne = function (obj, callback) {

        _mongo.connectDB(obj.dbName, function (err, db) {
            if (!err) {
                db.collection(obj.collectionName).findOne(obj.where, obj.select, function (err, doc) {
                    db.close()
                    if (!err) {
                        callback(null, doc)
                    } else {
                        callback(err)
                    }
                })
            } else {
                callback(err)
            }
        })
    }

    _mongo.find = _mongo.findMany = function (obj, callback) {
        _mongo.connectDB(obj.dbName, function (err, db) {
            if (!err) {
                db.collection(obj.collectionName).find(obj.where, obj.select).toArray(function (err, docs) {
                    db.close()
                    if (!err) {
                        callback(null, docs)
                    } else {
                        callback(err)
                    }
                })
            } else {
                callback(err)
            }
        })
    }



    _mongo.updateOne = function (obj, callback) {

        _mongo.connectDB(obj.dbName, function (err, db) {
            if (!err) {
                db.collection(obj.collectionName).updateOne(obj.where, {
                    $set: obj.set
                }, function (err, result) {
                    db.close()
                    if (!err) {
                        callback(null, {
                            count: result.result.nModified,
                            ok: result.result.ok
                        }, result)
                    } else {
                        callback(err)
                    }
                })
            } else {
                callback(err)
            }
        })
    }


    _mongo.update = _mongo.updateMany = function (obj, callback) {

        _mongo.connectDB(obj.dbName, function (err, db) {
            if (!err) {
                db.collection(obj.collectionName).updateMany(obj.where, {
                    $set: obj.set
                }, function (err, result) {
                    db.close()
                    if (!err) {
                        callback(null, {
                            count: result.result.nModified,
                            ok: result.result.ok
                        }, result)
                    } else {
                        callback(err)
                    }
                })
            } else {
                callback(err)
            }
        })
    }

    _mongo.deleteOne = function (obj, callback) {

        _mongo.connectDB(obj.dbName, function (err, db) {
            if (!err) {
                db.collection(obj.collectionName).deleteOne(obj.where, function (err, result) {
                    db.close()
                    if (!err) {
                        callback(null, {
                            count: result.deletedCount,
                            ok: result.result.ok
                        }, result)
                    } else {
                        callback(err)
                    }
                })
            } else {
                callback(err)
            }
        })
    }

    _mongo.delete = _mongo.deleteMany = function (obj, callback) {

        _mongo.connectDB(obj.dbName, function (err, db) {
            if (!err) {
                db.collection(obj.collectionName).deleteMany(obj.where, function (err, result) {
                    db.close()
                    if (!err) {
                        callback(null, {
                            count: result.deletedCount,
                            ok: result.result.ok
                        }, result)
                    } else {
                        callback(err)
                    }
                })
            } else {
                callback(err)
            }
        })
    }


    return _mongo
}