module.exports = function init(____0) {
  let app = function () {};
  app.$collection = ____0.connectCollection('words');
  app.list = [];
  app.byName = new Map();

  app.$collection.findAll(
    { limit: 10000 },
    (err, docs) => {
      if (!err && docs) {
        docs.forEach((doc) => {
          const previous = app.byName.get(doc.name);
          if (!previous) app.list.unshift(doc);
          else { const index = app.list.indexOf(previous); if (index !== -1) app.list[index] = doc; }
          app.byName.set(doc.name, doc);
        });
      }
    },
    true
  );

  app.word = function (obj) {
    if (typeof obj === 'string') {
      return app.get(obj);
    }
    if (typeof obj === 'object') {
      return app.add(obj);
    }
  };

  app.get = function (name) {
    const found = app.byName.get(name);
    if (found) {
      return found;
    } else {
      return app.add({ name: name });
    }
  };

  app.add = function (word) {
    const previous = app.byName.get(word.name);
    if (!previous) { app.list.push(word); app.byName.set(word.name, word); return word; }
    return previous;
  };

  app.set = function (word) {
    const previous = app.byName.get(word.name);
    if (!previous) app.list.push(word);
    else { const index = app.list.indexOf(previous); if (index !== -1) app.list[index] = word; }
    app.byName.set(word.name, word);
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
            if (result.doc.name != null) app.byName.set(result.doc.name, result.doc);
          }
        });
      } else {
        app.$collection.add(w, (err, doc) => {
          if (!err && doc) {
            app.list[i] = doc;
            if (doc.name != null) app.byName.set(doc.name, doc);
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
      app.byName.clear();
      app.list.forEach((word) => { if (word && word.name != null) app.byName.set(word.name, word); });
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
