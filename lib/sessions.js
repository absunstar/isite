module.exports = function init(____0) {
  const sessions = function () {};
  sessions.list = [];
  sessions.path = ____0.path.resolve(____0.cwd + '/' + ____0.options.name + '_' + 'sessions.json');

  sessions.loadAll = function (callback) {
    callback =
      callback ||
      function (err, docs) {
        if (!err && docs) {
          sessions.list = docs;
        }
      };
    let ss = ____0.readFileSync(sessions.path);
    if (ss) {
      try {
        ss = JSON.parse(ss);
        callback(null, ss);
        console.log(' ... sessions Loaded ...' + sessions.path);
      } catch (err) {
        console.log(err.message);
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

    sessions.list.forEach((s, i) => {
      let online = new Date().getTime() - s.createdTime;
      let timeout = 1000 * 60 * ____0.options.session.timeout;
      if (online > timeout) {
        sessions.list.splice(i, 1);
      }
    });

    ____0.writeFile(sessions.path, JSON.stringify(sessions.list), () => {
      callback(null, sessions.list);
      console.log(' ... sessions Saved ...' + sessions.path);
    });

    return;
  };

  sessions.loadAll();

  ____0.getSession = sessions.attach = function (session, callback) {
    callback = callback || function () {};
    session.$exists = !1;

    if (session.accessToken) {
      sessions.list.forEach((s, i) => {
        if (s.accessToken && s.accessToken == session.accessToken) {
          session.$exists = !0;
          session.$index = i;
        }
      });
    }

    if (!session.$exists) {
      session.$new = !0;
      session.lang = ____0.options.lang;
      session.theme = ____0.options.theme;
      session.data = [];
      session.ip_info = session.ip_info || {};
      session.requestesCount = 1;
      session.createdTime = new Date().getTime();
      session.$index = sessions.list.length;
      sessions.list.push(session);
    }

    callback(sessions.list[session.$index]);
    return sessions.list[session.$index];
  };

  ____0.saveSession = sessions.save = function (session, callback) {
    callback = callback || function () {};
    session.$exists = !1;

    if (session.$index && sessions.list[session.$index]) {
      sessions.list[session.$index] = { ...sessions.list[session.$index], ...session };
      callback(sessions.list[session.$index]);
      return sessions.list[session.$index];
    } else {
      sessions.list.forEach((s, i) => {
        if (session.$exists) {
          return;
        }
        if (s.accessToken == session.accessToken) {
          sessions.list[i] = { ...sessions.list[i], ...session };
          session.$exists = !0;
          session.$index = i;
          callback(sessions.list[session.$index]);
          return sessions.list[session.$index];
        }
      });
    }
    return sessions.list[session.$index];
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
    sessions.list.forEach((s, i) => {
      if (s.accessToken == session.accessToken) {
        sessions.list.splice(i, 1);
      }
    });
  });
  ____0.on('[session][user][update]', (user) => {
    sessions.list.forEach((s) => {
      if (s.user && s.user.id == user.id) {
        s.user = user;
      }
    });
  });

  ____0.on('[any][saving data]', function () {
    sessions.saveAll();
  });

  ____0.onPOST({ name: '/x-language/change', public: true }, (req, res) => {
    req.session.lang = req.data.name;
    ____0.saveSession(req.session);
    res.json({
      done: true,
      lang: req.data.name,
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

  return sessions;
};
