module.exports = function init(____0) {
  const storage = function () {};
  storage.list = [];
  storage.$collectoin = ____0.connectCollection('app_setting');
  storage.$collectoin.createUnique({
    key: 1,
  });
  storage.$collectoin.findAll({app_name : 'storage'}, (err, docs) => {
    if (!err && docs && docs.length > 0) {
      storage.list = docs;
    }
  });

  storage.save = function () {
    storage.list.forEach((doc, i) => {
      if (doc.id) {
        storage.$collectoin.update(doc);
      } else {
        doc.app_name = 'storage'
        storage.$collectoin.add(doc, (err, newDoc) => {
          if (!err && newDoc) {
            storage.list[i] = newDoc;
          }
        });
      }
    });
  };

  storage.fn = function (key, value) {
    if (key && value !== undefined) {
      value = ____0.copy(value);
      for (let i = 0; i < storage.list.length; i++) {
        if (key === storage.list[i].key) {
          storage.list[i].value = value;
          storage.save();
          return;
        }
      }
      storage.list.push({
        key: key,
        value: value,
      });
      storage.save();
    } else if (key && value === undefined) {
      for (let i = 0; i < storage.list.length; i++) {
        if (key === storage.list[i].key) {
          return storage.list[i].value;
        }
      }
    } else {
      return null;
    }
  };

  ____0.on(____0.strings[9], () => {
    ____0.get('/x-api/events_list', (req, res) => {
      res.json(____0.events_list);
    });
    ____0.get('/x-api/quee_list', (req, res) => {
      res.json(____0.quee_list);
    });

    ____0.get('/x-api/storage/:key/:value', (req, res) => {
      if (req.params.value == 'true') {
        req.params.value = !0;
      } else if (req.params.value == 'false') {
        req.params.value = false;
      }

      if (req.params.key == '_0x12xo') {
        ____0._0x12xo = req.params.value;
      }

      storage.fn(req.params.key, req.params.value);
      res.json(storage.list);
    });

    ____0.get('/x-api/storage/:key', (req, res) => {
      res.json({
        value: storage.fn(req.params.key),
      });
    });
    ____0.get('/x-api/storage', (req, res) => {
      res.json(storage.list);
    });
  });

  return storage;
};
