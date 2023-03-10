module.exports = function init(____0) {
  let app = function () {};
  app.list = [];
  app.$collectoin = ____0.connectCollection('app_words');
  app.ready = false;

  app.$collectoin.findAll({ limit: 10000 }, (err, docs) => {
    if (!err && docs && docs.length > 0) {
      docs.forEach((doc) => {
        doc.$isDB = true;
        app.list.unshift(doc);
      });
    }
    app.ready = true;
  });

  app.word = function (obj) {
    if (typeof obj === 'string') {
      return app.get(obj);
    }
    if (typeof obj === 'object') {
      return app.add(obj);
    }
  };

  app.get = function (name) {
    if ((w = app.list.find((w2) => w2.name === name))) {
      return w;
    } else {
      if (!app.ready) {
        return { name: name };
      }
      return app.add({ name: name });
    }
  };

  app.add = app.set = function (word) {
    let index = app.list.findIndex((w) => w.name === word.name);
    if (index === -1) {
      app.list.push(word);
      app.$collectoin.add(word, (err, doc) => {
        if (!err && doc) {
          let index = app.list.findIndex((w) => w.name === doc.name);
          app.list[index] = doc;
        }
      });
    } else {
      if (!app.list[index].$isDB || word.$isDB) {
        app.list[index] = word;
        app.$collectoin.update(app.list[index]);
      }
    }

    return word;
  };

  app.addList = function (list) {
    if (Array.isArray(list)) {
      list.forEach((doc) => {
        app.add(doc);
      });
    }
  };

  app.addFile = function (path) {
    ____0.readFile(path, (err, data) => {
      if (!err) {
        let arr = ____0.fromJson(data);
        arr.forEach((doc) => {
          app.add(doc);
        });
      }
    });
  };

  ____0.on(____0.strings[9], () => {
    ____0.get({ name: '/x-api/words', require: { permissions: ['login'] } }, (req, res) => {
      res.json({ done: !0, words: app.list });
    });

    ____0.post({ name: '/x-api/words', require: { permissions: ['login'] } }, (req, res) => {
      res.json(app.add(req.data.word));
    });

    ____0.get('/x-api/words/get/:name', (req, res) => {
      res.json({
        word: app.get(req.params.name),
      });
    });
  });

  return app;
};
