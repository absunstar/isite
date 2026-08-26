module.exports = function init(____0) {
  let mongodb = null;
  const getMongo = function () { return mongodb || (mongodb = require('mongodb')); };

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

  Object.defineProperty(_mongo, 'lib', { enumerable: true, get: getMongo });
  Object.defineProperty(_mongo, 'ObjectId', { enumerable: true, get: function () { return getMongo().ObjectId; } });
  _mongo.ObjectID = function (_id) {
    if (_id && typeof _id === 'string' && /^[a-fA-F0-9]{24}$/.test(_id)) {
      try {
        return new (getMongo().ObjectId)(_id);
      } catch (error) {
        console.error(error);
        return new (getMongo().ObjectId)();
      }
    }
    return new (getMongo().ObjectId)();
  };
  _mongo.connection = url;
  _mongo.collections_indexed = [];
  // v4: O(1) connection indexes while preserving legacy databaseList arrays.
  _mongo.databaseIndex = new Map();
  _mongo.collectionIndex = new Map();
  _mongo.databaseInflight = new Map();
  _mongo.collectionInflight = new Map();

  // v5: invalidate only the new opt-in query cache after successful writes.
  _mongo.invalidateQueryCache = function (obj) {
    if (!____0.query || typeof ____0.query.invalidate !== 'function' || !obj) return 0;
    const dbName = obj.dbName === undefined ? ____0.options.mongodb.db : obj.dbName;
    return ____0.query.invalidate(String(dbName) + '.' + String(obj.collectionName));
  };

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
      if (____0.databaseList[i]) ____0.databaseList[i].connected = false;
    }

    setTimeout(() => {
      _mongo.databaseIndex.clear();
      _mongo.collectionIndex.clear();
      _mongo.databaseInflight.clear();
      _mongo.collectionInflight.clear();
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

  // v4: connection establishment is de-duplicated per database/collection.
  // The callback API is intentionally unchanged; different databases no longer
  // block each other behind one global busy flag + polling timer.
  _mongo.connectDBBusy = !1; // legacy observable flag retained
  _mongo.connectDB = function (name, callback) {
    callback = callback || _mongo.callback;
    name = name === undefined ? ____0.options.mongodb.db : name;

    if (!____0.options.mongodb.enabled) {
      callback({ message: 'mongodb Not Enabled' }, null);
      return;
    }

    const cached = _mongo.databaseIndex.get(String(name));
    if (cached && cached.connected !== false) {
      callback(null, cached.db);
      return;
    }

    // Backfill the v4 index if external/legacy code populated databaseList.
    if (!cached) {
      const legacy = ____0.databaseList.find((item) => item && item.name === name);
      if (legacy) {
        _mongo.databaseIndex.set(String(name), legacy);
        callback(null, legacy.db);
        return;
      }
    }

    const key = String(name);
    let pending = _mongo.databaseInflight.get(key);
    if (!pending) {
      const db_name = ____0.options.mongodb.prefix.db + name;
      const db_url = _mongo.connection;
      ____0.log('\n ( Connecting DB : ' + db_url + ' ) \n');
      _mongo.connectDBBusy = !0;
      pending = (async () => {
        const mongodbClient = new (getMongo().MongoClient)(db_url, {
          serverSelectionTimeoutMS: 1000 * 10,
          timeoutMS: 1000 * 10,
          waitQueueTimeoutMS: 1000 * 10,
          connectTimeoutMS: 1000 * 10,
          socketTimeoutMS: 1000 * 10,
          maxConnecting: 1,
          ...____0.options.mongodb.config,
        });
        const client = await mongodbClient.connect();
        const db = client.db(db_name);
        const entry = { name, db_name, url: db_url, db, client, connected: !0 };
        ____0.databaseList.push(entry);
        _mongo.databaseIndex.set(key, entry);
        ____0.log('\n ( Connected DB : ' + db_name + ' ) : ' + db_url + '\n');
        return db;
      })().finally(() => {
        _mongo.databaseInflight.delete(key);
        _mongo.connectDBBusy = _mongo.databaseInflight.size > 0;
      });
      _mongo.databaseInflight.set(key, pending);
    }
    pending.then((db) => callback(null, db)).catch((err) => { ____0.log(err); callback(err, null); });
  };

  _mongo.connectCollectionBusy = !1; // legacy observable flag retained
  _mongo.connectCollection = function (options, callback) {
    callback = callback || _mongo.callback;
    options = options || {};
    if (options.collectionName === undefined) options.collectionName = ____0.options.mongodb.collection;
    const name = ____0.options.mongodb.prefix.collection + options.collectionName;
    const dbKey = options.dbName === undefined ? ____0.options.mongodb.db : options.dbName;
    const key = String(dbKey) + '\0' + String(name);

    const cached = _mongo.collectionIndex.get(key);
    if (cached) { callback(null, cached); return; }

    // Backward-compatible fallback for old list entries that did not record dbName.
    const legacy = ____0.databaseCollectionList.find((item) => item && item.name == name && (item.dbName === undefined || item.dbName == dbKey));
    if (legacy) {
      _mongo.collectionIndex.set(key, legacy.collection);
      callback(null, legacy.collection);
      return;
    }

    let pending = _mongo.collectionInflight.get(key);
    if (!pending) {
      _mongo.connectCollectionBusy = !0;
      pending = new Promise((resolve, reject) => {
        _mongo.connectDB(dbKey, function (err, db) {
          if (err) return reject(err);
          try {
            const collection = db.collection(name);
            ____0.databaseCollectionList.push({ name, dbName: dbKey, collection });
            _mongo.collectionIndex.set(key, collection);
            resolve(collection);
          } catch (error) { reject(error); }
        });
      }).finally(() => {
        _mongo.collectionInflight.delete(key);
        _mongo.connectCollectionBusy = _mongo.collectionInflight.size > 0;
      });
      _mongo.collectionInflight.set(key, pending);
    }
    pending.then((collection) => callback(null, collection)).catch((err) => callback(err, null));
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
            _mongo.invalidateQueryCache(obj);
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
            _mongo.invalidateQueryCache(obj);
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

  // v5 additive single-round-trip read for callers that do not need total count.
  _mongo.findManyFast = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (err) return callback(err, []);
      obj.where = _mongo.handleDoc(obj.where || {}, '');
      const options = {
        projection: obj.select || {},
        limit: obj.limit ? parseInt(obj.limit) : ____0.options.mongodb.limit,
        skip: obj.skip ? parseInt(obj.skip) : 0,
        sort: obj.sort || null,
      };
      collection.find(obj.where, options).toArray().then((docs) => callback(null, docs)).catch((error) => callback(error, []));
    });
  };

  // v5 additive page + total-count in one MongoDB round trip via $facet.
  _mongo.findPageFast = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (err) return callback(err, [], 0);
      obj.where = _mongo.handleDoc(obj.where || {}, '');
      const limit = obj.limit ? parseInt(obj.limit) : ____0.options.mongodb.limit;
      const skip = obj.skip ? parseInt(obj.skip) : 0;
      const data = [];
      if (obj.sort && Object.keys(obj.sort).length) data.push({ $sort: obj.sort });
      if (skip) data.push({ $skip: skip });
      if (limit) data.push({ $limit: limit });
      if (obj.select && Object.keys(obj.select).length) data.push({ $project: obj.select });
      const pipeline = [
        { $match: obj.where },
        { $facet: { data, meta: [{ $count: 'count' }] } },
      ];
      collection.aggregate(pipeline).toArray().then((rows) => {
        const row = rows[0] || { data: [], meta: [] };
        callback(null, row.data || [], row.meta?.[0]?.count || 0);
      }).catch((error) => callback(error, [], 0));
    });
  };



  // v6 additive high-throughput helpers. Legacy CRUD methods are unchanged.
  _mongo.findByIdsFast = function (obj, callback) {
    callback = callback || _mongo.callback;
    const ids = Array.isArray(obj.ids) ? obj.ids : [];
    if (ids.length === 0) { callback(null, []); return; }
    _mongo.connectCollection(obj, function (err, collection) {
      if (err) return callback(err, []);
      const field = obj.field || 'id';
      const where = _mongo.handleDoc({ ...(obj.where || {}), [field]: { $in: ids } }, '');
      const options = {
        projection: obj.select || {},
        sort: obj.sort || null,
      };
      collection.find(where, options).toArray().then((docs) => callback(null, docs)).catch((error) => callback(error, []));
    });
  };

  _mongo.bulkWriteFast = function (obj, callback) {
    callback = callback || _mongo.callback;
    const operations = Array.isArray(obj.operations) ? obj.operations : [];
    if (operations.length === 0) { callback(null, { acknowledged: true, insertedCount: 0, matchedCount: 0, modifiedCount: 0, deletedCount: 0 }); return; }
    _mongo.connectCollection(obj, function (err, collection) {
      if (err) return callback(err);
      collection.bulkWrite(operations, obj.options || {}).then((result) => {
        _mongo.invalidateQueryCache(obj);
        callback(null, result);
      }).catch((error) => callback(error));
    });
  };

  _mongo.findCursorFast = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (err) return callback(err, null);
      obj.where = _mongo.handleDoc(obj.where || {}, '');
      const options = {
        projection: obj.select || {},
        skip: obj.skip ? parseInt(obj.skip) : 0,
        sort: obj.sort || null,
        batchSize: obj.batchSize ? parseInt(obj.batchSize) : undefined,
      };
      let cursor = collection.find(obj.where, options);
      if (obj.limit) cursor = cursor.limit(parseInt(obj.limit));
      callback(null, cursor);
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
            _mongo.invalidateQueryCache(obj);
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
            _mongo.invalidateQueryCache(obj);
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
            _mongo.invalidateQueryCache(obj);
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
        }
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
            _mongo.invalidateQueryCache(obj);
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



  // // Add Promise support while preserving all existing callback signatures.
  // const _mongoPromiseMethods = {
  //   connectDB: ['value'],
  //   connectCollection: ['value'],
  //   createIndex: ['value'],
  //   dropIndex: ['value'],
  //   dropIndexes: ['value'],
  //   aggregate: ['value'],
  //   dropCollection: ['value'],
  //   insertOne: ['doc', 'result'],
  //   insertMany: ['docs', 'result'],
  //   findOne: ['value'],
  //   count: ['value'],
  //   findMany: ['docs', 'count'],
  //   distinct: ['value'],
  //   updateOne: ['value'],
  //   updateMany: ['value'],
  //   deleteOne: ['value'],
  //   deleteMany: ['value'],
  // };

  // const _mongoWrapPromise = (methodName, resultKeys) => {
  //   const original = _mongo[methodName];
  //   if (typeof original !== 'function') return;

  //   _mongo[methodName] = function (...args) {
  //     // Internal calls may have a callback before another argument.
  //     if (args.some((arg) => typeof arg === 'function')) {
  //       return original.apply(_mongo, args);
  //     }

  //     return new Promise((resolve, reject) => {
  //       original.apply(_mongo, [
  //         ...args,
  //         (err, ...values) => {
  //           if (err) {
  //             reject(err);
  //             return;
  //           }

  //           if (resultKeys.length === 1 && resultKeys[0] === 'value') {
  //             resolve(values[0]);
  //             return;
  //           }

  //           const result = {};
  //           resultKeys.forEach((key, index) => {
  //             result[key] = values[index];
  //           });
  //           resolve(result);
  //         },
  //       ]);
  //     });
  //   };
  // };

  // Object.entries(_mongoPromiseMethods).forEach(([methodName, resultKeys]) => {
  //   _mongoWrapPromise(methodName, resultKeys);
  // });

  // // Restore aliases so they point to the Promise-enabled wrappers.
  // _mongo.insert = _mongo.insertMany;
  // _mongo.find = _mongo.findMany;
  // _mongo.update = _mongo.updateMany;
  // _mongo.delete = _mongo.deleteMany;

  return _mongo;
};
