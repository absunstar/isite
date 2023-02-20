module.exports = function init(____0) {
  let app = function () {};
  app.list = [];
  app.$collectoin = ____0.connectCollection('app_words');

  app.$collectoin.findAll({ limit: 10000 }, (err, docs) => {
    if (!err && docs && docs.length > 0) {
      docs.forEach((doc) => {
        app.list.unshift(doc);
      });
    }
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
    if ((w = app.list.find((ww) => ww.name === name))) {
      return w;
    } else {
      return app.add({ name: name });
    }
  };

  app.add = app.set = function (word) {
    let index = app.list.findIndex((w) => w.name === word.name);
    if (index === -1) {
      app.$collectoin.add(word, (err, doc) => {
        if (!err && doc) {
          app.list.push(doc);
        }
      });
    } else {
      app.list[index] = word;
      app.$collectoin.update(app.list[index]);
    }

    return word;
  };

  app.addList = function (list) {
    if (typeof list === 'string') {
      ____0.readFile(list, (err, data) => {
        if (!err) {
          let arr = ____0.fromJson(data);
          arr.forEach((doc) => {
            app.add(doc);
          });
        }
      });
    } else if (Array.isArray(list)) {
      list.forEach((doc) => {
        app.add(doc);
      });
    } else if (typeof list === 'object') {
      app.add(list);
    }
  };

  app.addPath = function (app_path) {
    app.addList(app_path + '/site_files/json/app.json', false);
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
