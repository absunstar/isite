module.exports = function init(____0, options, db) {
    const $collection = {};

    ____0.on(____0.strings[4], (_) => {
        $collection.taskBusy = !_;
    });

    if (typeof options === 'string') {
        options = {
            collection: options,
        };
    }

    $collection.options = { ...____0.options.mongodb, ...options };
    $collection.options.db = $collection.options.db.trim().replace(' ', '');
    $collection.options.collection = $collection.options.collection.trim().replace(' ', '');
    $collection.identityEnabled = $collection.options.identity.enabled;
    $collection.name = $collection.options.db + '.' + $collection.options.collection;
    $collection.guid = ____0.hide($collection.options);
    const existingCollection = ____0.collectionByGuid?.get($collection.guid) || ____0.collectionList.find((c) => c.guid == $collection.guid);
    if (existingCollection) {
        return existingCollection;
    }
    $collection.db = $collection.options.db;
    $collection.collection = $collection.options.collection;
    $collection.docs = [];

    $collection.insertBusy = !1;
    $collection.updateBusy = !1;
    $collection.deleteBusy = !1;

    $collection.taskBusy = !1;
    $collection.taskList = [];
    $collection.taskCount = 0;
    $collection._taskScheduled = false;

    $collection.scheduleNextTask = function () {
        if ($collection.taskBusy || $collection._taskScheduled || $collection.taskList.length === 0) return;
        $collection._taskScheduled = true;
        setImmediate(function () {
            $collection._taskScheduled = false;
            if (!$collection.taskBusy && $collection.taskList.length > 0) $collection.checkTaskList();
        });
    };

    $collection.enqueueTask = function (task) {
        $collection.taskList.push(task);
        $collection.scheduleNextTask();
    };

    $collection.taskDone = function () {
        $collection.taskBusy = !1;
        $collection.scheduleNextTask();
    };

    $collection.callback = function (...args) {
        ____0.log(...args);
    };

    $collection.checkTaskList = function () {
        if ($collection.taskBusy || $collection.taskList.length === 0) return;
        $collection.taskBusy = !0;
        $collection.taskCount++;

        // console.log($collection.name + ' : canRunTask : ' + $collection.taskCount + ' , in-Waiting : ' + $collection.taskList.length);

        let task = $collection.taskList.shift();

        if (task.type == 'add') {
            $collection.add(task.options, task.callback, true);
        } else if (task.type == 'addAll') {
            $collection.addAll(task.options, task.callback, true);
        } else if (task.type == 'update') {
            $collection.update(task.options, task.callback, true);
        } else if (task.type == 'updateAll') {
            $collection.updateAll(task.options, task.callback, true);
        } else if (task.type == 'delete') {
            $collection.delete(task.options, task.callback, true);
        } else if (task.type == 'deleteAll') {
            $collection.deleteAll(task.options, task.callback, true);
        } else if (task.type == 'get') {
            $collection.get(task.options, task.callback, true);
        } else if (task.type == 'getAll') {
            $collection.getAll(task.options, task.callback, true);
        } else if (task.type == 'count') {
            $collection.getCount(task.options, task.callback, true);
        }
    };

    $collection.insertOne =
        $collection.insert =
        $collection.add =
        $collection.addOne =
            ($doc, callback, canRunTask = false) => {
                callback = callback || $collection.callback;
                if (!canRunTask) {
                    $collection.enqueueTask({
                        options: $doc,
                        callback: callback,
                        type: 'add',
                    });
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
                            $collection.taskDone();
                        }
                    );
                }
            };
    $collection.update =
        $collection.updateOne =
        $collection.edit =
        $collection.editOne =
            (options, callback, canRunTask = false) => {
                callback = callback || $collection.callback;
                if (!canRunTask) {
                    $collection.enqueueTask({
                        options: options,
                        callback: callback,
                        type: 'update',
                    });
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

                        $collection.taskDone();
                        return;
                    }

                    if (newOptions.where && newOptions.where.id && typeof newOptions.where.id == 'string') {
                        newOptions.where.id = ____0.toInt(newOptions.where.id) || newOptions.where.id;
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
                        function (err, result) {
                            callback(err, result);
                            $collection.taskDone();
                        }
                    );
                }
            };
    $collection.delete =
        $collection.deleteOne =
        $collection.remove =
        $collection.removeOne =
            ($options, callback, canRunTask = false) => {
                callback = callback || $collection.callback;

                if (!$options) {
                    return;
                }

                if (!canRunTask) {
                    $collection.enqueueTask({
                        options: $options,
                        callback: callback,
                        type: 'delete',
                    });
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

                        $collection.taskDone();
                        return;
                    }

                    if (newOptions.where.id && newOptions.where.id && typeof newOptions.where.id === 'string') {
                        newOptions.where.id = ____0.toInt(newOptions.where.id) || newOptions.where.id;
                    }

                    ____0.mongodb.deleteOne(
                        {
                            collectionName: $collection.collection,
                            dbName: $collection.db,
                            where: newOptions.where,
                        },
                        function (err, result) {
                            callback(err, result);
                            $collection.taskDone();
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
            (options, callback, canRunTask = false) => {
                callback = callback || $collection.callback;
                if (!canRunTask) {
                    $collection.enqueueTask({
                        options: options,
                        callback: callback,
                        type: 'get',
                    });
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

                    if (newOptions.where.id && newOptions.where.id && typeof newOptions.where.id === 'string') {
                        newOptions.where.id = ____0.toInt(newOptions.where.id) || newOptions.where.id;
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
                            $collection.taskDone();
                        }
                    );
                }
            };
    $collection.count = $collection.getCount = function (options, callback, canRunTask = false) {
        callback = callback || $collection.callback;
        if (!canRunTask) {
            $collection.enqueueTask({
                options: options,
                callback: callback,
                type: 'count',
            });
        } else {
            let newOptions = { where: {} };

            if (options.where) {
                newOptions.where = options.where;
            } else {
                newOptions.where = options;
            }

            ____0.mongodb.count(
                {
                    collectionName: $collection.collection,
                    dbName: $collection.db,
                    where: newOptions.where || {},
                },
                function (err, count) {
                    callback(err, count);
                    $collection.taskDone();
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
            (options, callback, canRunTask = false) => {
                callback = callback || $collection.callback;
                if (!canRunTask) {
                    $collection.enqueueTask({
                        options: options,
                        callback: callback,
                        type: 'getAll',
                    });
                } else {
                    let newOptions = { where: {} };

                    if (!options.where && !options.select && !options.limit && !options.sort && !options.skip) {
                        newOptions.where = options;
                    }
                    if (options.where) {
                        newOptions.where = options.where;
                    }
                    if (options.select) {
                        newOptions.select = options.select;
                    }
                    if (options.limit) {
                        newOptions.limit = options.limit;
                    }
                    if (options.sort) {
                        newOptions.sort = options.sort;
                    }
                    if (options.skip) {
                        newOptions.skip = options.skip;
                    }
                    if (newOptions.where.id && typeof newOptions.where.id === 'string') {
                        newOptions.where.id = ____0.toInt(newOptions.where.id) || newOptions.where.id;
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
                            $collection.taskDone();
                        }
                    );
                }
            };
    $collection.insertMany =
        $collection.addMany =
        $collection.insertAll =
        $collection.addAll =
            (docs, callback, canRunTask = false) => {
                callback = callback || $collection.callback;

                if (!Array.isArray(docs) || docs.length === 0) {
                    callback({
                        message: '!docs or docs.length = 0 ',
                    });
                    return;
                }

                if (!canRunTask) {
                    $collection.enqueueTask({
                        options: docs,
                        callback: callback,
                        type: 'addAll',
                    });
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
                            $collection.taskDone();
                        }
                    );
                }
            };
    $collection.updateMany =
        $collection.editMany =
        $collection.updateAll =
        $collection.editAll =
            (options, callback, canRunTask = false) => {
                callback = callback || $collection.callback;

                if (!canRunTask) {
                    $collection.enqueueTask({
                        options: options,
                        callback: callback,
                        type: 'updateAll',
                    });
                } else {
                    if (options.where === undefined || options.set === undefined) {
                        callback({
                            message: '\n updateMany() : Must Assign [ where , set ] Properties \n ' + JSON.stringify(options),
                        });

                        $collection.taskDone();
                        return;
                    }

                    if (options.where && options.where.id && typeof options.where.id == 'string') {
                        options.where.id = ____0.toInt(options.where.id) || options.where.id;
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

                            $collection.taskDone();
                        }
                    );
                }
            };
    $collection.deleteMany =
        $collection.removeMany =
        $collection.deleteAll =
        $collection.removeAll =
            ($options, callback, canRunTask = false) => {
                callback = callback || $collection.callback;
                if (!canRunTask) {
                    $collection.enqueueTask({
                        options: $options,
                        callback: callback,
                        type: 'deleteAll',
                    });
                } else {
                    let options = {};
                    if ($options.where === undefined) {
                        options.where = $options;
                    } else {
                        options = $options;
                    }

                    if (options.where && options.where.id && typeof options.where.id === 'string') {
                        options.where.id = ____0.toInt(options.where.id) || options.where.id;
                    }

                    ____0.mongodb.deleteMany(
                        {
                            collectionName: $collection.collection,
                            dbName: $collection.db,
                            where: options.where,
                        },
                        function (err, result) {
                            callback(err, result);

                            $collection.taskDone();
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
        callback = callback || $collection.callback;

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
        callback = callback || $collection.callback;
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
        $collection.createUnique(
            {
                id: 1,
            },
            () => {}
        );

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
            $collection.taskBusy = !0;
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
                    $collection.taskDone();
                },
                true
            );
        };

        $collection.handleIndex();
    } else {
        ____0.mongodb.collections_indexed[$collection.collection] = { nextID: 1 };
    }



    // Add Promise support while preserving all existing callback signatures,
    // aliases, and the collection task queue.
//     const _collectionPromiseMethods = {
//         addOne: ['doc', 'originalDoc'],
//         updateOne: ['value'],
//         deleteOne: ['value'],
//         findOne: ['value'],
//         getCount: ['value'],
//         findMany: ['docs', 'count'],
//         addAll: ['value'],
//         updateAll: ['value'],
//         deleteAll: ['value'],
//         drop: ['value'],
//         createUnique: ['value'],
//         createIndex: ['value'],
//         dropIndex: ['value'],
//         dropIndexes: ['value'],
//         aggregate: ['value'],
//         findDuplicate: ['value'],
//         deleteDuplicate: ['value'],
//         loadAll: ['value'],
//         import: ['value'],
//     };

//     const _collectionWrapPromise = (methodName, resultKeys) => {
//         const original = $collection[methodName];
//         if (typeof original !== 'function') return;

//         $collection[methodName] = function (...args) {
//             // Queue internals pass callback plus canRunTask=true.
//             if (args.some((arg) => typeof arg === 'function')) {
//                 return original.apply($collection, args);
//             }

//             return new Promise((resolve, reject) => {
//                 original.apply($collection, [
//                     ...args,
//                     (err, ...values) => {
//                         if (err) {
//                             reject(err);
//                             return;
//                         }

//                         if (resultKeys.length === 1 && resultKeys[0] === 'value') {
//                             resolve(values[0]);
//                             return;
//                         }

//                         const result = {};
//                         resultKeys.forEach((key, index) => {
//                             result[key] = values[index];
//                         });
//                         resolve(result);
//                     },
//                 ]);
//             });
//         };
//     };

//     Object.entries(_collectionPromiseMethods).forEach(([methodName, resultKeys]) => {
//         _collectionWrapPromise(methodName, resultKeys);
//     });

//     // export() uses callback(response), not callback(error, response).
//     const _collectionExportOriginal = $collection.export;
//     $collection.export = function (...args) {
//         if (args.some((arg) => typeof arg === 'function')) {
//             return _collectionExportOriginal.apply($collection, args);
//         }

//         return new Promise((resolve, reject) => {
//             _collectionExportOriginal.apply($collection, [
//                 ...args,
//                 (response) => {
//                     if (response && response.err) {
//                         reject(response.err);
//                         return;
//                     }
//                     resolve(response);
//                 },
//             ]);
//         });
//     };

//     // Restore every public alias so all names use the Promise-enabled wrapper.
//     $collection.insertOne = $collection.insert = $collection.add = $collection.addOne;
//     $collection.update = $collection.edit = $collection.editOne = $collection.updateOne;
//     $collection.delete = $collection.remove = $collection.removeOne = $collection.deleteOne;
//     $collection.get = $collection.getOne = $collection.find = $collection.select = $collection.selectOne = $collection.findOne;
//     $collection.count = $collection.getCount;
//     $collection.getMany = $collection.getAll = $collection.findAll = $collection.selectAll = $collection.selectMany = $collection.findMany;
//     $collection.insertMany = $collection.addMany = $collection.insertAll = $collection.addAll;
//     $collection.updateMany = $collection.editMany = $collection.editAll = $collection.updateAll;
//     $collection.deleteMany = $collection.removeMany = $collection.removeAll = $collection.deleteAll;
//     $collection.removeDuplicate = $collection.deleteDuplicate;


    // Additive Promise helpers for new code. Legacy callback APIs stay untouched.
    $collection.findOneAsync = function (options) {
        return new Promise((resolve, reject) => $collection.findOne(options, (err, doc) => err ? reject(err) : resolve(doc)));
    };
    $collection.findManyAsync = function (options) {
        return new Promise((resolve, reject) => $collection.findMany(options, (err, list, count) => err ? reject(err) : resolve({ list, count })));
    };
    $collection.countAsync = function (options) {
        return new Promise((resolve, reject) => $collection.count(options, (err, count) => err ? reject(err) : resolve(count)));
    };
    $collection.exists = function (options, callback) {
        if (typeof callback === 'function') {
            return $collection.count(options, (err, count) => callback(err, !err && count > 0));
        }
        return $collection.countAsync(options).then((count) => count > 0);
    };
    $collection.existsAsync = function (options) { return Promise.resolve($collection.exists(options)); };
    $collection.addAsync = function (doc) {
        return new Promise((resolve, reject) => $collection.add(doc, (err, inserted, original) => err ? reject(err) : resolve(inserted || original)));
    };
    $collection.updateAsync = function (options) {
        return new Promise((resolve, reject) => $collection.update(options, (err, result) => err ? reject(err) : resolve(result)));
    };
    $collection.deleteAsync = function (options) {
        return new Promise((resolve, reject) => $collection.delete(options, (err, result) => err ? reject(err) : resolve(result)));
    };


    // v5 additive high-throughput read APIs. Legacy find/get/count stay serialized exactly as before.
    // v30 startup candidate: readPool belongs only to the additive parallel-read APIs.
    // Do not materialize the advanced core merely because a legacy collection wrapper
    // was created during startup. First access preserves the same public property and
    // creates the same named pool synchronously.
    let _readPool;
    Object.defineProperty($collection, 'readPool', {
        configurable: true,
        enumerable: true,
        get() {
            if (_readPool === undefined) {
                _readPool = ____0.pool ? ____0.pool('collection-read:' + $collection.name, { limit: $collection.options.readConcurrency || 8 }) : null;
                Object.defineProperty($collection, 'readPool', { configurable: true, enumerable: true, writable: true, value: _readPool });
            }
            return _readPool;
        },
        set(value) {
            _readPool = value;
            Object.defineProperty($collection, 'readPool', { configurable: true, enumerable: true, writable: true, value });
        },
    });
    $collection.findOneParallel = function (options, callback) {
        const run = () => new Promise((resolve, reject) => {
            const o = options && options.where !== undefined ? options : { where: options || {} };
            ____0.mongodb.findOne({ collectionName: $collection.collection, dbName: $collection.db, where: o.where || {}, select: o.select || {}, sort: o.sort || {} }, (err, doc) => err ? reject(err) : resolve(doc));
        });
        const promise = $collection.readPool ? $collection.readPool.run(run) : run();
        if (typeof callback === 'function') { promise.then(v => callback(null, v), e => callback(e)); return; }
        return promise;
    };
    $collection.findManyParallel = function (options, callback) {
        const run = () => new Promise((resolve, reject) => {
            const o = options || {};
            ____0.mongodb.findMany({ collectionName: $collection.collection, dbName: $collection.db, where: o.where || ((!o.select && !o.limit && !o.sort && !o.skip) ? o : {}), select: o.select || {}, limit: o.limit || ____0.options.mongodb.limit, sort: o.sort || null, skip: o.skip || 0 }, (err, list, count) => err ? reject(err) : resolve({ list, count }));
        });
        const promise = $collection.readPool ? $collection.readPool.run(run) : run();
        if (typeof callback === 'function') { promise.then(v => callback(null, v.list, v.count), e => callback(e)); return; }
        return promise;
    };
    $collection.findManyFast = function (options, callback) {
        const run = () => new Promise((resolve, reject) => {
            const o = options || {};
            ____0.mongodb.findManyFast({ collectionName: $collection.collection, dbName: $collection.db, where: o.where || ((!o.select && !o.limit && !o.sort && !o.skip) ? o : {}), select: o.select || {}, limit: o.limit || ____0.options.mongodb.limit, sort: o.sort || null, skip: o.skip || 0 }, (err, list) => err ? reject(err) : resolve(list));
        });
        const promise = $collection.readPool ? $collection.readPool.run(run) : run();
        if (typeof callback === 'function') { promise.then(v => callback(null, v), e => callback(e)); return; }
        return promise;
    };
    $collection.findManyFastCached = function (options, cacheOptions = {}) {
        return ____0.query.cached($collection.name, 'findManyFast', options, () => $collection.findManyFast(options), cacheOptions);
    };

    // v14 additive aliases/helpers. Legacy findMany remains serialized and count-preserving.
    $collection.findManyNoCount = $collection.findManyFast;
    $collection.findManyNoCountCached = $collection.findManyFastCached;
    $collection.findManyConcurrent = function (options, callback) {
        const run = () => new Promise((resolve, reject) => {
            const o = options || {};
            ____0.mongodb.findManyConcurrent({
                collectionName: $collection.collection, dbName: $collection.db,
                where: o.where || ((!o.select && !o.limit && !o.sort && !o.skip) ? o : {}),
                select: o.select || {}, limit: o.limit || ____0.options.mongodb.limit,
                sort: o.sort || null, skip: o.skip || 0, maxTimeMS: o.maxTimeMS || 0,
            }, (err, list, count) => err ? reject(err) : resolve({ list, count }));
        });
        const promise = $collection.readPool ? $collection.readPool.run(run) : run();
        if (typeof callback === 'function') { promise.then(v => callback(null, v.list, v.count), e => callback(e, [], 0)); return; }
        return promise;
    };
    $collection.findManyConcurrentCached = function (options, cacheOptions = {}) {
        return ____0.query.cached($collection.name, 'findManyConcurrent', options, () => $collection.findManyConcurrent(options), cacheOptions);
    };

    $collection.findPageFast = function (options, callback) {
        const run = () => new Promise((resolve, reject) => {
            const o = options || {};
            ____0.mongodb.findPageFast({ collectionName: $collection.collection, dbName: $collection.db, where: o.where || ((!o.select && !o.limit && !o.sort && !o.skip) ? o : {}), select: o.select || {}, limit: o.limit || ____0.options.mongodb.limit, sort: o.sort || null, skip: o.skip || 0 }, (err, list, count) => err ? reject(err) : resolve({ list, count }));
        });
        const promise = $collection.readPool ? $collection.readPool.run(run) : run();
        if (typeof callback === 'function') { promise.then(v => callback(null, v.list, v.count), e => callback(e)); return; }
        return promise;
    };
    $collection.findPageFastCached = function (options, cacheOptions = {}) {
        return ____0.query.cached($collection.name, 'findPageFast', options, () => $collection.findPageFast(options), cacheOptions);
    };

    // v10 opt-in query-budget helpers. Legacy reads remain unchanged.
    $collection.findManyBudgeted = function (options = {}, budget = {}, callback) {
        if (typeof budget === 'function') { callback = budget; budget = {}; }
        const rule = { ...(____0.mongoBudget?.get?.($collection.name, 'findManyFast') || {}), ...(budget || {}) };
        const run = () => new Promise((resolve, reject) => {
            const o = options || {};
            ____0.mongodb.findManyFast({
                collectionName: $collection.collection, dbName: $collection.db,
                where: o.where || ((!o.select && !o.limit && !o.sort && !o.skip) ? o : {}),
                select: o.select || {}, limit: o.limit || ____0.options.mongodb.limit,
                sort: o.sort || null, skip: o.skip || 0, maxTimeMS: rule.maxTimeMS || o.maxTimeMS || 0,
            }, (err, list) => err ? reject(err) : resolve(list));
        });
        const promise = $collection.readPool ? $collection.readPool.run(run) : run();
        if (typeof callback === 'function') { promise.then(v => callback(null, v), e => callback(e)); return; }
        return promise;
    };
    $collection.findPageBudgeted = function (options = {}, budget = {}, callback) {
        if (typeof budget === 'function') { callback = budget; budget = {}; }
        const rule = { ...(____0.mongoBudget?.get?.($collection.name, 'findPageFast') || {}), ...(budget || {}) };
        const run = () => new Promise((resolve, reject) => {
            const o = options || {};
            ____0.mongodb.findPageFast({
                collectionName: $collection.collection, dbName: $collection.db,
                where: o.where || ((!o.select && !o.limit && !o.sort && !o.skip) ? o : {}),
                select: o.select || {}, limit: o.limit || ____0.options.mongodb.limit,
                sort: o.sort || null, skip: o.skip || 0, maxTimeMS: rule.maxTimeMS || o.maxTimeMS || 0,
            }, (err, list, count) => err ? reject(err) : resolve({ list, count }));
        });
        const promise = $collection.readPool ? $collection.readPool.run(run) : run();
        if (typeof callback === 'function') { promise.then(v => callback(null, v.list, v.count), e => callback(e)); return; }
        return promise;
    };

    $collection.findOneCached = function (options, cacheOptions = {}) {
        return ____0.query.cached($collection.name, 'findOne', options, () => $collection.findOneParallel(options), cacheOptions);
    };
    $collection.findManyCached = function (options, cacheOptions = {}) {
        return ____0.query.cached($collection.name, 'findMany', options, () => $collection.findManyParallel(options), cacheOptions);
    };
    $collection.countParallel = function (options, callback) {
        const run = () => new Promise((resolve, reject) => {
            const where = options && options.where ? options.where : (options || {});
            ____0.mongodb.count({ collectionName: $collection.collection, dbName: $collection.db, where }, (err, count) => err ? reject(err) : resolve(count));
        });
        const promise = $collection.readPool ? $collection.readPool.run(run) : run();
        if (typeof callback === 'function') { promise.then(v => callback(null, v), e => callback(e)); return; }
        return promise;
    };
    $collection.invalidateQueryCache = function () { return ____0.query ? ____0.query.invalidate($collection.name) : 0; };


    // v6 additive database helpers. These bypass the legacy serialized read queue
    // only when explicitly called by new code.
    $collection.findByIdsFast = function (ids, options, callback) {
        if (typeof options === 'function') { callback = options; options = {}; }
        options = options || {};
        const run = () => new Promise((resolve, reject) => {
            ____0.mongodb.findByIdsFast({
                collectionName: $collection.collection,
                dbName: $collection.db,
                ids: Array.isArray(ids) ? ids : [],
                field: options.field || 'id',
                where: options.where || {},
                select: options.select || {},
                sort: options.sort || null,
            }, (err, docs) => err ? reject(err) : resolve(docs));
        });
        const promise = $collection.readPool ? $collection.readPool.run(run) : run();
        if (typeof callback === 'function') { promise.then(v => callback(null, v), e => callback(e)); return; }
        return promise;
    };
    $collection.findByIdsFastCached = function (ids, options = {}, cacheOptions = {}) {
        return ____0.query.cached($collection.name, 'findByIdsFast', { ids, options }, () => $collection.findByIdsFast(ids, options), cacheOptions);
    };
    $collection.findByIdsBudgeted = function (ids, options = {}, budget = {}, callback) {
        if (typeof budget === 'function') { callback = budget; budget = {}; }
        const rule = { ...(____0.mongoBudget?.get?.($collection.name, 'findByIdsFast') || {}), ...(budget || {}) };
        const run = () => new Promise((resolve, reject) => {
            ____0.mongodb.findByIdsFast({
                collectionName: $collection.collection, dbName: $collection.db, ids: Array.isArray(ids) ? ids : [],
                field: options.field || 'id', where: options.where || {}, select: options.select || {}, sort: options.sort || null,
                maxTimeMS: rule.maxTimeMS || options.maxTimeMS || 0,
            }, (err, docs) => err ? reject(err) : resolve(docs));
        });
        const promise = $collection.readPool ? $collection.readPool.run(run) : run();
        if (typeof callback === 'function') { promise.then(v => callback(null, v), e => callback(e)); return; }
        return promise;
    };
    $collection.bulkWriteFast = function (operations, options, callback) {
        if (typeof options === 'function') { callback = options; options = {}; }
        options = options || {};
        const promise = new Promise((resolve, reject) => {
            ____0.mongodb.bulkWriteFast({ collectionName: $collection.collection, dbName: $collection.db, operations: operations || [], options }, (err, result) => err ? reject(err) : resolve(result));
        });
        if (typeof callback === 'function') { promise.then(v => callback(null, v), e => callback(e)); return; }
        return promise;
    };
    // v9 additive query-plan inspection. Observability-only and opt-in.
    $collection.explainFast = function (options = {}, callback) {
        const promise = new Promise((resolve, reject) => {
            ____0.mongodb.explainQuery({
                collectionName: $collection.collection,
                dbName: $collection.db,
                where: options.where || {},
                select: options.select || {},
                sort: options.sort || null,
                skip: options.skip || 0,
                limit: options.limit || 0,
                verbosity: options.verbosity || 'executionStats',
                operation: options.operation || 'find',
            }, (err, explain) => err ? reject(err) : resolve(explain));
        });
        if (typeof callback === 'function') { promise.then(v => callback(null, v), e => callback(e)); return; }
        return promise;
    };

    $collection.streamFast = function (options = {}) {
        return new Promise((resolve, reject) => {
            ____0.mongodb.findCursorFast({
                collectionName: $collection.collection,
                dbName: $collection.db,
                where: options.where || {},
                select: options.select || {},
                sort: options.sort || null,
                skip: options.skip || 0,
                limit: options.limit || 0,
                batchSize: options.batchSize || 0,
            }, (err, cursor) => err ? reject(err) : resolve(cursor));
        });
    };

    // v7 additive automatic ID batching. It uses findByIdsFast underneath and
    // never changes the serialized legacy find/get/findOne execution path.
    const idBatchers = new Map();
    $collection.findByIdBatched = function (id, options = {}) {
        if (!____0.createIdBatcher) return $collection.findByIdsFast([id], options).then(list => list[0] || null);
        const field = options.field || 'id';
        const batchKey = ____0.stableKey ? ____0.stableKey(field, options.where || {}, options.select || {}, options.sort || {}) : JSON.stringify([field, options]);
        let batcher = idBatchers.get(batchKey);
        if (!batcher) {
            batcher = ____0.createIdBatcher(
                ids => $collection.findByIdsFast(ids, options),
                { maxBatchSize: options.maxBatchSize || 250, delay: options.batchDelay == null ? 1 : options.batchDelay, valueKey: field, key: x => String(x) }
            );
            idBatchers.set(batchKey, batcher);
        }
        return batcher.load(id);
    };
    $collection.findIdsBatched = function (ids, options = {}) {
        return Promise.all((Array.isArray(ids) ? ids : []).map(id => $collection.findByIdBatched(id, options)));
    };
    $collection.batchStats = function () {
        return [...idBatchers.entries()].map(([key, batcher]) => ({ key, ...batcher.stats() }));
    };



    ____0.collectionList.push($collection);
    if (____0.collectionByGuid) ____0.collectionByGuid.set($collection.guid, $collection);
    return $collection;
};
