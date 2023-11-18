module.exports = function init(____0) {
  const mongodb = require('mongodb');
  const mongoClient = mongodb.MongoClient;

  let url = '';
  if (!____0.options.mongodb.url) {
    url = ____0.options.mongodb.host + ':' + ____0.options.mongodb.port;
    if (____0.options.mongodb.userName && ____0.options.mongodb.password) {
      url = encodeURIComponent(____0.options.mongodb.userName) + ':' + encodeURIComponent(____0.options.mongodb.password) + '@' + ____0.options.mongodb.host + ':' + ____0.options.mongodb.port;
    }
    url = ____0.options.mongodb.protocal + url;
  } else {
    url = encodeURI(____0.options.mongodb.url);
  }

  const _mongo = function () {};

  _mongo.lib = mongodb;
  _mongo.ObjectID = mongodb.ObjectID;
  _mongo.client = mongoClient;
  _mongo.connection = url;
  _mongo.collections_indexed = [];

  //ulimit -n 10000
  _mongo.dbList = [];

  _mongo.connections = [];
  _mongo.closeDbBusy = !1;
  ____0.on('please close mongodb', (args, callback) => {
    callback = callback || function () {};

    if (_mongo.closeDbBusy == !0) {
      setTimeout(() => {
        ____0.call('please close mongodb', args, callback);
      }, 2000);
      return;
    }

    if (_mongo.connections.length === 0) {
      callback();
      return;
    }

    _mongo.closeDbBusy = !0;
    console.log('');
    console.log('   Closing mongodb ' + _mongo.connections.length + ' connections ... ');
    console.log('');
    for (let i = 0; i < _mongo.connections.length; i++) {
      console.log('   Closing db : ' + _mongo.connections[i].name);
      _mongo.connections[i].client.close();
    }
    console.log('');

    setTimeout(() => {
      _mongo.closeDbBusy = !1;
      callback();
    }, 1000);
  });

  _mongo.handleDoc = function (doc, isProperty = false) {
    if (!doc) {
      return doc;
    }

    if (Array.isArray(doc)) {
      doc.forEach((v, i) => {
        doc[i] = _mongo.handleDoc(v, true);
      });
      return doc;
    } else if (typeof doc === 'object') {
      for (let key in doc) {
        if (typeof key === 'string' && key.indexOf('$') === 0) {
          delete doc[key];
        } else if (typeof doc[key] === 'string' && ____0.fn.isDate(doc[key])) {
          doc[key] = new Date(doc[key]);
        } else if (Array.isArray(doc[key])) {
          doc[key].forEach((v, i) => {
            doc[key][i] = _mongo.handleDoc(v, true);
          });
        } else if (typeof doc[key] === 'object') {
          doc[key] = _mongo.handleDoc(doc[key], true);
        }
      }
    }

    return isProperty ? doc : { ...doc };
  };

  _mongo.connectDBBusy = !1;
  _mongo.connectDB = function (name, callback) {
    if (_mongo.connectDBBusy === !0) {
      setTimeout(() => {
        _mongo.connectDB(name, callback);
      }, 100);
      return;
    }

    _mongo.connectDBBusy = !0;

    if (name === undefined) {
      name = ____0.options.mongodb.db;
    }

    if (____0.options.mongodb.enabled) {
      for (let i = 0; i < _mongo.connections.length; i++) {
        if (_mongo.connections[i].name === name) {
          callback(null, _mongo.connections[i].db);
          _mongo.connectDBBusy = !1;
          return;
        }
      }

      let db_name = ____0.options.mongodb.prefix.db + name;
      let db_url = _mongo.connection;
      ____0.log('\n ( Connecting DB : ' + db_url + ' ) \n');
      _mongo.client.connect(
        db_url,
        {
          serverSelectionTimeoutMS: 1000 * 60,
          connectTimeoutMS: 1000 * 60,
          socketTimeoutMS: 1000 * 60 * 5,
          ...____0.options.mongodb.config,
        },
        function (err, client) {
          if (!err) {
            const db = client.db(db_name);

            _mongo.connections.push({
              name: name,
              url: db_url,
              db: db,
              client: client,
              connected: !0,
            });
            ____0.log('\n ( Connected DB : ' + db_name + ' ) : ' + db_url + '\n');
            callback(err, db);
          } else {
            err.message += ' , ' + db_url;
            ____0.log('\n ( Connected DB Error: ' + err.message + ' ) \n');
            callback(err, null);
          }
          _mongo.connectDBBusy = !1;
        }
      );
    } else {
      callback(
        {
          message: 'mongodb Not Enabled',
        },
        null
      );
      _mongo.connectDBBusy = !1;
    }
  };

  _mongo.createIndex = function (options, callback) {
    _mongo.connectDB(options.dbName, function (err, db) {
      if (!err) {
        if (options.collectionName === undefined) {
          options.collectionName = ____0.options.mongodb.collection;
        }

        db.collection(____0.options.mongodb.prefix.collection + options.collectionName).createIndex(options.obj, options.option, function (err, result) {
          if (!err) {
            callback(null, result);
            if (____0.options.mongodb.events) {
              ____0.call('mongodb after create index', {
                db: options.dbName,
                collection: options.collectionName,
                obj: options.obj,
              });
            }
          } else {
            callback(err);
          }
        });
      } else {
        callback(err);
      }
    });
  };

  _mongo.aggregate = function (obj, callback) {
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }
        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName)
          .aggregate(obj.arr)
          .toArray(function (err, docs) {
            if (!err) {
              callback(null, docs);
            } else {
              callback(err);
            }
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.dropCollection = function (obj, callback) {
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }
        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName).drop(function (err, delOK) {
          if (!err) {
            callback(null, delOK);
          } else {
            callback(err);
          }
        });
      } else {
        callback(err);
      }
    });
  };

  _mongo.insertOneAsyncBusy = !1;
  _mongo.insertOneAsyncList = [];
  _mongo.insertOneAsync = function (obj, callback) {
    if (obj) {
      _mongo.insertOneAsyncList.push({
        obj: obj,
        callback: callback,
      });
      _mongo.insertOneAsync(null);
    } else {
      if (_mongo.insertOneAsyncBusy) {
        return;
      }

      var _obj = _mongo.insertOneAsyncList[0];
      if (_obj) {
        _mongo.insertOneAsyncBusy = !0;
        _mongo.insertOne(_obj.obj, function (err, obj) {
          _mongo.insertOneAsyncList.splice(0, 1);
          _obj.callback(err, obj);
          _mongo.insertOneAsyncBusy = !1;
          _mongo.insertOneAsync(null);
        });
      }
    }
  };

  _mongo.insertOne = function (obj, callback) {
    callback = callback || function () {};
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }

        obj.doc = _mongo.handleDoc(obj.doc);

        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName).insertOne(obj.doc, function (err, result) {
          if (!err) {
            callback(null, { ...obj.doc, _id: result.insertedId }, result);
            if (____0.options.mongodb.events) {
              ____0.call('mongodb after insert', {
                db: obj.dbName,
                collection: obj.collectionName,
                doc: result,
              });
            }
          } else {
            if (callback) {
              callback(err);
            }
          }
        });
      } else {
        if (callback) {
          callback(err);
        }
      }
    });
  };

  _mongo.insert = _mongo.insertMany = function (obj, callback) {
    if (!obj.docs || obj.docs.length === 0) {
      callback({
        message: 'docs array length is 0',
      });
      return;
    }
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (!obj.collectionName) {
          obj.collectionName = ____0.options.mongodb.collection;
        }
        obj.docs.forEach((doc, i) => {
          obj.docs[i] = _mongo.handleDoc(doc);
        });
        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName).insertMany(obj.docs, obj.options, function (err, result) {
          if (!err) {
            callback(null, obj.docs, result);
            if (____0.options.mongodb.events) {
              ____0.call('mongodb after insert many', {
                db: obj.dbName,
                collection: obj.collectionName,
                docs: obj.docs,
              });
            }
          } else {
            console.error(' _mongo.insertMany() ', err.message);
            callback(err, obj.docs, result);
          }
        });
      } else {
        console.error(' _mongo.insertMany() ', err.message);
        callback(err);
      }
    });
  };

  _mongo.findOne = function (obj, callback) {
    callback = callback || function () {};

    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }

        if (obj.where === undefined) {
          callback({
            message: 'where not set',
          });
          return;
        }

        if (typeof obj.where === 'string') {
          obj.where = {
            _id: _mongo.ObjectID(obj.where),
          };
        }

        if (typeof obj.where._id === 'string') {
          obj.where._id = _mongo.ObjectID(obj.where._id);
        }

        if (obj.select === undefined) {
          obj.select = {};
        }

        let options = {
          projection: obj.select || {},
          limit: 1,
          skip: null,
          sort: null,
        };

        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName).findOne(obj.where, options, function (err, doc) {
          if (!err) {
            callback(null, doc);
            if (____0.options.mongodb.events) {
              ____0.call('mongodb after find', {
                db: obj.dbName,
                collection: obj.collectionName,
                doc: doc,
              });
            }
          } else {
            callback(err);
          }
        });
      } else {
        callback(err);
      }
    });
  };

  _mongo.find = _mongo.findMany = function (obj, callback) {
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }

        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName).countDocuments(obj.where, function (err, count) {
          if (err) {
            callback(err, [], 0);
            return;
          }

          if (count > 0) {
            let options = {
              projection: obj.select || {},
              limit: obj.limit ? parseInt(obj.limit) : ____0.options.mongodb.limit,
              skip: obj.skip ? parseInt(obj.skip) : 0,
              sort: obj.sort || null,
            };

            db.collection(____0.options.mongodb.prefix.collection + obj.collectionName)
              .find(obj.where, options)
              .toArray(function (err, docs) {
                if (!err) {
                  callback(null, docs, count);
                  if (____0.options.mongodb.events) {
                    ____0.call('mongodb after find many', {
                      db: obj.dbName,
                      collection: obj.collectionName,
                      docs: docs,
                    });
                  }
                } else {
                  callback(err, [], 0);
                }
              });
          } else {
            callback(null, [], count);
          }
        });
      } else {
        callback(err);
      }
    });
  };

  _mongo.distinct = function (obj, callback) {
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }
        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName).distinct(obj.field, function (err, docs) {
          if (!err) {
            callback(null, docs);
          } else {
            callback(err);
          }
        });
      } else {
        callback(err);
      }
    });
  };

  _mongo.updateOne = function (obj, callback) {
    callback = callback || function () {};

    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }

        if (obj.where && obj.where._id && typeof obj.where._id === 'string') {
          obj.where._id = _mongo.ObjectID(obj.where._id);
        }

        let $update = {};
        if (obj.set) {
          $update.$set = obj.set;
          if ($update.$set._id) {
            delete $update.$set._id;
          }
          $update.$set = _mongo.handleDoc($update.$set);
        }
        if (obj.unset) {
          $update.$unset = obj.unset;
        }
        if (obj.rename) {
          $update.$rename = obj.rename;
        }
        _mongo.findOne(
          {
            dbName: obj.dbName,
            collectionName: obj.collectionName,
            where: obj.where,
          },
          (err, doc) => {
            if (!err) {
              db.collection(____0.options.mongodb.prefix.collection + obj.collectionName).updateOne(obj.where, $update, function (err, result) {
                if (!err) {
                  _mongo.findOne(
                    {
                      dbName: obj.dbName,
                      collectionName: obj.collectionName,
                      where: obj.where,
                    },
                    (err2, doc2) => {
                      callback(
                        null,
                        {
                          doc: doc2,
                          old_doc: doc,
                          where: obj.where,
                          update: $update,
                          db: obj.dbName,
                          collection: obj.collectionName,
                        },
                        result
                      );
                      if (____0.options.mongodb.events) {
                        ____0.call('mongodb after update', {
                          db: obj.dbName,
                          collection: obj.collectionName,
                          doc: doc2,
                          old_doc: doc,
                          where: obj.where,
                          update: $update,
                        });
                      }
                    }
                  );
                } else {
                  callback(err);
                }
              });
            } else {
              callback(err);
            }
          }
        );
      } else {
        callback(err);
      }
    });
  };

  _mongo.update = _mongo.updateMany = function (obj, callback) {
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }

        let $update = {};
        if (obj.set) {
          $update.$set = obj.set;
        }
        if (obj.unset) {
          $update.$unset = obj.unset;
        }
        if (obj.rename) {
          $update.$rename = obj.rename;
        }
        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName).updateMany(obj.where, $update, function (err, result) {
          if (!err) {
            callback(
              null,
              {
                result: result,
                exists: result.result?.n,
                count: result.result?.nModified,
                ok: result.result?.ok,
                where: obj.where,
                update: $update,
              },
              result
            );
            if (____0.options.mongodb.events) {
              ____0.call('mongodb after update many', {
                db: obj.dbName,
                collection: obj.collectionName,
                exists: result.result.n,
                count: result.result.nModified,
                ok: result.result.ok,
                where: obj.where,
                update: $update,
              });
            }
          } else {
            callback(err);
          }
        });
      } else {
        callback(err);
      }
    });
  };

  _mongo.deleteOne = function (obj, callback) {
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }

        _mongo.findOne(
          {
            where: obj.where,
            select: {},
            collectionName: obj.collectionName,
            dbName: obj.dbName,
          },
          function (err, doc) {
            if (!err && doc) {
              db.collection(____0.options.mongodb.prefix.collection + obj.collectionName).deleteOne(obj.where, function (err, result) {
                if (!err) {
                  callback(
                    null,
                    {
                      db: obj.dbName,
                      collection: obj.collectionName,
                      count: result.deletedCount,
                      doc: doc,
                    },
                    result
                  );
                  if (____0.options.mongodb.events) {
                    ____0.call('mongodb after delete', {
                      db: obj.dbName,
                      collection: obj.collectionName,
                      doc: doc,
                    });
                  }
                } else {
                  callback(err);
                }
              });
            } else {
              callback({
                message: 'Not Exists : ' + JSON.stringify(obj.where),
              });
            }
          }
        );
      } else {
        callback(err);
      }
    });
  };

  _mongo.delete = _mongo.deleteMany = function (obj, callback) {
    callback = callback || function () {};

    if (obj.where === undefined) {
      callback(
        {
          message: 'where not set',
        },
        {
          db: obj.dbName,
          collection: obj.collectionName,

          count: 0,
          ok: 0,
          exists: 0,
        },
        result
      );
      return;
    }

    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }
        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName).deleteMany(obj.where, function (err, result) {
          if (!err) {
            callback(
              null,
              {
                db: obj.dbName,
                collection: obj.collectionName,

                count: result.deletedCount,
              },
              result
            );
            if (____0.options.mongodb.events) {
              ____0.call('mongodb after delete many', {
                db: obj.dbName,
                collection: obj.collectionName,

                where: obj.where,
                count: result.deletedCount,
              });
            }
          } else {
            callback(err);
          }
        });
      } else {
        callback(err);
      }
    });
  };

  return _mongo;
};
