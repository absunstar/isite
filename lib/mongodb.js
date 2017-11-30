module.exports = function init(site) {
  let mongodb = require("mongodb")
  let mongoClient = mongodb.MongoClient

  let url = site.options.mongodb.url + ":" + site.options.mongodb.port
  if (site.options.mongodb.userName && site.options.mongodb.password) {
    url = site.options.mongodb.userName + ":" + site.options.mongodb.password + "@" + site.options.mongodb.url + ":" + site.options.mongodb.port
  }

  var _mongo = function () {}
  _mongo.lib = mongodb
  _mongo = mongodb.ObjectID
  _mongo.client = mongoClient
  _mongo.connection = "mongodb://" + url
  _mongo.collections_indexed = []

  //ulimit -n 10000
  _mongo.dbList = []

  _mongo.connections = []

  _mongo.connectDB = function (name, callback) {
    if (name === undefined) {
      name = site.options.mongodb.db
    }
    if (site.options.mongodb.enabled) {
      if (_mongo.connections[name]) {
        callback(null, _mongo.connections[name])
      } else {
        _mongo.client.connect(_mongo.connection + "/" + site.options.mongodb.prefix.db + name + "", function (err, db) {
          if (!err) {
            _mongo.connections[name] = db
          } else {
            site.log(err)
          }
          callback(err, db)
        })
      }

    } else {
      callback({
          message: "mongodb Not Enabled"
        },
        null
      )
    }
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
        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }

        let req = obj.doc.$req
        let res = obj.doc.$res

        delete obj.doc.$req
        delete obj.doc.$res
      
        db.collection(site.options.mongodb.prefix.collection + obj.collectionName).insertOne(obj.doc, function (err, result) {
        
          if (!err) {
            if (callback) {
              callback(null, result.ops[0])
            }
            if(site.mongodb.after_insert){
              setTimeout(() => {
                site.mongodb.after_insert(obj.collectionName , result.ops[0] , req , res)
              }, 100);
             
            }
          } else {
            if (callback) {
              callback(err)
            }
            site.log(err)
          }
        })
      } else {
        if (callback) {
          callback(err)
        }
        site.log(err)
      }
    })
  }

  _mongo.insert = _mongo.insertMany = function (obj, callback) {
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }
        db.collection(site.options.mongodb.prefix.collection + obj.collectionName).insertMany(obj.docs, function (err, result) {
          
          if (!err) {
            callback(null, result)
            if(site.mongodb.after_insertMany){
              site.mongodb.after_insertMany(obj.collectionName , obj.docs)
            }
          } else {
            callback(err)
            site.log(err)
          }
        })
      } else {
        callback(err)
        site.log(err)
      }
    })
  }

  _mongo.findOne = function (obj, callback) {
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
       
        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }
      
        db.collection(site.options.mongodb.prefix.collection + obj.collectionName).findOne(obj.where, obj.select, function (err, doc) {

          if (!err) {
            callback(null, doc)
            if(site.mongodb.after_find){
              site.mongodb.after_find(obj.collectionName , doc)
            }
          } else {
            callback(err)
            site.log(err)
          }
        })
      } else {
        callback(err)
        site.log(err)
      }
    })
  }

  _mongo.find = _mongo.findMany = function (obj, callback) {
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }
        db
          .collection(site.options.mongodb.prefix.collection + obj.collectionName)
          .find(obj.where, obj.select)
          .sort(obj.sort || {})
          .limit(obj.limit || 10)
          .toArray(function (err, docs) {
            
            if (!err) {
              callback(null, docs)
              if(site.mongodb.after_findMany){
                site.mongodb.after_findMany(obj.collectionName , docs)
              }
            } else {
              callback(err)
              site.log(err)
            }
          })
      } else {
        callback(err)
        site.log(err)
      }
    })
  }

  _mongo.distinct = function (obj, callback) {
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }
        db.collection(site.options.mongodb.prefix.collection + obj.collectionName).distinct(obj.field, function (err, docs) {
          
          if (!err) {
            callback(null, docs)
          } else {
            callback(err)
            site.log(err)
          }
        })
      } else {
        callback(err)
        site.log(err)
      }
    })
  }

  _mongo.updateOne = function (obj, callback) {

    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }

        let req = obj.$req
        let res = obj.$res

        delete obj.$req
        delete obj.$res

        db.collection(site.options.mongodb.prefix.collection + obj.collectionName).updateOne(obj.where, {
            $set: obj.set
          },
          function (err, result) {
            

            if (!err) {
              if (callback) {
                callback(
                  null, {
                    count: result.result.nModified,
                    ok: result.result.ok
                  },
                  result
                )
              }

              if(site.mongodb.after_update){
                site.mongodb.after_update(obj.collectionName , obj.set ,req , res)
              }

            } else {
              if (callback) {
                callback(err)
                site.log(err)
              }
            }
          })
      } else {
        if (callback) {
          callback(err)
          site.log(err)
        }
      }
    })
  }

  _mongo.update = _mongo.updateMany = function (obj, callback) {
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }
        db.collection(site.options.mongodb.prefix.collection + obj.collectionName).updateMany(obj.where, {
            $set: obj.set
          },
          function (err, result) {
            
            if (!err) {
              callback(
                null, {
                  count: result.result.nModified,
                  ok: result.result.ok
                },
                result
              )
            } else {
              callback(err)
              site.log(err)
            }
          })
      } else {
        callback(err)
        site.log(err)
      }
    })
  }

  _mongo.deleteOne = function (obj, callback) {
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }

        let req = obj.where.$req
        let res = obj.where.$res

        delete obj.where.$req
        delete obj.where.$res

       

        _mongo.findOne({where : obj.where , select : {} , collectionName : obj.collectionName , dbName : obj.dbName} ,  function(err , doc){
          
            if(!err && doc){
              db.collection(site.options.mongodb.prefix.collection + obj.collectionName).deleteOne(obj.where, function (err, result) {
                
                if (!err) {
                  callback(
                    null, {
                      count: result.deletedCount,
                      ok: result.result.ok
                    },
                    result
                  )
                  if(site.mongodb.after_delete){
                    site.mongodb.after_delete(obj.collectionName , doc ,req , res)
                  }
                } else {
                  callback(err)
                  site.log(err)
                }
              })
            }else{
              callback({message : 'Not Exists'})
            }
        })
      } else {
        callback(err)
        site.log(err)
      }
    })
  }

  _mongo.delete = _mongo.deleteMany = function (obj, callback) {
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }
        db.collection(site.options.mongodb.prefix.collection + obj.collectionName).deleteMany(obj.where, function (err, result) {
          
          if (!err) {
            callback(
              null, {
                count: result.deletedCount,
                ok: result.result.ok
              },
              result
            )
          } else {
            callback(err)
            site.log(err)
          }
        })
      } else {
        callback(err)
        site.log(err)
      }
    })
  }



  return _mongo
}