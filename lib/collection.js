module.exports = function init(site, option) {
  let $collection = function() {}
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

  $collection.ObjectID = function(id) {
    return new site.mongodb.ObjectID(id)
  }

  $collection.loadAll = (options, callback) => {
    site.mongodb.findMany(
      {
        collectionName: $collection.collectionName,
        dbName: $collection.dbName,
        where: options.where || {},
        select: options.select || {},
        limit: options.limit || 10000,
        sort: options.sort || {}
      },
      function(err, docs) {
        if (!err && docs) {
          $collection.docs = docs
        }
        if (callback) callback(err, docs)
      }
    )
  }

  $collection.findAll = $collection.findMany = $collection.selectAll = $collection.selectMany = (options, callback) => {
    site.mongodb.findMany(
      {
        collectionName: $collection.collectionName,
        dbName: $collection.dbName,
        where: options.where || {},
        select: options.select || {},
        limit: options.limit || 10,
        sort: options.sort || {}
      },
      function(err, docs) {
        if (callback) callback(err, docs)
      }
    )
  }

  $collection.find = $collection.findOne = $collection.select = $collection.selectOne = (options, callback) => {
    site.mongodb.findOne(
      {
        collectionName: $collection.collectionName,
        dbName: $collection.dbName,
        where: options.where || {},
        select: options.select || {}
      },
      function(err, doc) {
        if (callback) callback(err, doc)
      }
    )
  }

  $collection.insertOne = $collection.insert = $collection.add = $collection.addOne = ($doc, callback) => {
    if ($collection.identityEnabled == true && $doc.id === undefined) {
      $doc.id = $collection.identityValue
      $collection.identityValue++
    }

    site.mongodb.insertOne(
      {
        collectionName: $collection.collectionName,
        dbName: $collection.dbName,
        doc: $doc
      },
      function(err, docInserted) {
        if (callback) callback(err, docInserted, $doc)
        if (!err) {
          site.mongodb.updateOne({
            collectionName: "collection_indexed",
            dbName: $collection.dbName,
            set: {
              nextID: $collection.identityValue
            },
            where: {
              name: $collection.collectionName
            }
          })
        }
      }
    )
  }

  $collection.update = $collection.updateOne = $collection.edit = $collection.editOne = (options, callback) => {
    site.mongodb.updateOne(
      {
        collectionName: $collection.collectionName,
        dbName: $collection.dbName,
        where: options.where,
        set: options.set || {}
      },
      function(err, result) {
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
      if (callback) callback({message: "where not set"})
      return
    }
    site.mongodb.deleteOne(
      {
        collectionName: $collection.collectionName,
        dbName: $collection.dbName,
        where: where
      },
      function(err, result) {
        if (callback) callback(err, result)
      }
    )
  }

  if (site.options.mongodb.identity.enabled) {
    $collection.identityEnabled = true
    $collection.identityValue = site.options.mongodb.identity.start
    $collection.identityStep = site.options.mongodb.identity.step

    site.mongodb.findOne(
      {
        collectionName: "collection_indexed",
        dbName: $collection.dbName,
        where: {name: $collection.collectionName}
      },
      function(err, doc) {
        if (err || !doc) {
          site.mongodb.insertOne({
            collectionName: "collection_indexed",
            dbName: $collection.dbName,
            doc: {
              name: $collection.collectionName,
              nextID: $collection.identityValue
            }
          })
        } else {
          $collection.identityValue = doc.nextID
        }
      }
    )
  }

  return $collection
}
