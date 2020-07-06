module.exports = function init(_m_) {
  const mongodb = require("mongodb")
  const mongoClient = mongodb.MongoClient

  let url = _m_.options.mongodb.host + ":" + _m_.options.mongodb.port
  if (_m_.options.mongodb.userName && _m_.options.mongodb.password) {
    url = encodeURIComponent(_m_.options.mongodb.userName) + ":" + encodeURIComponent(_m_.options.mongodb.password) + "@" + _m_.options.mongodb.host + ":" + _m_.options.mongodb.port
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
  _m_.on('please close mongodb', (args, callback) => {
    callback = callback || function () {}

    if (_mongo.closeDbBusy == true) {
      setTimeout(() => {
        _m_.call('please close mongodb', args, callback)
      }, 2000);
      return
    }

    if (_mongo.connections.length === 0) {
      callback()
      return
    }

    _mongo.closeDbBusy = true
    console.log('')
    console.log('   Closing mongodb ' + _mongo.connections.length + ' connections ... ')
    console.log('')
    for (let i = 0; i < _mongo.connections.length; i++) {
      console.log('   Closing db : ' + _mongo.connections[i].name)
      _mongo.connections[i].client.close()
    }
    console.log('')

    setTimeout(() => {
      _mongo.closeDbBusy = false
      callback()
    }, 1000);

  })

  _mongo.handleDoc = function (doc) {

    if (!doc) {
      return doc
    }

    if (typeof doc === 'object') {
      for (let [key, val] of Object.entries(doc)) {

        if (typeof key === 'string') {
          if (key.startsWith('$')) {
            delete doc[key];
            continue;
          }
        }

        if (typeof val === 'object') {
          val = _mongo.handleDoc(val)
        } else if (typeof val === 'array') {
          val.forEach(v => {
            v = _mongo.handleDoc(v)
          });
        } else if (typeof val === 'string') {
          if (_m_.fn.isDate(val)) {
            doc[key] = new Date(val)
          }
        }

      }
    }

    return doc
  }

  _mongo.connectDBBusy = false
  _mongo.connectDB = function (name, callback) {

    if (_mongo.connectDBBusy === true) {
      setTimeout(() => {
        _mongo.connectDB(name, callback)
      }, 100);
      return
    }

    _mongo.connectDBBusy = true

    if (name === undefined) {
      name = _m_.options.mongodb.db
    }

    if (_m_.options.mongodb.enabled) {

      for (let i = 0; i < _mongo.connections.length; i++) {
        if (_mongo.connections[i].name === name) {
          if (_mongo.connections[i].connected) {
            callback(null, _mongo.connections[i].db)
            _mongo.connectDBBusy = false
          } else {
            callback({
              message: 'db connection lost'
            }, null)
            _mongo.connectDBBusy = false
            return
          }

          return
        }
      }

      let db_name = _m_.options.mongodb.prefix.db + name
      let db_url = _mongo.connection + "?authSource=admin"
      _mongo.client.connect(db_url , { useUnifiedTopology: true }, function (err, client) {

        if (!err) {

          const db = client.db(db_name);

          _mongo.connections.push({
            name: name,
            db: db,
            client : client,
            connected: true
          })

          let index = _mongo.connections.length - 1
          db.on('close', () => {
            _mongo.connections[index].connected = false
          })
          db.on('reconnect', () => {
            _mongo.connections[index].connected = true
          })

          callback(err, db)


        } else {
          err.message += " , " + db_url
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
          options.collectionName = _m_.options.mongodb.collection
        }

        db.collection(_m_.options.mongodb.prefix.collection + options.collectionName).createIndex(options.obj, options.option, function (err, result) {

          if (!err) {
            callback(null, result)

            _m_.call('mongodb after create index', {
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
          obj.collectionName = _m_.options.mongodb.collection
        }
        db.collection(_m_.options.mongodb.prefix.collection + obj.collectionName).aggregate(obj.arr).toArray(function (err, docs) {

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

  _mongo.dropCollection = function (obj, callback) {
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = _m_.options.mongodb.collection
        }
        db.collection(_m_.options.mongodb.prefix.collection + obj.collectionName).drop(function (err, delOK) {

          if (!err) {
            callback(null, delOK)
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
          obj.collectionName = _m_.options.mongodb.collection
        }


        let $req = obj.doc.$req
        let $res = obj.doc.$res

        delete obj.doc.$req
        delete obj.doc.$res

        obj.doc = _mongo.handleDoc(obj.doc)

        db.collection(_m_.options.mongodb.prefix.collection + obj.collectionName).insertOne(obj.doc, function (err, result) {

          if (!err) {

            callback(null, result.ops[0])


            _m_.call('mongodb after insert', {
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
          obj.collectionName = _m_.options.mongodb.collection
        }
        db.collection(_m_.options.mongodb.prefix.collection + obj.collectionName).insertMany(obj.docs, function (err, result) {

          if (!err) {
            callback(null, result)

            _m_.call('mongodb after insert many', {
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
          obj.collectionName = _m_.options.mongodb.collection
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

        let options = {
          "projection" : obj.select || {} , 
          "limit": 1 , 
          "skip": null,
          "sort": null
      }

        db.collection(_m_.options.mongodb.prefix.collection + obj.collectionName).findOne(obj.where, options, function (err, doc) {


          if (!err) {
            callback(null, doc)

            _m_.call('mongodb after find', {
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
          obj.collectionName = _m_.options.mongodb.collection
        }

        db.collection(_m_.options.mongodb.prefix.collection + obj.collectionName).countDocuments(obj.where, function (err, count) {

          if (err) {
            callback(err, [], 0)
            return
          }

          if (count > 0) {
            let options = {
              "projection" : obj.select || {} , 
              "limit": obj.limit  ? parseInt(obj.limit) :  _m_.options.mongodb.limit , 
              "skip": obj.skip || 0 ,
              "sort": obj.sort || null
          }

          
          db.collection(_m_.options.mongodb.prefix.collection + obj.collectionName)
              .find(obj.where , options).toArray(function (err, docs) {
                if (!err) {
                  callback(null, docs, count)
                  _m_.call('mongodb after find many', {
                    db: obj.dbName,
                    collection: obj.collectionName,
                    docs: docs
                  })

                } else {
                  callback(err, [], 0)
                }
              })
          } else {
            callback(null, [], count)

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
          obj.collectionName = _m_.options.mongodb.collection
        }
        db.collection(_m_.options.mongodb.prefix.collection + obj.collectionName).distinct(obj.field, function (err, docs) {

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

    callback = callback || function () {}

    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = _m_.options.mongodb.collection
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
            db.collection(_m_.options.mongodb.prefix.collection + obj.collectionName).updateOne(obj.where, $update,
              function (err, result) {

                if (!err) {
                  _mongo.findOne({
                    dbName: obj.dbName,
                    collectionName: obj.collectionName,
                    where: obj.where
                  }, (err2, doc2) => {
                    callback(
                      null, {
                        $req: $req,
                        $res: $res,
                        count: result.result.nModified,
                        ok: result.result.ok,
                        doc: doc2,
                        old_doc: doc,
                        where: obj.where,
                        update: $update,
                        db: obj.dbName,
                        collection: obj.collectionName
                      },
                      result
                    )
                    _m_.call('mongodb after update', {
                      db: obj.dbName,
                      collection: obj.collectionName,
                      doc: doc2,
                      old_doc: doc,
                      where: obj.where,
                      update: $update,
                      count: result.result.nModified,
                      ok: result.result.ok,
                      $req: $req,
                      $res: $res
                    })

                  })

                } else {
                  callback(err)
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
          obj.collectionName = _m_.options.mongodb.collection
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
        db.collection(_m_.options.mongodb.prefix.collection + obj.collectionName).updateMany(obj.where, $update,
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
              _m_.call('mongodb after update many', {
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
          obj.collectionName = _m_.options.mongodb.collection
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
            db.collection(_m_.options.mongodb.prefix.collection + obj.collectionName).deleteOne(obj.where, function (err, result) {

              if (!err) {
                callback(
                  null, {
                    $req: $req,
                    $res: $res,
                    db: obj.dbName,
                    collection: obj.collectionName,
                    count: result.deletedCount,
                    ok: result.result.ok,
                    doc: doc
                  },
                  result
                )

                _m_.call('mongodb after delete', {
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
          obj.collectionName = _m_.options.mongodb.collection
        }
        db.collection(_m_.options.mongodb.prefix.collection + obj.collectionName).deleteMany(obj.where, function (err, result) {

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
            _m_.call('mongodb after delete many', {
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