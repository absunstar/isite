module.exports = function init(_c_, option, db) {

  _c_.on('big error', () => {
    $collection.busy = true
  })

  const $collection = function () {}

  $collection.busy = false
  $collection.insertBusy = false
  $collection.updateBusy = false
  $collection.deleteBusy = false

  $collection.opration_busy = false
  $collection.opration_list = []
  $collection.run_count = 0
  $collection.run = function(){
    $collection.run_count++
    console.log('run : ' + $collection.run_count)
    if($collection.opration_busy){
      return
    }
    if($collection.opration_list.length == 0){
      return
    }
    $collection.opration_busy = true
    let opration = $collection.opration_list[0]
    $collection.opration_list.splice(0,1)
    if(opration.type == "add"){
      $collection.add2(opration.doc , opration.callback,true)
    }else if(opration.type == "update"){
      $collection.update2(opration.options , opration.callback , true)
    }else if(opration.type == "delete"){
      $collection.delete2(opration.options , opration.callback , true)
    }
  }
  $collection.add2 = ($doc, callback , run) => {
    callback = callback || function () {}
    if (!run) {
      $collection.opration_list.push({
        doc: $doc,
        callback: callback,
        type : 'add'
      })
      $collection.run()
    } else {

        if ($collection.identityEnabled === true && !$doc.id) {

          $doc.id = _c_.mongodb.collections_indexed[$collection.collection].nextID
          _c_.mongodb.collections_indexed[$collection.collection].nextID = $collection.step + _c_.mongodb.collections_indexed[$collection.collection].nextID

          if ($doc.id + 1 !== _c_.mongodb.collections_indexed[$collection.collection].nextID) {
            $doc.id = _c_.mongodb.collections_indexed[$collection.collection].nextID - 1
          }

        }

        if ($doc.id >= _c_.mongodb.collections_indexed[$collection.collection].nextID) {
          _c_.mongodb.collections_indexed[$collection.collection].nextID = $doc.id + 1
        }

        if ($doc._id && typeof $doc._id === 'string') {
          $doc._id = $collection.ObjectID($doc._id)
        }


        _c_.mongodb.insertOne({
            collectionName: $collection.collection,
            dbName: $collection.db,
            doc: Object.assign({}, $doc)
          },
          function (err, docInserted) {
            callback(err, docInserted, $doc)
            $collection.opration_busy = false
            $collection.run()
          }
        )
      
    }
  }
  $collection.update2= (options, callback , run) => {
    callback = callback || function () {}

    if (!run) {
      $collection.opration_list.push({
        options: options,
        callback: callback,
        type : 'update'
      })
      $collection.run()
    } else {

        let $req = options.$req
        let $res = options.$res
        let option = {}
        if (options._id) {
          option.set = _c_.copy(options)
          delete option.set._id
          option.where = {
            _id: options._id
          }
        } else if (options.id) {
          option.set = _c_.copy(options)
          delete option.set.id
          option.where = {
            id: options.id
          }
        } else if (options.set !== undefined) {
          option = options
        }

        if (option.set) {
          delete option.set._id
        }

        if (option.where === undefined || option.set === undefined) {
          callback({
            message: 'Must Assign [ Where & Set ] Properties'
          })
          return
        }

        if (options.where && typeof options.where === 'string') {
          options.where = {
            _id: $collection.ObjectID(options.where)
          }
        }

        if (options.where && options.where._id && typeof options.where._id === 'string') {
          options.where._id = $collection.ObjectID(options.where._id)
        }

        if (options.where && options.where.id) {
          options.where.id = _c_.toInt(options.where.id)
        }

        _c_.mongodb.updateOne({
            collectionName: $collection.collection,
            dbName: $collection.db,
            where: option.where,
            set: option.set || {},
            $req: $req,
            $res: $res
          },
          function (err, result, result2) {
            callback(err, result, result2)
            $collection.opration_busy = false
            $collection.run()
          }
        )

      
    }


  }
  $collection.delete2 = ($options, callback , run) => {
    callback = callback || function () {}

    if (!run) {
      $collection.opration_list.push({
        options: $options,
        callback: callback,
        type : 'delete'
      })
      $collection.run()
    } else {

        let options = {}

        if ($options.where === undefined) {
          options.where = $options
        } else {
          options = $options
        }
    
        if (typeof options.where === 'string') {
          options.where = {
            _id: $collection.ObjectID(options.where)
          }
        }
    
        if (options.where && options.where._id && typeof options.where._id === 'string') {
          options.where._id = $collection.ObjectID(options.where._id)
        }
    
        if (options.where && options.where.id) {
          options.where.id = _c_.toInt(options.where.id)
        }
        _c_.mongodb.deleteOne({
            collectionName: $collection.collection,
            dbName: $collection.db,
            where: options.where
          },
          function (err, result) {
            callback(err, result)
            $collection.opration_busy = false
            $collection.run()
          }
        )
      
    }

    
  }
  $collection.docs = []

  if (typeof option === "string") {
    $collection.collection = option
    $collection.db = db || _c_.options.mongodb.db
  } else if (typeof option === "object") {
    $collection.collection = option.collection || _c_.options.mongodb.collection
    $collection.db = option.db || _c_.options.mongodb.db
  } else {
    $collection.collection = _c_.options.mongodb.collection
    $collection.db = _c_.options.mongodb.db
  }

  $collection.db = $collection.db.trim().replace(" ", "")
  $collection.collection = $collection.collection.trim().replace(" ", "")


  $collection.ObjectID = function (_id) {
    return new _c_.mongodb.ObjectID(_id)
  }

  $collection.drop = (callback) => {
    callback = callback || function () {}
    _c_.mongodb.dropCollection({
      collectionName: $collection.collection,
      dbName: $collection.db
    }, (err, ok) => {
      if (ok) {
        _c_.mongodb.collections_indexed[$collection.collection].nextID = 1
      }
      callback(err, ok)
    })
  }

  $collection.createUnique = (obj, callback) => {
    callback = callback || function () {}

    _c_.mongodb.createIndex({
      collectionName: $collection.collection,
      dbName: $collection.db,
      obj: obj,
      option: {
        unique: true,
        dropDups: true
      }
    }, (err, result) => {
      callback(err, result)
    })

  }

  $collection.createIndex = (obj, callback) => {
    callback = callback || function () {}

    _c_.mongodb.createIndex({
      collectionName: $collection.collection,
      dbName: $collection.db,
      obj: obj
    }, (err, result) => {
      callback(err, result)
    })

  }

  $collection.aggregate = (arr, callback) => {
    callback = callback || function () {}

    _c_.mongodb.aggregate({
      collectionName: $collection.collection,
      dbName: $collection.db,
      arr: arr
    }, (err, result) => {
      callback(err, result)
    })

  }

  $collection.findDuplicate = (obj, callback) => {

    if (typeof obj === 'string') {

      obj = {
        value: "$" + obj
      }
    }

    for (let [key, val] of Object.entries(obj)) {
      if (val == 1) {
        if (key.contains('.')) {
          delete obj[key]
          obj[key.replace('.', '_')] = '$' + key
        } else {
          obj[key] = '$' + key
        }
      }
    }

    let arr = []
    arr.push({
      $group: {
        _id: obj,
        list: {
          $addToSet: "$_id"
        },
        count: {
          $sum: 1
        }
      }
    })
    arr.push({
      $match: {
        count: {
          "$gt": 1
        }
      }
    })
    arr.push({
      $sort: {
        count: -1
      }
    })
    $collection.aggregate(arr, (err, result) => {
      callback(err, result)
    })
  }

  $collection.deleteDuplicate = $collection.removeDuplicate = (obj, callback) => {
    callback = callback || function () {}

    $collection.findDuplicate(obj, (err, result) => {
      if (!err) {
        let count = 0
        let total = 0
        let errors = []
        let lastErr = null
        for (let i = 0; i < result.length; i++) {
          for (let j = result[i].list.length - 1; j > 0; j--) {
            count++
            total++
            $collection.delete(result[i].list[j].toString(), (err, result) => {
              count--
              if (err) {
                lastErr = err
                errors.push(err)
              }
              if (count === 0) {
                callback(lastErr, {
                  count: total,
                  errors: errors
                })
              }
            })
          }
        }
        if (count === 0) {
          callback(lastErr, {
            count: total,
            errors: errors
          })
        }
      }
    })
  }
  $collection.loadAll = (options, callback) => {
    callback = callback || function () {}
    _c_.mongodb.findMany({
        collectionName: $collection.collection,
        dbName: $collection.db,
        where: options.where || {},
        select: options.select || {},
        limit: options.limit || 1000000,
        sort: options.sort || null,
        skip: options.skip || 0
      },
      function (err, docs) {
        if (!err && docs) {
          $collection.docs = docs
        }
        if (callback) callback(err, docs)
      }
    )
  }

  $collection.getMany = $collection.getAll = $collection.findAll = $collection.findMany = $collection.selectAll = $collection.selectMany = (options, callback) => {
    callback = callback || function () {}


    if (options.where && typeof options.where === 'string') {
      options.where = {
        _id: $collection.ObjectID(options.where)
      }
    }

    if (options.where && options.where._id && typeof options.where._id === 'string') {
      options.where._id = $collection.ObjectID(options.where._id)
    }

    if (options.where && options.where.id && typeof options.where.id === 'string') {
      options.where.id = _c_.toInt(options.where.id)
    }


    _c_.mongodb.findMany({
        collectionName: $collection.collection,
        dbName: $collection.db,
        where: options.where || {},
        select: options.select || {},
        limit: options.limit || _c_.options.mongodb.limit,
        sort: options.sort || null,
        skip: options.skip || 0
      },
      function (err, docs, count) {
        callback(err, docs, count)
      }
    )
  }

  $collection.get = $collection.getOne = $collection.find = $collection.findOne = $collection.select = $collection.selectOne = (options, callback) => {
    callback = callback || function () {}

    if (options.where === undefined && options.select === undefined) {
      options = {
        where: _c_.copy(options)
      }
    }

    if (options.where && typeof options.where === 'string') {
      options.where = {
        _id: $collection.ObjectID(options.where)
      }
    }

    if (options.where && options.where._id && typeof options.where._id === 'string') {
      options.where._id = $collection.ObjectID(options.where._id)
    }

    if (options.where && options.where.id && typeof options.where.id === 'string') {
      options.where.id = _c_.toInt(options.where.id)
    }

    _c_.mongodb.findOne({
        collectionName: $collection.collection,
        dbName: $collection.db,
        where: options.where || {},
        select: options.select || {}
      },
      function (err, doc) {
        callback(err, doc)
      }
    )
  }

  $collection.insertMany = $collection.addMany = $collection.insertAll = $collection.addAll = ($docs, callback) => {
    callback = callback || function () {}
    let errors = []
    let docs = []

    let callback2 = function (err, doc) {
      if (err) {
        errors.push(err)
      }
      if (doc) {
        docs.push(doc)
      }
      if (errors.length + docs.length === $docs.length) {
        callback(errors, docs)
      }
    }

    for (let i = 0; i < $docs.length; i++) {
      let doc = $docs[i];
      $collection.insertOne(Object.assign({}, doc), callback2)

    }
  }

  $collection.waiting_insert_docs = []
  $collection.insertOne = $collection.insert = $collection.add = $collection.addOne = ($doc, callback , run) => {
    callback = callback || function () {}
    if ($doc) {
      $collection.waiting_insert_docs.push({
        doc: $doc,
        callback: callback
      })

      $collection.add(null)

    } else {

      if ($collection.busy || $collection.insertBusy) {
        return
      }

      let doc_info = $collection.waiting_insert_docs[0]
      if (doc_info && doc_info.doc) {
        $collection.insertBusy = true

        if ($collection.identityEnabled === true && !doc_info.doc.id) {

          doc_info.doc.id = _c_.mongodb.collections_indexed[$collection.collection].nextID
          _c_.mongodb.collections_indexed[$collection.collection].nextID = $collection.step + _c_.mongodb.collections_indexed[$collection.collection].nextID

          if (doc_info.doc.id + 1 !== _c_.mongodb.collections_indexed[$collection.collection].nextID) {
            doc_info.doc.id = _c_.mongodb.collections_indexed[$collection.collection].nextID - 1
          }

        }

        if (doc_info.doc.id >= _c_.mongodb.collections_indexed[$collection.collection].nextID) {
          _c_.mongodb.collections_indexed[$collection.collection].nextID = doc_info.doc.id + 1
        }

        if (doc_info.doc._id && typeof doc_info.doc._id === 'string') {
          doc_info.doc._id = $collection.ObjectID(doc_info.doc._id)
        }


        _c_.mongodb.insertOne({
            collectionName: $collection.collection,
            dbName: $collection.db,
            doc: Object.assign({}, doc_info.doc)
          },
          function (err, docInserted) {
            $collection.waiting_insert_docs.splice(0, 1)
            if (doc_info.callback) doc_info.callback(err, docInserted, doc_info.doc)
            $collection.insertBusy = false
            $collection.add(null)

          }
        )
      }
    }
  }


  $collection.updateMany = $collection.editMany = $collection.updateAll = $collection.editAll = (options, callback) => {
    callback = callback || function () {}
    if (options.where === undefined || options.set === undefined) {
      callback({
        message: 'Must Assign [ where , set ] Properties'
      })
      return;
    }


    if (options.where && typeof options.where === 'string') {
      options.where = {
        _id: $collection.ObjectID(options.where)
      }
    }

    if (options.where && options.where._id && typeof options.where._id === 'string') {
      options.where._id = $collection.ObjectID(options.where._id)
    }

    if (options.where && options.where.id) {
      options.where.id = _c_.toInt(options.where.id)
    }

    _c_.mongodb.updateMany({
      collectionName: $collection.collection,
      dbName: $collection.db,
      where: options.where,
      set: options.set || {},
      unset: options.unset,
      rename: options.rename
    }, (err, result) => {
      callback(err, result)
    })
  }

  $collection.waiting_update_docs = []
  $collection.update = $collection.updateOne = $collection.edit = $collection.editOne = (options, callback) => {
    callback = callback || function () {}


    if (options) {
      $collection.waiting_update_docs.push({
        options: options,
        callback: callback
      })
      $collection.update(null)
    } else {

      if ($collection.busy || $collection.updateBusy) {
        return
      }

      let doc_info = $collection.waiting_update_docs[0]
      if (doc_info && doc_info.options) {
        $collection.updateBusy = true

        let options = doc_info.options

        let $req = options.$req
        let $res = options.$res
        let option = {}
        if (options._id) {
          option.set = _c_.copy(options)
          delete option.set._id
          option.where = {
            _id: options._id
          }
        } else if (options.id) {
          option.set = _c_.copy(options)
          delete option.set.id
          option.where = {
            id: options.id
          }
        } else if (options.set !== undefined) {
          option = options
        }

        if (option.set) {
          delete option.set._id
        }

        if (option.where === undefined || option.set === undefined) {
          doc_info.callback({
            message: 'Must Assign [ Where & Set ] Properties'
          })
          return
        }

        if (options.where && typeof options.where === 'string') {
          options.where = {
            _id: $collection.ObjectID(options.where)
          }
        }

        if (options.where && options.where._id && typeof options.where._id === 'string') {
          options.where._id = $collection.ObjectID(options.where._id)
        }

        if (options.where && options.where.id) {
          options.where.id = _c_.toInt(options.where.id)
        }

        _c_.mongodb.updateOne({
            collectionName: $collection.collection,
            dbName: $collection.db,
            where: option.where,
            set: option.set || {},
            $req: $req,
            $res: $res
          },
          function (err, result, result2) {
            $collection.waiting_update_docs.splice(0, 1)
            doc_info.callback(err, result, result2)
            $collection.updateBusy = false
            $collection.update(null)
          }
        )

      }
    }


  }

  $collection.deleteMany = ($options, callback) => {
    callback = callback || function () {}

    let options = {}
    if ($options.where === undefined) {
      options.where = _c_.copy($options)
    } else {
      options = $options
    }

    if (typeof options.where === 'string') {
      options.where = {
        _id: $collection.ObjectID(options.where)
      }
    }

    if (options.where._id && typeof options.where._id === 'string') {
      options.where._id = $collection.ObjectID(options.where._id)
    }

    if (options.where && options.where.id) {
      options.where.id = _c_.toInt(options.where.id)
    }

    _c_.mongodb.deleteMany({
        collectionName: $collection.collection,
        dbName: $collection.db,
        where: options.where
      },
      function (err, result) {
        if (callback) callback(err, result)
      }
    )


  }

  $collection.waiting_delete_docs = []
  $collection.delete = $collection.deleteOne = $collection.remove = $collection.removeOne = ($options, callback) => {
    callback = callback || function () {}

    if ($options) {
      $collection.waiting_delete_docs.push({
        $options: $options,
        callback: callback
      })
      $collection.delete(null)
    } else {

      if ($collection.busy || $collection.deleteBusy) {
        return
      }

      let doc_info = $collection.waiting_delete_docs[0]
      if (doc_info && doc_info.$options) {
        $collection.deleteBusy = true

        let $options = doc_info.$options
        let options = {}

        if ($options.where === undefined) {
          options.where = $options
        } else {
          options = $options
        }
    
        if (typeof options.where === 'string') {
          options.where = {
            _id: $collection.ObjectID(options.where)
          }
        }
    
        if (options.where && options.where._id && typeof options.where._id === 'string') {
          options.where._id = $collection.ObjectID(options.where._id)
        }
    
        if (options.where && options.where.id) {
          options.where.id = _c_.toInt(options.where.id)
        }
        _c_.mongodb.deleteOne({
            collectionName: $collection.collection,
            dbName: $collection.db,
            where: options.where
          },
          function (err, result) {
            $collection.waiting_delete_docs.splice(0, 1)
            doc_info.callback(err, result)
            $collection.deleteBusy = false
            $collection.delete(null)
          }
        )
      }
    }

    
  }

  $collection.import = function (file_path, callback) {
    callback = callback || function () {}

    if (_c_.isFileExistsSync(file_path)) {
      let docs = JSON.parse(_c_.readFileSync(file_path).toString())
      if (_c_.typeof(docs) === 'Array') {
        $collection.addMany(docs, (errs, docs2) => {
          callback(errs, docs2)
        })
      } else if (_c_.typeof(docs) === 'Object') {
        $collection.addOne(docs, (err, doc2) => {
          callback(err, doc2)
        })
      } else {
        callback({
          message: 'can not import unknown type : ' + _c_.typeof(docs)
        })
      }
    } else {
      callback({
        message: 'file not exists : ' + file_path
      })
    }
  }

  $collection.export = function (options, file_path, callback) {
    callback = callback || function () {}
    let response = {
      done: false,
      file_path: file_path
    }
    $collection.getMany(options, (err, docs) => {
      if (!err && docs) {
        response.docs = docs
        _c_.writeFile(file_path, JSON.stringify(docs), (err) => {
          if (err) {
            response.err = err
          }
          callback(response)
        })
      } else {
        response.err = err
        callback(response)
      }
    })
  }

  // id Handle

  if (_c_.options.mongodb.identity.enabled) {

    $collection.deleteDuplicate({
      id: 1
    }, (err, result) => {
      $collection.createUnique({
        id: 1
      })
    })

    function handleIndex() {

      $collection.busy = true
      $collection.identityEnabled = true
      $collection.step = _c_.options.mongodb.identity.step
      if (_c_.mongodb.collections_indexed[$collection.collection] === undefined) {
        _c_.mongodb.collections_indexed[$collection.collection] = {
          nextID: _c_.options.mongodb.identity.start
        }
      }

      let id = _c_.options.mongodb.identity.start

      $collection.findMany({
        select: {
          id: 1
        },
        sort: {
          id: -1
        },
        limit: 1
      }, (err, docs) => {

        if (!err && docs && docs[0] && docs[0].id) {
          if (docs[0].id >= id) {
            id = docs[0].id + 1
          }
        }

        _c_.mongodb.collections_indexed[$collection.collection].nextID = id
        $collection.busy = false
        $collection.add(null)
        $collection.update(null)
        $collection.delete(null)
      })
    }
    handleIndex()
  }
  return $collection
}