module.exports = function init(_s_) {
  const storage = function () {};
  storage.list = [];
  storage.$collectoin = _s_.connectCollection('_storage');
  storage.$collectoin.createUnique({
    id: 1,
  });
  storage.$collectoin.findAll({}, (err, docs) => {
    if (!err && docs && docs.length > 0) {
      storage.list = docs;
    }
  });

  storage.save = function () {
    storage.list.forEach((doc) => {
      if (doc.id) {
        storage.$collectoin.update(doc);
      } else {
        storage.$collectoin.add(doc, (err, newDoc) => {
          if (!err && newDoc) {
            doc = newDoc;
          }
        });
      }
    });
  };

  storage.fn = function (key, value) {
    if (key && value !== undefined) {
      value = _s_.copy(value);
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

  _s_.on('site-started', () => {
    _s_.get('/x-api/events_list', (req, res) => {
      res.json(_s_.events_list);
    });
    _s_.get('/x-api/quee_list', (req, res) => {
      res.json(_s_.quee_list);
    });

    _s_.get('/x-api/storage/:key/:value', (req, res) => {
      if (req.params.value == 'true') {
        req.params.value = true;
      } else if (req.params.value == 'false') {
        req.params.value = false;
      }

      if (req.params.key == '_is_') {
        _s_._is_ = req.params.value;
      }

      storage.fn(req.params.key, req.params.value);
      res.json(storage.list);
    });

    _s_.get('/x-api/storage/:key', (req, res) => {
      res.json({
        value: storage.fn(req.params.key),
      });
    });
    _s_.get('/x-api/storage', (req, res) => {
      res.json(storage.list);
    });
  });

  return storage;
};
