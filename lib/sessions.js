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
          console.log(' ... sessions Loaded From ...' + sessions.path);
        } catch (err) {
          console.log(err.message);
        }
      }
    }

    return;
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

    if (____0.options.session.storage === 'mongodb') {
      sessions.list.forEach((s, i) => {
        if (!s) {
          return false;
        }
        if (new Date().getTime() - s.createdTime > 1000 * 60 * ____0.options.session.timeout) {
          sessions.list.splice(i, 1);
          sessions.$collection.delete(s);
        } else {
          if (s.id) {
            sessions.$collection.update(s, (err, result) => {
              if (!err && result) {
                sessions.list[i] = result.doc;
              }
            });
          } else {
            sessions.$collection.insert(s, (err, doc) => {
              if (!err && doc) {
                sessions.list[i] = doc;
              }
            });
          }
        }
      });
    } else {
      sessions.list.forEach((s, i) => {
        if (!s) {
          return false;
        }
        let online = new Date().getTime() - s.createdTime;
        let timeout = 1000 * 60 * ____0.options.session.timeout;
        if (online > timeout) {
          sessions.list.splice(i, 1);
        }
      });

      ____0.writeFile(sessions.path, JSON.stringify(sessions.list), () => {
        callback(null, sessions.list);
        console.log(' ... sessions Saved to ...' + sessions.path);
      });
    }

    return;
  };

  ____0.getSession = sessions.attach = function (session, callback) {
    callback = callback || function () {};
    session.$exists = !1;

    if (session.accessToken) {
      let index = sessions.list.findIndex((s) => s && s.accessToken && s.accessToken === session.accessToken);
      if (index > -1) {
        sessions.list[index].requestesCount++;
        sessions.list[index].language = sessions.list[index].language || ____0.options.language;
        session.$exists = !0;
        session.$index = index;
        callback(sessions.list[index]);
      } else {
        if (____0.options.session.storage === 'mongodb') {
          sessions.$collection.find(
            { accessToken: session.accessToken },
            (err, doc) => {
              if (!err && doc) {
                session.$exists = !0;
                session = { ...session, ...doc };
                session.requestesCount++;
                session.$index = sessions.list.length;
                session.language = session.language || ____0.options.language;

                sessions.list.push(session);
                callback(sessions.list[session.$index]);
              } else {
                session.$new = !0;
                session.language = ____0.options.language;
                session.lang = ____0.options.language.id;
                session.theme = ____0.options.theme;
                session.data = [];
                session.requestesCount = 1;
                session.createdTime = new Date().getTime();
                session.$index = sessions.list.length;
                sessions.list.push(session);
                callback(sessions.list[session.$index]);
              }
            },
            true
          );
        } else {
          session.$new = !0;
          session.language = ____0.options.language;
          session.lang = ____0.options.language.id;
          session.theme = ____0.options.theme;
          session.data = [];
          session.requestesCount = 1;
          session.createdTime = new Date().getTime();
          session.$index = sessions.list.length;
          sessions.list.push(session);
          callback(sessions.list[session.$index]);
        }
      }
    } else {
      session.$new = !0;
      session.language = ____0.options.language;
      session.lang = ____0.options.language.id;
      session.theme = ____0.options.theme;
      session.data = [];
      session.requestesCount = 1;
      session.createdTime = new Date().getTime();
      session.$index = sessions.list.length;
      sessions.list.push(session);
      callback(sessions.list[session.$index]);
    }
  };

  ____0.saveSession = sessions.save = function (session, callback) {
    callback = callback || function () {};
    session.$exists = !1;
    let index = sessions.list.findIndex((s) => s.accessToken && s.accessToken == session.accessToken);
    if (index !== -1) {
      sessions.list[index] = { ...sessions.list[index], ...session };
      callback(sessions.list[index]);
      return sessions.list[index];
    }
  };

  ____0.on('[session][update]', (session) => {
    sessions.list.forEach((s) => {
      if (s.accessToken == session.accessToken) {
        for (let key in session) {
          if (session.hasOwnProperty(key) && key !== 'accessToken') {
            key = key.toLowerCase();
            for (let i = 0; i < s.data.length; i++) {
              let obj = s.data[i];
              if (obj.key === key) {
                s.data[i] = {
                  key: key,
                  value: session[key],
                };
              }
            }
            s.data.push({
              key: key,
              value: session[key],
            });
          }
        }
      }
    });
  });
  ____0.on('[session][delete]', (session) => {
    let index = sessions.list.findIndex((s) => s.accessToken && s.accessToken == session.accessToken);
    if (index !== -1) {
      sessions.list.splice(index, 1);
    }
  });
  ____0.on('[session][user][update]', (user) => {
    let index = sessions.list.findIndex((s) => s.user && s.user == session.user);
    if (index !== -1) {
      sessions.list[index].user = user;
    }
  });

  ____0.on('[any][saving data]', function () {
    sessions.saveAll();
  });

  ____0.onPOST({ name: '/x-language/change', public: true }, (req, res) => {
    req.session.language = req.data;
    req.session.lang = req.session.language?.id || req.data.name;
    req.session.langDir = req.session.language?.dir;

    ____0.saveSession(req.session);
    res.json({
      done: true,
      lang: req.data.name,
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
  return sessions;
};
