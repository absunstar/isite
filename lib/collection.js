module.exports = function init(____0, option, db) {
  const $collection = {};

  ____0.on(____0.strings[4], (_) => {
    $collection.busy = !_;
  });

  if (typeof option === 'string') {
    option = {
      collection: option,
    };
    $collection.collection = option;
    $collection.db = db || ____0.options.mongodb.db;
  }

  $collection.options = { ...____0.options.mongodb, ...option };
  $collection.options.db = $collection.options.db.trim().replace(' ', '');
  $collection.options.collection = $collection.options.collection.trim().replace(' ', '');
  $collection.identityEnabled = $collection.options.identity.enabled;
  $collection.name = $collection.options.db + '.' + $collection.options.collection;
  $collection.guid = ____0.hide($collection.options);
  if ((co = ____0.collectionList.find((c) => c.guid == $collection.guid))) {
    return co;
  }
  $collection.db = $collection.options.db;
  $collection.collection = $collection.options.collection;
  $collection.docs = [];

  $collection.busy = !0;
  $collection.insertBusy = !1;
  $collection.updateBusy = !1;
  $collection.deleteBusy = !1;

  $collection.opration_busy = !1;
  $collection.opration_list = [];
  $collection.run_count = 0;

  $collection.callback = function (...args) {
    console.log(...args);
  };

  $collection.run = function () {
    $collection.run_count++;
    // console.log('run : ' + $collection.run_count + ' , count : ' + $collection.opration_list.length)
    if ($collection.opration_busy) {
      return;
    }
    if ($collection.opration_list.length == 0) {
      return;
    }
    $collection.opration_busy = !0;
    let opration = $collection.opration_list.shift();

    if (opration.type == 'add') {
      $collection.add(opration.options, opration.callback, 2);
    } else if (opration.type == 'addAll') {
      $collection.addAll(opration.options, opration.callback, 2);
    } else if (opration.type == 'update') {
      $collection.update(opration.options, opration.callback, 2);
    } else if (opration.type == 'updateAll') {
      $collection.updateAll(opration.options, opration.callback, 2);
    } else if (opration.type == 'delete') {
      $collection.delete(opration.options, opration.callback, 2);
    } else if (opration.type == 'deleteAll') {
      $collection.deleteAll(opration.options, opration.callback, 2);
    } else if (opration.type == 'get') {
      $collection.get(opration.options, opration.callback, 2);
    } else if (opration.type == 'getAll') {
      $collection.getAll(opration.options, opration.callback, 2);
    }
  };

  $collection.insertOne =
    $collection.insert =
    $collection.add =
    $collection.addOne =
      ($doc, callback, run) => {
        if ($collection.busy) {
          setTimeout(() => {
            $collection.add($doc, callback, run);
          }, 100);
          return;
        }
        callback = callback || function () {};
        if (run !== 2 && run !== !0) {
          $collection.opration_list.push({
            options: $doc,
            callback: callback,
            type: 'add',
          });
          $collection.run();
        } else {
          $doc.id = typeof $doc.id === 'number' ? $doc.id : null;

          if ($collection.identityEnabled === !0 && !$doc.id) {
            $doc.id = ____0.mongodb.collections_indexed[$collection.collection].nextID;
            ____0.mongodb.collections_indexed[$collection.collection].nextID = $collection.step + ____0.mongodb.collections_indexed[$collection.collection].nextID;

            if ($doc.id + 1 !== ____0.mongodb.collections_indexed[$collection.collection].nextID) {
              $doc.id = ____0.mongodb.collections_indexed[$collection.collection].nextID - 1;
            }
          }

          if ($collection.identityEnabled === !0 && $doc.id >= ____0.mongodb.collections_indexed[$collection.collection].nextID) {
            ____0.mongodb.collections_indexed[$collection.collection].nextID = $doc.id + 1;
          }

          ____0.mongodb.insertOne(
            {
              collectionName: $collection.collection,
              dbName: $collection.db,
              doc: $doc,
            },
            function (err, docInserted) {
              callback(err, docInserted, $doc);
              if (run === !0) {
                return;
              }
              $collection.opration_busy = !1;
              $collection.run();
            }
          );
        }
      };
  $collection.update =
    $collection.updateOne =
    $collection.edit =
    $collection.editOne =
      (options, callback, run) => {
        callback = callback || $collection.callback;

        if (!options) {
          return;
        }
        if (run !== 2 && run !== !0) {
          $collection.opration_list.push({
            options: options,
            callback: callback,
            type: 'update',
          });
          $collection.run();
        } else {
          let newOptions = {};

          if (options.set) {
            newOptions.set = options.set;
          } else {
            newOptions.set = options;
          }

          if (options.unset) {
            newOptions.unset = options.unset;
          }
          if (options.rename) {
            newOptions.rename = options.rename;
          }

          if (options.where) {
            newOptions.where = options.where;
          } else {
            newOptions.where = {
              _id: newOptions.set._id,
              id: newOptions.set.id,
            };
          }

          if (newOptions.where === undefined || newOptions.set === undefined) {
            callback({
              message: '\n updateOne() : Must Assign [ Where & Set ] Properties \n' + JSON.stringify(options),
            });

            if (run === !0) {
              return;
            }

            $collection.opration_busy = !1;
            $collection.run();
            return;
          }

          if (newOptions.where && newOptions.where.id) {
            newOptions.where.id = ____0.toInt(newOptions.where.id);
          }

          ____0.mongodb.updateOne(
            {
              collectionName: $collection.collection,
              dbName: $collection.db,
              where: newOptions.where,
              set: newOptions.set || {},
              unset: newOptions.unset || {},
              rename: newOptions.rename || {},
            },
            function (err, result, result2) {
              callback(err, result, result2);
              if (run === !0) {
                return;
              }
              $collection.opration_busy = !1;
              $collection.run();
            }
          );
        }
      };
  $collection.delete =
    $collection.deleteOne =
    $collection.remove =
    $collection.removeOne =
      ($options, callback, run) => {
        callback = callback || function () {};

        if (!$options) {
          return;
        }

        if (run !== 2 && run !== !0) {
          $collection.opration_list.push({
            options: $options,
            callback: callback,
            type: 'delete',
          });
          $collection.run();
        } else {
          let newOptions = {};

          if ($options.where === undefined) {
            newOptions.where = $options;
          } else {
            newOptions = $options;
          }

          if (newOptions.where === undefined) {
            callback({
              message: '\n delete() : Must Assign [ Where ] Propertie \n' + JSON.stringify(options),
            });
            if (run === !0) {
              return;
            }

            $collection.opration_busy = !1;
            $collection.run();
            return;
          }

          if (typeof newOptions.where.id === 'string') {
            newOptions.where.id = ____0.toInt(newOptions.where.id);
          }

          ____0.mongodb.deleteOne(
            {
              collectionName: $collection.collection,
              dbName: $collection.db,
              where: newOptions.where,
            },
            function (err, result) {
              callback(err, result);
              if (run === !0) {
                return;
              }
              $collection.opration_busy = !1;
              $collection.run();
            }
          );
        }
      };
  $collection.get =
    $collection.getOne =
    $collection.find =
    $collection.findOne =
    $collection.select =
    $collection.selectOne =
      (options, callback, run) => {
        callback = callback || function () {};
        if (run !== 2 && run !== !0) {
          $collection.opration_list.push({
            options: options,
            callback: callback,
            type: 'get',
          });
          $collection.run();
        } else {
          let newOptions = {};

          if (options.where === undefined) {
            newOptions.where = options;
          } else {
            newOptions.where = options.where;
          }
          if (options.select === undefined) {
            newOptions.select = {};
          } else {
            newOptions.select = options.select;
          }
          if (options.sort === undefined) {
            newOptions.sort = {};
          } else {
            newOptions.sort = options.sort;
          }

          if (newOptions.where.id && typeof newOptions.where.id === 'string') {
            newOptions.where.id = ____0.toInt(newOptions.where.id);
          }

          ____0.mongodb.findOne(
            {
              collectionName: $collection.collection,
              dbName: $collection.db,
              where: newOptions.where,
              select: newOptions.select,
              sort: newOptions.sort,
            },
            function (err, doc) {
              callback(err, doc);
              if (run === !0) {
                return;
              }
              $collection.opration_busy = !1;
              $collection.run();
            }
          );
        }
      };
  $collection.getMany =
    $collection.getAll =
    $collection.findAll =
    $collection.findMany =
    $collection.selectAll =
    $collection.selectMany =
      (options, callback, run) => {
        callback = callback || function () {};
        if (run !== 2 && run !== !0) {
          $collection.opration_list.push({
            options: options,
            callback: callback,
            type: 'getAll',
          });
          $collection.run();
        } else {
          let newOptions = { where: {} };

          if (!options.where && !options.select && !options.limit && !options.sort && !options.skip) {
            newOptions.where = options;
          }

          if (options.select) {
            newOptions.select = option.select;
          }
          if (options.limit) {
            newOptions.limit = option.limit;
          }
          if (options.sort) {
            newOptions.sort = option.sort;
          }
          if (options.skip) {
            newOptions.skip = option.skip;
          }
          if (newOptions.where.id && typeof newOptions.where.id === 'string') {
            newOptions.where.id = ____0.toInt(newOptions.where.id);
          }

          ____0.mongodb.findMany(
            {
              collectionName: $collection.collection,
              dbName: $collection.db,
              where: newOptions.where || {},
              select: newOptions.select || {},
              limit: newOptions.limit || ____0.options.mongodb.limit,
              sort: newOptions.sort || null,
              skip: newOptions.skip || 0,
            },
            function (err, docs, count) {
              callback(err, docs, count);
              if (run === !0) {
                return;
              }
              $collection.opration_busy = !1;
              $collection.run();
            }
          );
        }
      };
  $collection.insertMany =
    $collection.addMany =
    $collection.insertAll =
    $collection.addAll =
      (docs, callback, run) => {
        callback = callback || function () {};

        if (!Array.isArray(docs) || docs.length === 0) {
          callback({
            message: '!docs or docs.length = 0 ',
          });
          return;
        }

        if (run !== 2 && run !== !0) {
          $collection.opration_list.push({
            options: docs,
            callback: callback,
            type: 'addAll',
          });
          $collection.run();
        } else {
          docs = docs.filter((d) => d !== null && typeof d == 'object');
          docs.forEach(($doc) => {
            if ($collection.identityEnabled === !0 && !$doc.id) {
              $doc.id = ____0.mongodb.collections_indexed[$collection.collection].nextID;
              ____0.mongodb.collections_indexed[$collection.collection].nextID = $collection.step + ____0.mongodb.collections_indexed[$collection.collection].nextID;

              if ($doc.id + 1 !== ____0.mongodb.collections_indexed[$collection.collection].nextID) {
                $doc.id = ____0.mongodb.collections_indexed[$collection.collection].nextID - 1;
              }
            }

            if ($collection.identityEnabled === !0 && $doc.id >= ____0.mongodb.collections_indexed[$collection.collection].nextID) {
              ____0.mongodb.collections_indexed[$collection.collection].nextID = $doc.id + 1;
            }
          });
          ____0.mongodb.insertMany(
            {
              collectionName: $collection.collection,
              dbName: $collection.db,
              docs: docs,
              options: { ordered: true },
            },
            (err, result) => {
              callback(err, result);
              if (run === !0) {
                return;
              }
              $collection.opration_busy = !1;
              $collection.run();
            }
          );
        }
      };
  $collection.updateMany =
    $collection.editMany =
    $collection.updateAll =
    $collection.editAll =
      (options, callback, run) => {
        callback = callback || function () {};

        if (run !== 2 && run !== !0) {
          $collection.opration_list.push({
            options: options,
            callback: callback,
            type: 'updateAll',
          });
          $collection.run();
        } else {
          if (options.where === undefined || options.set === undefined) {
            callback({
              message: '\n updateMany() : Must Assign [ where , set ] Properties \n ' + JSON.stringify(options),
            });
            if (run === !0) {
              return;
            }
            $collection.opration_busy = !1;
            $collection.run();
            return;
          }

          if (options.where && options.where.id && typeof options.where.id == 'string') {
            options.where.id = ____0.toInt(options.where.id);
          }

          ____0.mongodb.updateMany(
            {
              collectionName: $collection.collection,
              dbName: $collection.db,
              where: options.where,
              set: options.set || {},
              unset: options.unset,
              rename: options.rename,
            },
            (err, result) => {
              callback(err, result);
              if (run === !0) {
                return;
              }
              $collection.opration_busy = !1;
              $collection.run();
            }
          );
        }
      };
  $collection.deleteMany =
    $collection.removeMany =
    $collection.deleteAll =
    $collection.removeAll =
      ($options, callback, run) => {
        callback = callback || function () {};
        if (run !== 2 && run !== !0) {
          $collection.opration_list.push({
            options: $options,
            callback: callback,
            type: 'deleteAll',
          });
          $collection.run();
        } else {
          let options = {};
          if ($options.where === undefined) {
            options.where = $options;
          } else {
            options = $options;
          }

          if (options.where && options.where.id) {
            options.where.id = ____0.toInt(options.where.id);
          }

          ____0.mongodb.deleteMany(
            {
              collectionName: $collection.collection,
              dbName: $collection.db,
              where: options.where,
            },
            function (err, result) {
              callback(err, result);
              if (run === !0) {
                return;
              }
              $collection.opration_busy = !1;
              $collection.run();
            }
          );
        }
      };

  $collection.ObjectId = $collection.ObjectID = function (_id) {
    if (typeof _id === 'string' && _id.length === 24) {
      return ____0.mongodb.ObjectID(_id);
    }
    return ____0.mongodb.ObjectID();
  };

  $collection.drop = (callback) => {
    callback = callback || $collection.callback;
    ____0.mongodb.dropCollection(
      {
        collectionName: $collection.collection,
        dbName: $collection.db,
      },
      (err, ok) => {
        if (ok) {
          ____0.mongodb.collections_indexed[$collection.collection].nextID = 1;
        }
        callback(err, ok);
      }
    );
  };

  $collection.createUnique = (obj, callback) => {
    callback = callback || $collection.callback;

    ____0.mongodb.createIndex(
      {
        collectionName: $collection.collection,
        dbName: $collection.db,
        obj: obj,
        option: {
          unique: true,
          dropDups: true,
        },
      },
      (err, result) => {
        callback(err, result);
      }
    );
  };

  $collection.createIndex = (obj, options, callback) => {
    callback = callback || $collection.callback;

    if (typeof options == 'function') {
      callback = options;
    }

    ____0.mongodb.createIndex(
      {
        collectionName: $collection.collection,
        dbName: $collection.db,
        obj: obj,
        options: options,
      },
      (err, result) => {
        callback(err, result);
      }
    );
  };
  $collection.dropIndex = (obj, options, callback) => {
    callback = callback || $collection.callback;

    if (typeof options == 'function') {
      callback = options;
    }

    ____0.mongodb.dropIndex(
      {
        collectionName: $collection.collection,
        dbName: $collection.db,
        obj: obj,
        options: options,
      },
      (err, result) => {
        callback(err, result);
      }
    );
  };
  $collection.dropIndexes = (options, callback) => {
    callback = callback || $collection.callback;

    if (typeof options == 'function') {
      callback = options;
    }

    ____0.mongodb.dropIndexes(
      {
        collectionName: $collection.collection,
        dbName: $collection.db,
        options: options,
      },
      (err, result) => {
        callback(err, result);
      }
    );
  };
  $collection.aggregate = (arr, callback) => {
    callback = callback || $collection.callback;

    ____0.mongodb.aggregate(
      {
        collectionName: $collection.collection,
        dbName: $collection.db,
        arr: arr,
      },
      (err, docs) => {
        callback(err, docs);
      }
    );
  };

  $collection.findDuplicate = (obj, callback) => {
    callback = callback || $collection.callback;

    if (typeof obj === 'string') {
      obj = {
        value: '$' + obj,
      };
    }

    for (let [key, val] of Object.entries(obj)) {
      if (val == 1) {
        if (key.contains('.')) {
          delete obj[key];
          obj[key.replace('.', '_')] = '$' + key;
        } else {
          obj[key] = '$' + key;
        }
      }
    }

    let arr = [];
    arr.push({
      $group: {
        _id: obj,
        list: {
          $addToSet: '$_id',
        },
        count: {
          $sum: 1,
        },
      },
    });
    arr.push({
      $match: {
        count: {
          $gt: 1,
        },
      },
    });
    arr.push({
      $sort: {
        count: -1,
      },
    });
    $collection.aggregate(arr, (err, docs) => {
      callback(err, docs);
    });
  };

  $collection.deleteDuplicate = $collection.removeDuplicate = (obj, callback) => {
    callback = callback || $collection.callback;

    $collection.findDuplicate(obj, (err, result) => {
      if (!err) {
        let count = 0;
        let total = 0;
        let errors = [];
        let lastErr = null;
        for (let i = 0; i < result.length; i++) {
          for (let j = result[i].list.length - 1; j > 0; j--) {
            count++;
            total++;
            $collection.delete(result[i].list[j].toString(), (err, result) => {
              count--;
              if (err) {
                lastErr = err;
                errors.push(err);
              }
              if (count === 0) {
                callback(lastErr, {
                  count: total,
                  errors: errors,
                });
              }
            });
          }
        }
        if (count === 0) {
          callback(lastErr, {
            count: total,
            errors: errors,
          });
        }
      }
    });
  };

  $collection.loadAll = (options, callback) => {
    callback = callback || $collection.callback;

    ____0.mongodb.findMany(
      {
        collectionName: $collection.collection,
        dbName: $collection.db,
        where: options.where || {},
        select: options.select || {},
        limit: options.limit || 1000000,
        sort: options.sort || null,
        skip: options.skip || 0,
      },
      function (err, docs) {
        if (!err && docs) {
          $collection.docs = docs;
        }
        if (callback) callback(err, docs);
      }
    );
  };

  $collection.import = function (file_path, callback) {
    callback = callback || function () {};

    if (____0.isFileExistsSync(file_path)) {
      console.log('[ imported file exists ]');
      let docs = ____0.fromJson(____0.readFileSync(file_path).toString());
      console.log('[ imported file readed ]');
      if (Array.isArray(docs)) {
        docs.forEach((doc) => {
          $collection.addOne(doc, (err, doc2) => {
            if (!err && doc) {
              console.log('[ import doc ] ' + doc2.id);
            } else {
              console.log(err);
            }
          });
        });
        callback(null, []);
      } else if (____0.typeof(docs) === 'Object') {
        $collection.addOne(docs, (err, doc2) => {
          callback(err, doc2);
        });
      } else {
        console.log('can not import unknown type : ' + ____0.typeof(docs));
        callback({
          message: 'can not import unknown type : ' + ____0.typeof(docs),
        });
      }
    } else {
      console.log('file not exists : ' + file_path);
      callback({
        message: 'file not exists : ' + file_path,
      });
    }
  };

  $collection.export = function (options, file_path, callback) {
    callback = callback || function () {};
    let response = {
      done: !1,
      file_path: file_path,
    };
    $collection.getMany(options, (err, docs) => {
      if (!err && docs) {
        response.docs = docs;
        ____0.writeFile(file_path, JSON.stringify(docs), (err) => {
          if (err) {
            response.err = err;
          } else {
            response.done = !0;
          }
          callback(response);
        });
      } else {
        response.err = err;
        callback(response);
      }
    });
  };

  // id Handle

  if ($collection.identityEnabled) {
    if ((deleteDuplicate = false)) {
      $collection.aggregate(
        [
          {
            $group: {
              _id: {
                id: '$id',
              },
              dups: {
                $push: '$_id',
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $match: {
              count: {
                $gt: 1,
              },
            },
          },
        ],
        function (err, docs) {
          if (!err && docs) {
            let arr = [];
            docs.forEach((doc) => {
              doc.dups.shift();
              doc.dups.forEach((dup) => {
                arr.push(dup);
              });
            });
            $collection.deleteAll(
              {
                _id: {
                  $in: arr,
                },
              },
              (err, result) => {
                $collection.createUnique(
                  {
                    id: 1,
                  },
                  () => {}
                );
              }
            );
          }
          return;
        }
      );
    }

    $collection.handleIndex = function () {
      $collection.busy = !0;
      $collection.identityEnabled = !0;
      $collection.step = ____0.options.mongodb.identity.step;
      if (!____0.mongodb.collections_indexed[$collection.collection]) {
        ____0.mongodb.collections_indexed[$collection.collection] = {
          nextID: ____0.options.mongodb.identity.start,
        };
      }

      let id = ____0.options.mongodb.identity.start;

      $collection.findMany(
        {
          select: {
            id: 1,
          },
          sort: {
            id: -1,
          },
          limit: 1,
        },
        (err, docs, count) => {
          if (!err && docs && docs[0] && docs[0].id) {
            if (typeof docs[0].id === 'number' && docs[0].id >= id) {
              id = docs[0].id + 1;
            } else {
              id += count;
            }
          }

          ____0.mongodb.collections_indexed[$collection.collection].nextID = id;
          $collection.busy = !1;
        }
      );
    };

    $collection.handleIndex();
  } else {
    ____0.mongodb.collections_indexed[$collection.collection] = { nextID: 1 };
  }

  ____0.collectionList.push($collection);
  return $collection;
};
