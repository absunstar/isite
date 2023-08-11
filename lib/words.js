module.exports = function init(____0) {
  let app = function () {};
  app.list = [];
  app.userWordsPath = process.cwd() + '/.words.json';

  if (____0.isFileExistsSync(app.userWordsPath)) {
    let words2 = JSON.parse(____0.readFileSync(app.userWordsPath));
    if (words2 && Array.isArray(words2)) {
      app.list = words2;
    }
  }

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
    ____0.readFile(path, (err, data) => {
      if (!err) {
        let arr = ____0.fromJson(data);
        if (Array.isArray(arr)) {
          arr.forEach((doc) => {
            app.add(doc);
          });
        }
      }
    });
  };

  ____0.on(____0.strings[9], () => {
    ____0.get({ name: '/x-api/words' }, (req, res) => {
      res.json({ done: !0, words: app.list });
    });

    ____0.post({ name: '/x-api/words/save' }, (req, res) => {
      app.list = req.data;
      ____0.writeFileSync(app.userWordsPath, JSON.stringify(app.list));
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
