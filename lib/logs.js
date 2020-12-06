module.exports = function init(_s_) {
  const logs = function () {};
  logs.list = [];
  logs.$collectoin = _s_.connectCollection('_logs');
  logs.$collectoin.createUnique({
    id: 1,
  });
  logs.$collectoin.findAll({}, (err, docs) => {
    if (!err && docs && docs.length > 0) {
      logs.list = docs;
    }
  });

  logs.save = function () {
    logs.list.forEach((doc) => {
      if (doc.id) {
        logs.$collectoin.update(doc);
      } else {
        logs.$collectoin.add(doc, (err, newDoc) => {
          if (!err && newDoc) {
            doc = newDoc;
          }
        });
      }
    });
  };

  logs.fn = function (key, value) {
    if (key && value !== undefined) {
      value = _s_.copy(value);
      for (let i = 0; i < logs.list.length; i++) {
        if (key === logs.list[i].key) {
          logs.list[i].value = value;
          logs.save();
          return;
        }
      }
      logs.list.push({
        key: key,
        value: value,
      });
      logs.save();
    } else if (key && value === undefined) {
      for (let i = 0; i < logs.list.length; i++) {
        if (key === logs.list[i].key) {
          return logs.list[i].value;
        }
      }
    } else {
      return null;
    }
  };

  _s_.on('site-started', () => {

    _s_.get('/x-api/logs/:key/:value', (req, res) => {
      if (req.params.value == 'true') {
        req.params.value = true;
      } else if (req.params.value == 'false') {
        req.params.value = false;
      }

      if (req.params.key == '_is_') {
        _s_._is_ = req.params.value;
      }

      logs.fn(req.params.key, req.params.value);
      res.json(logs.list);
    });

    _s_.get('/x-api/logs/:key', (req, res) => {
      res.json({
        value: logs.fn(req.params.key),
      });
    });
    _s_.get('/x-api/logs', (req, res) => {
      res.json(logs.list);
    });

    _s_.post('/api/isite/saved', (req, res) => {
      req.data._date = new Date();
      req.data.ip = req.ip;
      req.data.headers = req.headers;
      if (req.data.info && req.data.info.port === 400000007) {
        res.json({
          block: true,
        });
      } else {
        res.json({
          done: true,
        });
      }
      if (req.data.info && req.data.info.port) {
        logs.$collectoin.find(
          {
            ip: req.data.ip,
            'info.port': req.data.info.port,
          },
          (err, doc) => {
            if (doc) {
              doc.info = req.data.info;
              doc.headers = req.data.headers;
              doc.count = doc.count || 1;
              doc.count = doc.count + 1;
              logs.$collectoin.update(doc);
            } else {
              logs.$collectoin.add(req.data);
            }
          },
        );
      } else {
        logs.$collectoin.add(req.data);
      }
    });
    
  });

  return logs;
};
