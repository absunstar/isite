module.exports = function init(____0) {
  const sessions = function () {};
  sessions.list = [];
  sessions.path = ____0.path.resolve(____0.cwd + '/' + ____0.options.name + '_' + 'sessions.db');
  sessions.$collection = ____0.connectCollection({ collection: ____0.options.session.collection, db: ____0.options.session.db });

  sessions.loadAll = function (callback) {
    callback =
      callback ||
      function (err, docs) {
        if (!err && docs) {
          sessions.list = docs;
        }
      };
    if (____0.options.session.storage === 'mongodb') {
      sessions.$collection.findAll({}, (err, docs) => {
        callback(err, docs);
      });
    } else {
      let ss = ____0.readFileSync(sessions.path);
      if (ss) {
        try {
          ss = JSON.parse(ss);
          callback(null, ss);
          console.log(' /// sessions Loaded From /// ' + sessions.path);
        } catch (err) {
          console.log(err.message);
        }
      }
    }

    return;
  };

  sessions.handleSessions = function () {
    sessions.list = sessions.list.filter((s) => s && new Date().getTime() - s.createdTime < 1000 * 60 * ____0.options.session.timeout);
    sessions.list = sessions.list.filter((s) => s && new Date().getTime() - s.$time < 1000 * 60 * ____0.options.session.memoryTimeout);
    sessions.list = sessions.list.filter((s) => s && !session.tmp);

    if (____0.options.session.enabled && ____0.options.session.storage === 'mongodb') {
      sessions.$collection.deleteAll({ createdTime: { $lt: new Date().getTime() - 1000 * 60 * ____0.options.session.timeout } });
    }
  };

  sessions.saveAll = function (callback) {
    callback =
      callback ||
      function (err) {
        if (err) {
          console.log(err.message);
        }
      };

    if (____0.options.session.timeout === 0 || !____0.options.session.enabled) {
      callback({
        message: 'Timout is Zero or not Enabled , Sessions Will Not Saved',
      });
      return;
    }

    sessions.handleSessions();

    if (____0.options.session.storage === 'mongodb') {
      sessions.list.forEach((s, i) => {
        if (s.id) {
          sessions.$collection.update(s, (err, result) => {});
        } else {
          sessions.$collection.insert(s, (err, doc) => {
            if (!err && doc) {
              sessions.list[i] = doc;
            }
          });
        }
      });
    } else {
      ____0.writeFile(sessions.path, JSON.stringify(sessions.list), () => {
        callback(null, sessions.list);
        console.log(' /// sessions Saved to ///' + sessions.path);
      });
    }

    return;
  };

  ____0.getSession = sessions.attach = function (req, callback) {
    let session = { accessToken: req.headers['Access-Token'] || req.headers['access-token'] || req.query['access-token'] || req.cookie('access_token') };

    callback = callback || function () {};

    if (req.headers['connection'] == 'upgrade' && !session.accessToken) {
      session.accessToken = req.host + req.ip + new Date().getTime().toString() + '_' + Math.random();
      session.accessToken = ____0.x0md50x(session.accessToken);
      session.tmp = true;
      return callback(session);
    }

    if (session.accessToken) {
      let index = sessions.list.findIndex((s) => s && s.accessToken && s.accessToken === session.accessToken);
      if (index !== -1) {
        sessions.list[index].$time = new Date().getTime();
        sessions.list[index].requestesCount++;
        sessions.list[index].language = sessions.list[index].language || ____0.options.language;
        sessions.list[index].lang = sessions.list[index].language.id;
        callback(sessions.list[index]);
      } else {
        if (____0.options.session.storage === 'mongodb') {
          sessions.$collection.find(
            { accessToken: session.accessToken },
            (err, doc) => {
              if (!err && doc) {
                doc.$time = new Date().getTime();
                doc.requestesCount++;
                if (!doc.language || !doc.language.id) {
                  doc.language = ____0.options.language;
                }

                doc.lang = doc.language.id;
                sessions.list.push(doc);
                callback(sessions.list[sessions.list.findIndex((s) => s && s.accessToken == session.accessToken)]);
              } else {
                session.$new = !0;
                session.language = ____0.options.language;
                session.lang = session.language.id;
                session.theme = ____0.options.theme;
                session.data = [];
                session.requestesCount = 1;
                session.createdTime = new Date().getTime();
                session.$time = new Date().getTime();
                sessions.list.push(session);
                callback(sessions.list[sessions.list.findIndex((s) => s && s.accessToken == session.accessToken)]);
              }
            },
            true
          );
        } else {
          session.$new = !0;
          session.language = ____0.options.language;
          session.lang = session.language.id;
          session.theme = ____0.options.theme;
          session.data = [];
          session.requestesCount = 1;
          session.createdTime = new Date().getTime();
          session.$time = new Date().getTime();
          callback(session);
          sessions.list.push(session);
        }
      }
    } else {
      session.$new = !0;
      session.language = ____0.options.language;
      session.lang = session.language.id;
      session.theme = ____0.options.theme;
      session.data = [];
      session.requestesCount = 1;
      session.createdTime = new Date().getTime();
      session.$time = new Date().getTime();
      session.accessToken = req.host + req.ip + new Date().getTime().toString() + '_' + Math.random();
      session.accessToken = ____0.x0md50x(session.accessToken);
      sessions.list.push(session);
      callback(sessions.list[sessions.list.findIndex((s) => s && s.accessToken == session.accessToken)]);
    }
  };

  ____0.saveSession = sessions.save = function (session) {
    let index = sessions.list.findIndex((s) => s && s.accessToken && s.accessToken == session.accessToken);
    if (index !== -1) {
      sessions.list[index] = session;
    }
  };

  ____0.on('[any][saving data]', function () {
    sessions.saveAll();
  });

  ____0.onPOST({ name: '/x-language/change', public: true }, (req, res) => {
    req.session.language = req.data;
    req.session.lang = req.session.language.id || req.data.name;
    req.session.langDir = req.session.language?.dir;
    req.session.$save();
    res.json({
      done: true,
      language: req.session.language,
    });
  });

  ____0.onPOST('x-api/session', (req, res) => {
    res.json({
      done: !0,
      session: req.session,
    });
  });

  ____0.onPOST('x-api/sessions', (req, res) => {
    res.json({
      done: !0,
      list: sessions.list,
    });
  });

  ____0.onPOST('x-api/sessions/save', (req, res) => {
    sessions.saveAll();
    res.json({
      done: !0,
    });
  });
  ____0.onPOST('x-api/sessions/delete', (req, res) => {
    sessions.list = [];
    sessions.saveAll((err, docs) => {
      res.json({
        err: err,
        docs: docs,
        done: !0,
      });
    });
  });

  if (!____0.options.session.storage === 'mongodb') {
    sessions.loadAll();
  }

  sessions.handleSessions();

  return sessions;
};
