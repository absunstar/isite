module.exports = function init(site) {
  let mongodb = require("mongodb")
  let mongoClient = mongodb.MongoClient

  let url = site.options.mongodb.url + ":" + site.options.mongodb.port
  if (site.options.mongodb.userName && site.options.mongodb.password) {
    url = site.options.mongodb.userName + ":" + site.options.mongodb.password + "@" + site.options.mongodb.url + ":" + site.options.mongodb.port
  }

  const _mongo = function () {}


  _mongo.lib = mongodb
  _mongo.ObjectID = mongodb.ObjectID
  _mongo.client = mongoClient
  _mongo.connection = "mongodb://" + url
  _mongo.collections_indexed = []

  _mongo.after_insert = function (result) {}
  _mongo.after_insertMany = function (result) {}
  _mongo.after_update = function (result) {}
  _mongo.after_updateMany = function (result) {}
  _mongo.after_delete = function (result) {}
  _mongo.after_deleteMany = function (result) {}
  _mongo.after_find = function (result) {}
  _mongo.after_findMany = function (result) {}

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
    callback = callback || function () {}
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

            callback(null, result.ops[0])


            site.mongodb.after_insert({
              collectionName: obj.collectionName,
              doc: result.ops[0],
              req: req,
              res: res
            })



          } else {
            if (callback) {
              callback(err)
            }

          }
        })
      } else {
        if (callback) {
          callback(err)
        }

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

            site.mongodb.after_insertMany({
              collectionName: obj.collectionName,
              docs: obj.docs
            })

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
    callback = callback || function(){}

    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {

        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }

        if(obj.where === undefined){
          callback({message : 'where not set'})
          return
        }

        if(typeof obj.where === 'string'){
          obj.where = { _id : _mongo.ObjectID(obj.where)}
        }

        if(typeof obj.where._id === 'string'){
          obj.where._id = _mongo.ObjectID(obj.where._id)
        }

        if(obj.select === undefined){
          obj.select = {}
        }

        db.collection(site.options.mongodb.prefix.collection + obj.collectionName).findOne(obj.where, obj.select, function (err, doc) {

          if (!err) {
            callback(null, doc)
            if (site.mongodb.after_find) {
              site.mongodb.after_find({
                collectionName: obj.collectionName,
                doc: doc
              })
            }
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

              site.mongodb.after_findMany({
                collectionName: obj.collectionName,
                docs: docs
              })

            } else {
              callback(err)

            }
          })
      } else {
        callback(err)

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
        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }

        let req = obj.$req
        let res = obj.$res

        delete obj.$req
        delete obj.$res

      

        let $update = {}
        if (obj.set) {
          $update.$set = obj.set
        }
        if (obj.unset) {
          $update.$unset = obj.unset
        }
        if (obj.rename) {
          $update.$rename = obj.rename
        }

        _mongo.findOne({
          dbName : obj.dbName,
          collectionName : obj.collectionName ,
          where: obj.where
        }, (err, doc) => {
          if (!err) {
            db.collection(site.options.mongodb.prefix.collection + obj.collectionName).updateOne(obj.where, $update,
              function (err, result) {


                if (!err) {
                  if (callback) {
                    callback(
                      null, {
                        count: result.result.nModified,
                        ok: result.result.ok,
                        doc : doc ,
                        where: obj.where,
                        update: $update
                      },
                      result
                    )
                  }

                  site.mongodb.after_update({
                    collectionName: obj.collectionName,
                    dbName: obj.dbName,
                    doc : doc ,
                    where: obj.where,
                    update: $update,
                    req: req,
                    res: res
                  })

                } else {
                  if (callback) {
                    callback(err)

                  }
                }
              })

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
        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }

        let req = obj.$req
        let res = obj.$res

        delete obj.$req
        delete obj.$res

        let $update = {}
        if (obj.set) {
          $update.$set = obj.set
        }
        if (obj.unset) {
          $update.$unset = obj.unset
        }
        if (obj.rename) {
          $update.$rename = obj.rename
        }
        db.collection(site.options.mongodb.prefix.collection + obj.collectionName).updateMany(obj.where, $update,
          function (err, result) {

            if (!err) {
              callback(
                null, {
                  exists: result.result.n,
                  count: result.result.nModified,
                  ok: result.result.ok,
                  where: obj.where,
                  update: $update
                },
                result
              )
              _mongo.after_updateMany({
                collectionName: obj.collectionName,
                dbName: obj.dbName,
                exists: result.result.n,
                count: result.result.nModified,
                ok: result.result.ok,
                where: obj.where,
                update: $update,
                req: req,
                res: res
              })
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
        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }

        let req = obj.where.$req
        let res = obj.where.$res

        delete obj.where.$req
        delete obj.where.$res


        _mongo.findOne({
          where: obj.where,
          select: {},
          collectionName: obj.collectionName,
          dbName: obj.dbName
        }, function (err, doc) {

          if (!err && doc) {
            db.collection(site.options.mongodb.prefix.collection + obj.collectionName).deleteOne(obj.where, function (err, result) {

              if (!err) {
                callback(
                  null, {
                    count: result.deletedCount,
                    ok: result.result.ok ,
                    doc : doc
                  },
                  result
                )
                if (site.mongodb.after_delete) {
                  site.mongodb.after_delete({
                    collectionName: obj.collectionName,
                    doc: doc,
                    req: req,
                    res: res
                  })
                }
              } else {
                callback(err)

              }
            })
          } else {
            callback({
              message: 'Not Exists'
            })
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
        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }
        db.collection(site.options.mongodb.prefix.collection + obj.collectionName).deleteMany(obj.where, function (err, result) {

          if (!err) {
            callback(
              null, {
                count: result.deletedCount,
                ok: result.result.ok,
                exists: result.result.n
              },
              result
            )
            _mongo.after_deleteMany({
              collectionName: obj.collectionName,
              dbName: obj.dbName,
              where: obj.where,
              count: result.deletedCount,
              ok: result.result.ok,
              exists: result.result.n
            })
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