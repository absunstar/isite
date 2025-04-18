module.exports = function init(____0) {
  const mongodb = require('mongodb');

  let url = '';
  if (!____0.options.mongodb.url) {
    url = ____0.options.mongodb.host + ':' + ____0.options.mongodb.port;
    if (____0.options.mongodb.username && ____0.options.mongodb.password) {
      url = encodeURIComponent(____0.options.mongodb.username) + ':' + encodeURIComponent(____0.options.mongodb.password) + '@' + ____0.options.mongodb.host + ':' + ____0.options.mongodb.port;
    }
    url = ____0.options.mongodb.protocal + url;
  } else {
    url = encodeURI(____0.options.mongodb.url);
  }

  const _mongo = function () {};
  _mongo.callback = function (...args) {
    ____0.log(...args);
  };

  _mongo.lib = mongodb;

  _mongo.ObjectId = mongodb.ObjectId;
  _mongo.ObjectID = function (_id) {
    if (_id && typeof _id === 'string' && /^[a-fA-F0-9]{24}$/.test(_id)) {
      try {
        return new _mongo.ObjectId(_id);
      } catch (error) {
        console.error(error);
        return new _mongo.ObjectId();
      }
    }
    return new _mongo.ObjectId();
  };
  _mongo.connection = url;
  _mongo.collections_indexed = [];

  //ulimit -n 10000

  _mongo.closeDbBusy = !1;
  ____0.on('[close-database]', (args, callback) => {
    callback = callback || _mongo.callback;

    if (_mongo.closeDbBusy == !0) {
      setTimeout(() => {
        ____0.call('[close-database]', args, callback);
      }, 2000);
      return;
    }

    if (____0.databaseList.length === 0) {
      callback();
      return;
    }

    _mongo.closeDbBusy = !0;
    console.log('Closing mongodb Connection Count : ' + ____0.databaseList.length);
    for (let i = 0; i < ____0.databaseList.length; i++) {
      console.log('Closing Database : ' + ____0.databaseList[i].name);
      ____0.databaseList[i].client.close();
    }

    setTimeout(() => {
      _mongo.closeDbBusy = !1;
      callback();
    }, 1000);
  });

  _mongo.handleDoc = function (doc, $badLetter = '$') {
    if (!doc) {
      return doc;
    }

    if (typeof doc === 'object') {
      delete doc.$req;
      delete doc.$res;

      if ($badLetter) {
        doc = ____0.removeRefObject(doc);
      }

      for (let key in doc) {
        if (key === '_id') {
          if (doc[key] && typeof doc[key] === 'string' && /^[a-fA-F0-9]{24}$/.test(doc[key])) {
            doc[key] = _mongo.ObjectID(doc[key]);
          }
        } else if (key === 'id') {
        } else if (typeof key === 'string' && $badLetter && key.indexOf($badLetter) === 0) {
          delete doc[key];
        } else if (Array.isArray(doc[key])) {
          doc[key].forEach((v, i) => {
            if (v && typeof v === 'object') {
              doc[key][i] = _mongo.handleDoc(v, $badLetter);
            }
          });
        } else if (typeof doc[key] === 'object' && doc[key]) {
          doc[key] = _mongo.handleDoc(doc[key], $badLetter);
        } else if (typeof doc[key] === 'string' && ____0.fn.isDate(doc[key])) {
          doc[key] = ____0.getDateTime(doc[key]);
        }
      }
    }

    return doc;
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

    if (!____0.options.mongodb.enabled) {
      callback(
        {
          message: 'mongodb Not Enabled',
        },
        null
      );
      _mongo.connectDBBusy = !1;
      return;
    }

    for (let i = 0; i < ____0.databaseList.length; i++) {
      if (____0.databaseList[i].name === name) {
        callback(null, ____0.databaseList[i].db);
        _mongo.connectDBBusy = !1;
        return;
      }
    }

    let db_name = ____0.options.mongodb.prefix.db + name;
    let db_url = _mongo.connection;
    ____0.log('\n ( Connecting DB : ' + db_url + ' ) \n');
    const mongodbClient = new mongodb.MongoClient(db_url, {
      serverSelectionTimeoutMS: 1000 * 60,
      connectTimeoutMS: 1000 * 60,
      socketTimeoutMS: 1000 * 60 * 5,
      ...____0.options.mongodb.config,
    });
    mongodbClient
      .connect()
      .then((client) => {
        if (client) {
          const db = client.db(db_name);

          ____0.databaseList.push({
            name: name,
            db_name: db_name,
            url: db_url,
            db: db,
            client: client,
            connected: !0,
          });
          ____0.log('\n ( Connected DB : ' + db_name + ' ) : ' + db_url + '\n');
          callback(null, db);
        } else {
          err.message += ' , ' + db_url;
          ____0.log('\n ( Connected DB Error: ' + err.message + ' ) \n');
          ____0.log(err);
          callback(err, null);
        }
        _mongo.connectDBBusy = !1;
      })
      .catch((err) => {
        ____0.log(err);
        callback(err, null);
      });
  };
  _mongo.connectCollectionBusy = !1;
  _mongo.connectCollection = function (options, callback) {
    if (_mongo.connectCollectionBusy === !0) {
      setTimeout(() => {
        _mongo.connectCollection(options, callback);
      }, 100);
      return;
    }

    _mongo.connectCollectionBusy = !0;

    if (options.collectionName === undefined) {
      options.collectionName = ____0.options.mongodb.collection;
    }
    let name = ____0.options.mongodb.prefix.collection + options.collectionName;
    let index = ____0.databaseCollectionList.findIndex((c) => c.name == name);
    if (index !== -1) {
      callback(null, ____0.databaseCollectionList[index].collection);
      _mongo.connectCollectionBusy = !1;
    } else {
      _mongo.connectDB(options.dbName, function (err, db) {
        if (!err) {
          ____0.databaseCollectionList.push({
            name: name,
            collection: db.collection(name),
          });
          callback(null, ____0.databaseCollectionList[____0.databaseCollectionList.findIndex((c) => c.name == name)].collection);
        } else {
          callback(err, null);
        }
        _mongo.connectCollectionBusy = !1;
      });
    }
  };

  _mongo.createIndex = function (options, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(options, function (err, collection) {
      if (!err) {
        collection
          .createIndex(options.obj, options.option)
          .then((result) => {
            callback(null, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.dropIndex = function (options, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(options, function (err, collection) {
      if (!err) {
        collection
          .dropIndex(options.obj, options.option)
          .then((result) => {
            callback(null, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.dropIndexes = function (options, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(options, function (err, collection) {
      if (!err) {
        collection
          .dropIndexes()
          .then((result) => {
            callback(null, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.aggregate = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        collection
          .aggregate(obj.arr)
          .toArray()
          .then((docs) => {
            callback(null, docs);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.dropCollection = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        collection
          .drop()
          .then((delOK) => {
            callback(null, delOK);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.insertOne = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.doc = _mongo.handleDoc(obj.doc);

        collection
          .insertOne(obj.doc)
          .then((result) => {
            obj.doc._id = result.insertedId;
            callback(null, obj.doc, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.insert = _mongo.insertMany = function (obj, callback) {
    callback = callback || _mongo.callback;
    if (!obj.docs || obj.docs.length === 0) {
      callback({
        message: 'docs array length is 0',
      });
      return;
    }
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.docs.forEach((doc, i) => {
          obj.docs[i] = _mongo.handleDoc(doc);
        });
        collection
          .insertMany(obj.docs, obj.options)
          .then((result) => {
            callback(null, obj.docs, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.findOne = function (obj, callback) {
    callback = callback || _mongo.callback;

    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        if (obj.where === undefined) {
          callback({
            message: 'where not set',
          });
          return;
        }

        obj.where = _mongo.handleDoc(obj.where, '');

        if (obj.select === undefined) {
          obj.select = {};
        }

        let options = {
          projection: obj.select || {},
          limit: 1,
          skip: obj.skip,
          sort: obj.sort,
        };
        collection
          .findOne(obj.where, options)
          .then((doc) => {
            let err = null;
            callback(err, doc);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.count = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.where = _mongo.handleDoc(obj.where, '');
        collection
          .countDocuments(obj.where)
          .then((count) => {
            callback(err, count);
          })
          .catch((err) => {
            callback(err, 0);
          });
      } else {
        callback(err, 0);
      }
    });
  };

  _mongo.find = _mongo.findMany = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.where = _mongo.handleDoc(obj.where, '');
        collection
          .countDocuments(obj.where)
          .then((count) => {
            if (count > 0) {
              let options = {
                projection: obj.select || {},
                limit: obj.limit ? parseInt(obj.limit) : ____0.options.mongodb.limit,
                skip: obj.skip ? parseInt(obj.skip) : 0,
                sort: obj.sort || null,
              };

              collection
                .find(obj.where, options)
                .toArray()
                .then((docs) => {
                  callback(null, docs, count);
                })
                .catch((err) => {
                  callback(err, [], 0);
                });
            } else {
              callback(null, [], count);
            }
          })
          .catch((err) => {
            callback(err, [], 0);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.distinct = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        collection
          .distinct(obj.field)
          .then((docs) => {
            callback(null, docs);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.updateOne = function (obj, callback) {
    callback = callback || _mongo.callback;

    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.where = _mongo.handleDoc(obj.where, '');

        let $update = {};

        if (obj.set) {
          $update.$set = obj.set;
          $update.$set = _mongo.handleDoc($update.$set);
        }

        if (obj.unset) {
          $update.$unset = obj.unset;
        }

        if (obj.rename) {
          $update.$rename = obj.rename;
        }

        collection
          .updateOne(obj.where, $update)
          .then((result) => {
            result.doc = $update.$set;
            result.old_doc = {};
            result.where = obj.where;
            result.update = $update;
            result.db = obj.dbName;
            result.collection = obj.collectionName;
            callback(null, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.update = _mongo.updateMany = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.where = _mongo.handleDoc(obj.where, '');

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
        collection
          .updateMany(obj.where, $update)
          .then((result) => {
            result.exists = result.result?.n;
            result.count = result.result?.nModified;
            result.ok = result.result?.ok;
            result.where = obj.where;
            result.update = $update;
            callback(null, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.deleteOne = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.where = _mongo.handleDoc(obj.where, '');

        collection
          .deleteOne(obj.where)
          .then((result) => {
            result.db = obj.dbName;
            result.collection = obj.collectionName;
            result.count = result.deletedCount;
            result.doc = obj.where;
            callback(null, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.delete = _mongo.deleteMany = function (obj, callback) {
    callback = callback || _mongo.callback;

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

    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.where = _mongo.handleDoc(obj.where, '');
        collection
          .deleteMany(obj.where)
          .then((result) => {
            result.db = obj.dbName;
            result.collection = obj.collectionName;
            result.count = result.deletedCount;
            callback(null, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  return _mongo;
};
