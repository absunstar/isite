module.exports = function init(site) {
  let mongodb = require("mongodb")
  let mongoClient = mongodb.MongoClient
  let Server = mongodb.Server

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


  //ulimit -n 10000
  _mongo.dbList = []

  _mongo.connections = []
  _mongo.closeDbBusy = false
  site.on('please close mongodb', (args, callback) => {
    if (_mongo.closeDbBusy == true) {
      setTimeout(() => {
        site.call('please close mongodb' , args , callback)
      }, 2000);
      return
    }
    _mongo.closeDbBusy = true
    console.log('closing mongodb ' + _mongo.connections.length + ' connections ... ')
    for (let i = 0; i < _mongo.connections.length; i++) {
      console.log('closing db : ' + _mongo.connections[i].name)
      _mongo.connections[i].db.close()
    }
    setTimeout(() => {
      _mongo.closeDbBusy = false
      callback()
    }, 1000);

  })

  _mongo.handleDoc = function (doc) {
    for (let [key, val] of Object.entries(doc)) {
      if (key.startsWith('$')) {
        delete doc[key];
      }
    }
    return doc
  }

  _mongo.connectDBBusy = false
  _mongo.connectDB = function (name, callback) {

    if (_mongo.connectDBBusy === true) {
      setTimeout(() => {
        _mongo.connectDB(name, callback)
      }, 250);
      return
    }



    _mongo.connectDBBusy = true

    if (name === undefined) {
      name = site.options.mongodb.db
    }

    if (site.options.mongodb.enabled) {

      for (let i = 0; i < _mongo.connections.length; i++) {
        if (_mongo.connections[i].name === name) {
          callback(null, _mongo.connections[i].db)
          _mongo.connectDBBusy = false
          return
        }
      }

      _mongo.client.connect(_mongo.connection + "/" + site.options.mongodb.prefix.db + name + "?maxPoolSize=1000", function (err, db) {

        if (!err) {
          _mongo.connections.push({
            name: name,
            db: db
          })
          callback(err, db)
        } else {
          callback(err, null)
        }
        _mongo.connectDBBusy = false
      })


    } else {
      callback({
          message: "mongodb Not Enabled"
        },
        null
      )
      _mongo.connectDBBusy = false
    }
  }


  _mongo.createIndex = function (options, callback) {
    _mongo.connectDB(options.dbName, function (err, db) {
      if (!err) {
        if (options.collectionName === undefined) {
          options.collectionName = site.options.mongodb.collection
        }

        db.collection(site.options.mongodb.prefix.collection + options.collectionName).createIndex(options.obj, options.option, function (err, result) {

          if (!err) {
            callback(null, result)

            site.call('mongodb after create index', {
              db: options.dbName,
              collection: options.collectionName,
              obj: options.obj
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


  _mongo.aggregate = function (obj, callback) {
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }
        db.collection(site.options.mongodb.prefix.collection + obj.collectionName).aggregate(obj.arr, function (err, result) {

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


        let $req = obj.doc.$req
        let $res = obj.doc.$res

        delete obj.doc.$req
        delete obj.doc.$res

        obj.doc = _mongo.handleDoc(obj.doc)

        db.collection(site.options.mongodb.prefix.collection + obj.collectionName).insertOne(obj.doc, function (err, result) {

          if (!err) {

            callback(null, result.ops[0])


            site.call('mongodb after insert', {
              db: obj.dbName,
              collection: obj.collectionName,
              doc: result.ops[0],
              $req: $req,
              $res: $res
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

            site.call('mongodb after insert many', {
              db: obj.dbName,
              collection: obj.collectionName,
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
    callback = callback || function () {}

    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {

        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }

        if (obj.where === undefined) {
          callback({
            message: 'where not set'
          })
          return
        }

        if (typeof obj.where === 'string') {
          obj.where = {
            _id: _mongo.ObjectID(obj.where)
          }
        }

        if (typeof obj.where._id === 'string') {
          obj.where._id = _mongo.ObjectID(obj.where._id)
        }

        if (obj.select === undefined) {
          obj.select = {}
        }

        db.collection(site.options.mongodb.prefix.collection + obj.collectionName).findOne(obj.where, obj.select, function (err, doc) {

          if (!err) {
            callback(null, doc)

            site.call('mongodb after find', {
              db: obj.dbName,
              collection: obj.collectionName,
              doc: doc
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
          .limit(obj.limit || site.options.mongodb.limit)
          .toArray(function (err, docs) {

            if (!err) {
              callback(null, docs)
              site.call('mongodb after find many', {
                db: obj.dbName,
                collection: obj.collectionName,
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

        let $req = obj.$req
        let $res = obj.$res

        delete obj.$req
        delete obj.$res

        if (obj.where && obj.where._id && typeof obj.where._id === 'string') {
          obj.where._id = _mongo.ObjectID(obj.where._id)
        }

        let $update = {}
        if (obj.set) {
          $update.$set = obj.set
          if ($update.$set._id) {
            delete $update.$set._id
          }
          $update.$set = _mongo.handleDoc($update.$set)
        }
        if (obj.unset) {
          $update.$unset = obj.unset
        }
        if (obj.rename) {
          $update.$rename = obj.rename
        }

        _mongo.findOne({
          dbName: obj.dbName,
          collectionName: obj.collectionName,
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
                        doc: doc,
                        db: obj.dbName,
                        collection: obj.collectionName,
                        $req: $req,
                        $res: $res,
                        where: obj.where,
                        update: $update
                      },
                      result
                    )
                  }

                  site.call('mongodb after update', {
                    db: obj.dbName,
                    collection: obj.collectionName,
                    doc: doc,
                    where: obj.where,
                    update: $update,
                    $req: $req,
                    $res: $res
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

        let $req = obj.$req
        let $res = obj.$res

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
              site.call('mongodb after update many', {
                db: obj.dbName,
                collection: obj.collectionName,
                exists: result.result.n,
                count: result.result.nModified,
                ok: result.result.ok,
                where: obj.where,
                update: $update,
                $req: req,
                $res: res
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

        let $req = obj.where.$req
        let $res = obj.where.$res

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
                    db: obj.dbName,
                    collection: obj.collectionName,
                    $req: $req,
                    $res: $res,
                    count: result.deletedCount,
                    ok: result.result.ok,
                    doc: doc
                  },
                  result
                )

                site.call('mongodb after delete', {
                  db: obj.dbName,
                  collection: obj.collectionName,
                  doc: doc,
                  $req: $req,
                  $res: $res
                })

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
    callback = callback || function () {}

    if (obj.where === undefined) {
      callback({
          message: 'where not set'
        }, {
          db: obj.dbName,
          collection: obj.collectionName,
          $req: $req,
          $res: $res,
          count: 0,
          ok: 0,
          exists: 0
        },
        result
      )
      return
    }
    let $req = obj.where.$req
    let $res = obj.where.$res

    delete obj.where.$req
    delete obj.where.$res

    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = site.options.mongodb.collection
        }
        db.collection(site.options.mongodb.prefix.collection + obj.collectionName).deleteMany(obj.where, function (err, result) {

          if (!err) {
            callback(
              null, {
                db: obj.dbName,
                collection: obj.collectionName,
                $req: $req,
                $res: $res,
                count: result.deletedCount,
                ok: result.result.ok,
                exists: result.result.n
              },
              result
            )
            site.call('mongodb after delete many', {
              db: obj.dbName,
              collection: obj.collectionName,
              $req: $req,
              $res: $res,
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