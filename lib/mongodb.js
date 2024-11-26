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
    console.log(...args);
  };

  _mongo.lib = mongodb;

  _mongo.ObjectId = mongodb.ObjectId;
  _mongo.ObjectID = function (_id) {
    if (typeof _id === 'string' && _id.length === 24) {
      return new _mongo.ObjectId(_id);
    }
    return new _mongo.ObjectId();
  };
  _mongo.connection = url;
  _mongo.collections_indexed = [];

  //ulimit -n 10000
  _mongo.dbList = [];

  _mongo.connections = [];
  _mongo.closeDbBusy = !1;
  ____0.on('[close-database]', (args, callback) => {
    callback = callback || function () {};

    if (_mongo.closeDbBusy == !0) {
      setTimeout(() => {
        ____0.call('[close-database]', args, callback);
      }, 2000);
      return;
    }

    if (_mongo.connections.length === 0) {
      callback();
      return;
    }

    _mongo.closeDbBusy = !0;
    console.log('Closing mongodb Connection Count : ' + _mongo.connections.length);
    for (let i = 0; i < _mongo.connections.length; i++) {
      console.log('Closing Database : ' + _mongo.connections[i].name);
      _mongo.connections[i].client.close();
    }

    setTimeout(() => {
      _mongo.closeDbBusy = !1;
      callback();
    }, 1000);
  });

  _mongo.removeCirculars = function (obj, depth = 0, maxDeep = 10, Symbol = Symbol('VISITED_MARK')) {
    if (!obj) {
      return obj;
    }

    const shouldSkip = !obj || obj[Symbol] || depth > maxDeep;

    const originalObj = obj;
    let result = {};

    Object.keys(originalObj).forEach((entry) => {
      const val = originalObj[entry];

      if (!shouldSkip) {
        if (typeof val === 'object') {
          originalObj[Symbol] = true;
          const nextDepth = depth + 1;
          result[entry] = _mongo.removeCirculars(val, nextDepth);
        } else {
          result[entry] = val;
        }
      } else {
        result = 'CIRCULAR';
        console.log(result);
      }
    });

    return result;
  };
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
      doc = _mongo.removeCirculars(doc);
      for (let key in doc) {
        if (key === '_id' && typeof doc[key] === 'string') {
          doc[key] = _mongo.ObjectID(doc[key]);
        } else if (typeof key === 'string' && key.indexOf('$') === 0) {
          delete doc[key];
        } else if (typeof doc[key] === 'string' && ____0.fn.isDate(doc[key])) {
          doc[key] = new Date(doc[key]);
          doc[key] = new Date(Date.UTC(doc[key].getFullYear(), doc[key].getMonth(), doc[key].getDate(), doc[key].getHours(), doc[key].getMinutes(), doc[key].getSeconds()));
        } else if (Array.isArray(doc[key])) {
          doc[key].forEach((v, i) => {
            doc[key][i] = _mongo.handleDoc(v, true);
          });
        } else if (typeof doc[key] === 'object' && key !== '_id') {
          doc[key] = _mongo.handleDoc(doc[key], true);
        }
      }
    }

    return doc;
  };

  _mongo.connectDBBusy = !1;
  _mongo.connectDB = async function (name, callback) {
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

          _mongo.connections.push({
            name: name,
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

  _mongo.createIndex = function (options, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectDB(options.dbName, function (err, db) {
      if (!err) {
        if (options.collectionName === undefined) {
          options.collectionName = ____0.options.mongodb.collection;
        }

        db.collection(____0.options.mongodb.prefix.collection + options.collectionName)
          .createIndex(options.obj, options.option)
          .then((result) => {
            callback(null, result);
            if (____0.options.mongodb.events) {
              ____0.call('mongodb after create index', {
                db: options.dbName,
                collection: options.collectionName,
                obj: options.obj,
              });
            }
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
    _mongo.connectDB(options.dbName, function (err, db) {
      if (!err) {
        if (options.collectionName === undefined) {
          options.collectionName = ____0.options.mongodb.collection;
        }

        db.collection(____0.options.mongodb.prefix.collection + options.collectionName)
          .dropIndex(options.obj, options.option)
          .then((result) => {
            callback(null, result);
            if (____0.options.mongodb.events) {
              ____0.call('mongodb after drop index', {
                db: options.dbName,
                collection: options.collectionName,
                obj: options.obj,
              });
            }
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
    _mongo.connectDB(options.dbName, function (err, db) {
      if (!err) {
        if (options.collectionName === undefined) {
          options.collectionName = ____0.options.mongodb.collection;
        }

        db.collection(____0.options.mongodb.prefix.collection + options.collectionName)
          .dropIndexes()
          .then((result) => {
            callback(null, result);
            if (____0.options.mongodb.events) {
              ____0.call('mongodb after drop index', {
                db: options.dbName,
                collection: options.collectionName,
                obj: options.obj,
              });
            }
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
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }
        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName)
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
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }
        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName)
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
    callback = callback || _mongo.callback;
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }

        obj.doc = _mongo.handleDoc(obj.doc);

        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName)
          .insertOne(obj.doc)
          .then((result) => {
            obj.doc._id = result.insertedId;
            callback(null, obj.doc, result);

            if (____0.options.mongodb.events) {
              ____0.call('mongodb after insert', {
                db: obj.dbName,
                collection: obj.collectionName,
                doc: result,
              });
            }
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
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (!obj.collectionName) {
          obj.collectionName = ____0.options.mongodb.collection;
        }
        obj.docs.forEach((doc, i) => {
          obj.docs[i] = _mongo.handleDoc(doc);
        });
        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName)
          .insertMany(obj.docs, obj.options)
          .then((result) => {
            callback(null, obj.docs, result);

            if (____0.options.mongodb.events) {
              ____0.call('mongodb after insert many', {
                db: obj.dbName,
                collection: obj.collectionName,
                docs: obj.docs,
              });
            }
          })
          .catch((err) => {
            console.error(' _mongo.insertMany() ', err.message);

            callback(err, obj.docs, result);
          });
      } else {
        console.error(' _mongo.insertMany() ', err.message);

        callback(err);
      }
    });
  };

  _mongo.findOne = function (obj, callback) {
    callback = callback || _mongo.callback;

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

        obj.where = _mongo.handleDoc(obj.where);

        if (obj.select === undefined) {
          obj.select = {};
        }

        let options = {
          projection: obj.select || {},
          limit: 1,
          skip: obj.skip,
          sort: obj.sort,
        };

        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName)
          .findOne(obj.where, options)
          .then((doc) => {
            callback(null, doc);
            if (____0.options.mongodb.events) {
              ____0.call('mongodb after find', {
                db: obj.dbName,
                collection: obj.collectionName,
                doc: doc,
              });
            }
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.find = _mongo.findMany = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }

        obj.where = _mongo.handleDoc(obj.where);

        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName)
          .countDocuments(obj.where)
          .then((count) => {
            if (count > 0) {
              let options = {
                projection: obj.select || {},
                limit: obj.limit ? parseInt(obj.limit) : ____0.options.mongodb.limit,
                skip: obj.skip ? parseInt(obj.skip) : 0,
                sort: obj.sort || null,
              };

              db.collection(____0.options.mongodb.prefix.collection + obj.collectionName)
                .find(obj.where, options)
                .toArray()
                .then((docs) => {
                  callback(null, docs, count);
                  if (____0.options.mongodb.events) {
                    ____0.call('mongodb after find many', {
                      db: obj.dbName,
                      collection: obj.collectionName,
                      docs: docs,
                    });
                  }
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
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }
        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName)
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

    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }

        obj.where = _mongo.handleDoc(obj.where);
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

        _mongo.findOne(
          {
            dbName: obj.dbName,
            collectionName: obj.collectionName,
            where: obj.where,
          },
          (err, old_doc) => {
            if (!err && old_doc) {
              db.collection(____0.options.mongodb.prefix.collection + obj.collectionName)
                .updateOne(obj.where, $update)
                .then((result) => {
                  _mongo.findOne(
                    {
                      dbName: obj.dbName,
                      collectionName: obj.collectionName,
                      where: obj.where,
                    },
                    (err2, new_doc) => {
                      callback(
                        null,
                        {
                          doc: new_doc,
                          old_doc: old_doc,
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
                          doc: new_doc,
                          old_doc: old_doc,
                          where: obj.where,
                          update: $update,
                        });
                      }
                    }
                  );
                })
                .catch((err) => {
                  callback(err);
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
    callback = callback || _mongo.callback;
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }
        obj.where = _mongo.handleDoc(obj.where);

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
        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName)
          .updateMany(obj.where, $update)
          .then((result) => {
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
                exists: result.result?.n,
                count: result.result?.nModified,
                ok: result.result?.ok,
                where: obj.where,
                update: $update,
              });
            }
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
    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }

        obj.where = _mongo.handleDoc(obj.where);

        _mongo.findOne(
          {
            where: obj.where,
            select: {},
            collectionName: obj.collectionName,
            dbName: obj.dbName,
          },
          function (err, doc) {
            if (!err && doc) {
              db.collection(____0.options.mongodb.prefix.collection + obj.collectionName)
                .deleteOne(obj.where)
                .then((result) => {
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
                })
                .catch((err) => {
                  callback(err);
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

    _mongo.connectDB(obj.dbName, function (err, db) {
      if (!err) {
        if (obj.collectionName === undefined) {
          obj.collectionName = ____0.options.mongodb.collection;
        }
        obj.where = _mongo.handleDoc(obj.where);
        db.collection(____0.options.mongodb.prefix.collection + obj.collectionName)
          .deleteMany(obj.where)
          .then((result) => {
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
