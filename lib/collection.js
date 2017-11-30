module.exports = function init(site, option) {
  const $collection = function () {}

  $collection.docs = []
  if (typeof option === "string") {
    $collection.collectionName = option
    $collection.dbName = site.mongodb.db
  } else if (typeof option === "object") {
    $collection.collectionName = option.collection || "test"
    $collection.dbName = option.db || site.mongodb.db
  } else {
    $collection.collectionName = "test"
    $collection.dbName = site.mongodb.db
  }

  $collection.ObjectID = function (_id) {
    return new site.mongodb.ObjectID(_id)
  }

  $collection.loadAll = (options, callback) => {
    site.mongodb.findMany({
        collectionName: $collection.collectionName,
        dbName: $collection.dbName,
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

  $collection.findAll = $collection.findMany = $collection.selectAll = $collection.selectMany = (options, callback) => {
    site.mongodb.findMany({
        collectionName: $collection.collectionName,
        dbName: $collection.dbName,
        where: options.where || {},
        select: options.select || {},
        limit: options.limit || 10,
        sort: options.sort || {}
      },
      function (err, docs) {
        if (callback) callback(err, docs)
      }
    )
  }

  $collection.find = $collection.findOne = $collection.select = $collection.selectOne = (options, callback) => {
    site.mongodb.findOne({
        collectionName: $collection.collectionName,
        dbName: $collection.dbName,
        where: options.where || {},
        select: options.select || {}
      },
      function (err, doc) {
        if (callback) callback(err, doc)
      }
    )
  }

  $collection.waiting_docs = []

  $collection.insertOne = $collection.insert = $collection.add = $collection.addOne = ($doc, callback) => {

    if ($doc) {
      $collection.waiting_docs.push({
        doc: $doc,
        callback: callback
      })

      $collection.add(null)

    } else {

      if ($collection.busy) {
        return
      }

      var doc_info = $collection.waiting_docs[0]
      if (doc_info) {
        $collection.busy = true

        if ($collection.identityEnabled === true && doc_info.doc.id === undefined) {
          doc_info.doc.id = site.mongodb.collections_indexed[$collection.collectionName].nextID
          site.mongodb.collections_indexed[$collection.collectionName].nextID = $collection.step + site.mongodb.collections_indexed[$collection.collectionName].nextID
        }

        site.mongodb.insertOne({
            collectionName: $collection.collectionName,
            dbName: $collection.dbName,
            doc: doc_info.doc
          },
          function (err, docInserted) {
            $collection.waiting_docs.splice(0, 1)
            if (doc_info.callback) doc_info.callback(err, docInserted, doc_info.doc)
            $collection.busy = false
            $collection.add(null)

            if ($collection.identityEnabled) {
              site.mongodb.updateOne({
                collectionName: "collection_indexed",
                dbName: $collection.dbName,
                set: {
                  nextID: site.mongodb.collections_indexed[$collection.collectionName].nextID
                },
                where: {
                  name: $collection.collectionName
                }
              })
            }
          }
        )
      }
    }
  }



  $collection.update = $collection.updateOne = $collection.edit = $collection.editOne = (options, callback) => {
    site.mongodb.updateOne({
        collectionName: $collection.collectionName,
        dbName: $collection.dbName,
        where: options.where,
        set: options.set || {}
      },
      function (err, result) {
        if (callback) callback(err, result)
      }
    )
  }

  $collection.delete = $collection.deleteOne = $collection.remove = $collection.removeOne = ($where, callback) => {
    let where = {}
    
    if (typeof $where === "object") {
      where = $where
    } else if (typeof $where === "string") {
      where._id = $collection.ObjectID($where)
    } else {
      if (callback) callback({
        message: "where not set"
      })
      return
    }
  
    site.mongodb.deleteOne({
        collectionName: $collection.collectionName,
        dbName: $collection.dbName,
        where: where
      },
      function (err, result) {
        if (callback) callback(err, result)
      }
    )
  }

  if (site.options.mongodb.identity.enabled) {
    function load_index() {
      $collection.busy = true
      $collection.identityEnabled = true
      $collection.step = site.options.mongodb.identity.step
      if (site.mongodb.collections_indexed[$collection.collectionName] === undefined) {
        site.mongodb.collections_indexed[$collection.collectionName] = {
          nextID: site.options.mongodb.identity.start
        }
      }

      site.mongodb.findOne({
          collectionName: "collection_indexed",
          dbName: $collection.dbName,
          where: {
            name: $collection.collectionName
          }
        },
        function (err, doc) {
          if (err || !doc) {
            site.mongodb.insertOne({
              collectionName: "collection_indexed",
              dbName: $collection.dbName,
              doc: {
                name: $collection.collectionName,
                nextID: site.mongodb.collections_indexed[$collection.collectionName].nextID
              }
            } , (err , doc)=>{
              setTimeout(() => {
                load_index()
              }, 500);
              
            })

          } else {

            site.mongodb.collections_indexed[$collection.collectionName].nextID = doc.nextID
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