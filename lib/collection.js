module.exports = function init(site, option) {
  const $collection = function () {}
  $collection.busy = false
  $collection.insertBusy = false

  $collection.docs = []

  if (typeof option === "string") {
    $collection.collection = option
    $collection.db = site.options.mongodb.db
  } else if (typeof option === "object") {
    $collection.collection = option.collection || "test"
    $collection.db = option.db || site.options.mongodb.db
  } else {
    $collection.collection = "test"
    $collection.db = site.options.mongodb.db
  }

  $collection.ObjectID = function (_id) {
    return new site.mongodb.ObjectID(_id)
  }

  $collection.createUnique = (obj, callback) => {
    callback = callback || function () {}

    site.mongodb.createIndex({
      collectionName: $collection.collection,
      dbName: $collection.db,
      obj: obj,
      option: {
        unique: true
      }
    }, (err, result) => {
      callback(err, result)
    })

  }

  $collection.createIndex = (obj, callback) => {
    callback = callback || function () {}

    site.mongodb.createIndex({
      collectionName: $collection.collection,
      dbName: $collection.db,
      obj: obj
    }, (err, result) => {
      callback(err, result)
    })

  }

  $collection.aggregate = (arr, callback) => {
    callback = callback || function () {}

    site.mongodb.aggregate({
      collectionName: $collection.collection,
      dbName: $collection.db,
      arr: arr
    }, (err, result) => {
      callback(err, result)
    })

  }

  $collection.findDuplicate = (obj, callback) => {

    if(typeof obj === 'string'){

      obj = {value : "$" + obj}
    }

    for (let [key, val] of Object.entries(obj)) {
      if (val == 1) {
        if(key.contains('.')){
          delete obj[key]
          obj[key.replace('.' , '_')] = '$' + key
        }else{
          obj[key] = '$' + key
        }
      }
    }

    let arr = []
    arr.push(  {
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
    arr.push(
      {
        $match: {
          count: {
            "$gt": 1
          }
        }
      }
    )
    arr.push(
      {
        $sort: {
          count: -1
        }
      }
    )
    $collection.aggregate(arr, (err, result) => {
      callback(err, result)
    })
  }

  $collection.deleteDuplicate = $collection.removeDuplicate = (obj, callback) => {
    callback = callback || function(){}

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
              if(err){
                lastErr = err
                errors.push(err)
              }
              if(count === 0){
                callback(lastErr , {count : total , errors : errors})
              }
            })
          }
        }
        if(count === 0){
          callback(lastErr , {count : total , errors : errors})
        }
      }
    })
  }
  $collection.loadAll = (options, callback) => {
    callback = callback || function () {}
    site.mongodb.findMany({
        collectionName: $collection.collection,
        dbName: $collection.db,
        where: options.where || {},
        select: options.select || {},
        limit: options.limit || 10000,
        sort: options.sort || {}
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
    site.mongodb.findMany({
        collectionName: $collection.collection,
        dbName: $collection.db,
        where: options.where || {},
        select: options.select || {},
        limit: options.limit || site.options.mongodb.limit,
        sort: options.sort || {}
      },
      function (err, docs) {
        callback(err, docs)
      }
    )
  }

  $collection.get = $collection.getOne = $collection.find = $collection.findOne = $collection.select = $collection.selectOne = (options, callback) => {
    callback = callback || function () {}
    if (options.where === undefined && options.select === undefined) {
      options.where = site.copy(options)
    }

    if (options.where && options.where._id && typeof options.where._id === 'string') {
      options.where._id = $collection.ObjectID(options.where._id)
    }
    site.mongodb.findOne({
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
      $collection.insertOne(doc, callback2)

    }
  }

  $collection.waiting_insert_docs = []
  $collection.insertOne = $collection.insert = $collection.add = $collection.addOne = ($doc, callback) => {
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

      var doc_info = $collection.waiting_insert_docs[0]
      if (doc_info) {
        $collection.insertBusy = true

        if ($collection.identityEnabled === true && doc_info.doc.id === undefined) {
          doc_info.doc.id = site.mongodb.collections_indexed[$collection.collection].nextID
          site.mongodb.collections_indexed[$collection.collection].nextID = $collection.step + site.mongodb.collections_indexed[$collection.collection].nextID
        }

        if (doc_info.doc._id && typeof doc_info.doc._id === 'string') {
          doc_info.doc._id = $collection.ObjectID(doc_info.doc._id)
        }

        site.mongodb.insertOne({
            collectionName: $collection.collection,
            dbName: $collection.db,
            doc: doc_info.doc
          },
          function (err, docInserted) {
            $collection.waiting_insert_docs.splice(0, 1)
            if (doc_info.callback) doc_info.callback(err, docInserted, doc_info.doc)
            $collection.insertBusy = false
            $collection.add(null)

            if ($collection.identityEnabled) {
              site.mongodb.updateOne({
                collectionName: "collection_indexed",
                dbName: $collection.db,
                set: {
                  nextID: site.mongodb.collections_indexed[$collection.collection].nextID
                },
                where: {
                  name: $collection.collection
                }
              })
            }
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
    site.mongodb.updateMany({
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

  $collection.update = $collection.updateOne = $collection.edit = $collection.editOne = (options, callback) => {
    callback = callback || function () {}

    let $req = options.$req
    let $res = options.$res

    if (options._id) {
      options.set = options
      delete options.set._id
      options.where = {
        _id: options._id
      }
      delete options._id
    }

    if (options.set) {
      delete options.set._id
    }

    if (options.where === undefined || options.set === undefined) {
      callback({
        message: 'Must Assign [ Where & Set ] Properties'
      })
      return
    }
    site.mongodb.updateOne({
        collectionName: $collection.collection,
        dbName: $collection.db,
        where: options.where,
        set: options.set || {},
        $req: $req,
        $res: $res
      },
      function (err, result, result2) {
        callback(err, result, result2)
      }
    )
  }

  $collection.deleteMany = ($options, callback) => {
    callback = callback || function () {}

    let options = {}
    if ($options.where === undefined) {
      options.where = site.copy($options)
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

    site.mongodb.deleteMany({
        collectionName: $collection.collection,
        dbName: $collection.db,
        where: options.where
      },
      function (err, result) {
        if (callback) callback(err, result)
      }
    )


  }

  $collection.delete = $collection.deleteOne = $collection.remove = $collection.removeOne = ($options, callback) => {
    callback = callback || function () {}
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

    if (options.where._id && typeof options.where._id === 'string') {
      options.where._id = $collection.ObjectID(options.where._id)
    }


    site.mongodb.deleteOne({
        collectionName: $collection.collection,
        dbName: $collection.db,
        where: options.where
      },
      function (err, result) {
        if (callback) callback(err, result)
      }
    )
  }

  // id Handle

  if (site.options.mongodb.identity.enabled) {
    function load_index() {
      $collection.busy = true
      $collection.identityEnabled = true
      $collection.step = site.options.mongodb.identity.step
      if (site.mongodb.collections_indexed[$collection.collection] === undefined) {
        site.mongodb.collections_indexed[$collection.collection] = {
          nextID: site.options.mongodb.identity.start
        }
      }

      site.mongodb.findOne({
          collectionName: "collection_indexed",
          dbName: $collection.db,
          where: {
            name: $collection.collection
          }
        },
        function (err, doc) {
          if (err || !doc) {
            site.mongodb.insertOne({
              collectionName: "collection_indexed",
              dbName: $collection.db,
              doc: {
                name: $collection.collection,
                nextID: site.mongodb.collections_indexed[$collection.collection].nextID
              }
            }, (err, doc) => {
              setTimeout(() => {
                load_index()
              }, 500);

            })

          } else {

            site.mongodb.collections_indexed[$collection.collection].nextID = doc.nextID
            $collection.busy = false
            $collection.add(null)
          }
        }
      )

    }
    load_index()
  }



  return $collection
}