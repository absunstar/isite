module.exports = function init(____0) {
  let app = function () {};
  app.$collection = ____0.connectCollection('words');
  app.list = [];

  app.$collection.findAll({limit : 10000}, (err, docs) => {
    if (!err && docs) {
      docs.forEach((doc) => {
        let index = app.list.findIndex((w) => w.name === doc.name);
        if (index === -1) {
          app.list.unshift(doc);
        } else {
          app.list[index] = doc;
        }
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
    if ((w = app.list.find((w2) => w2.name === name))) {
      return w;
    } else {
      return app.add({ name: name });
    }
  };

  app.add = function (word) {
    let index = app.list.findIndex((w) => w.name === word.name);
    if (index === -1) {
      app.list.push(word);
    } else {
      return app.list[index];
    }
    return word;
  };

  app.set = function (word) {
    let index = app.list.findIndex((w) => w.name === word.name);
    if (index === -1) {
      app.list.push(word);
    } else {
      app.list[index] = word;
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
    ____0.readFile(path, (err, file) => {
      if (!err) {
        let arr = ____0.fromJson(file.content);
        if (Array.isArray(arr)) {
          arr.forEach((doc) => {
            app.add(doc);
          });
        }
      }
    });
  };

  app.save = function () {
    app.list.forEach((w, i) => {
      if (w.id) {
        app.$collection.update(w, (err, result) => {
          if (!err && result.doc) {
            app.list[i] = result.doc;
          }
        });
      } else {
        app.$collection.add(w, (err, doc) => {
          if (!err && doc) {
            app.list[i] = doc;
          }
        });
      }
    });
  };

  ____0.on(____0.strings[9], () => {
    ____0.get({ name: '/x-api/words' }, (req, res) => {
      res.json({ done: !0, words: app.list });
    });

    ____0.post({ name: '/x-api/words/save' }, (req, res) => {
      app.list = req.data;
      app.save();
      res.json({ done: !0, count: app.list.length });
    });

    ____0.get('/x-api/words/get/:name', (req, res) => {
      res.json({
        word: app.get(req.params.name),
      });
    });
  });

  return app;
};
