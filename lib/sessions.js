module.exports = function init(____0) {
  const sessions = function () {};
  sessions.list = [];
  let $sessions = {};

  if (____0.options.mongodb.enabled) {
    $sessions = ____0.connectCollection({
      db: ____0.options.session.db,
      collection: ____0.options.session.collection,
    });
  }

  ____0.on('[session][update]', (session) => {
    sessions.list.forEach((s) => {
      if (s.accessToken == session.accessToken) {
        for (var key in session) {
          if (session.hasOwnProperty(key) && key !== 'accessToken') {
            key = key.toLowerCase();
            for (var i = 0; i < s.data.length; i++) {
              var obj = s.data[i];
              if (obj.key === key) {
                s.data[i] = {
                  key: key,
                  value: ____0.copy(session[key]),
                };
              }
            }
            s.data.push({
              key: key,
              value: ____0.copy(session[key]),
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

  sessions.loadAll = function (callback) {
    callback =
      callback ||
      function (err, docs) {
        if (!err && docs) {
          sessions.list = docs;
        }
      };

    if (____0.options.session.storage !== 'mongodb' || ____0.options.mongodb.enabled === !1) {
      callback(
        {
          message: 'storage not monodb',
        },
        null,
      );

      return;
    }

    $sessions.findMany(
      {
        where: {},
        select: {},
        limit: 100000,
      },
      function (err, docs) {
        callback(err, docs);
      },
    );
  };

  sessions.saveAll = function (callback) {
    callback =
      callback ||
      function (err) {
        if (err) {
          console.log(err.message);
        }
      };

    if (____0.options.session.timeout === 0) {
      callback({
        message: 'Timout is Zero And Sessions Will Not Saved In DB ',
      });
      return;
    }

    sessions.list = sessions.list
      .filter((s) => {
        let online = new Date().getTime() - s.createdTime;
        let timeout = 1000 * 60 * ____0.options.session.timeout;
        return online < timeout;
      })
      .filter((s) => s.requestesCount > 1);

    if (____0.options.session.storage !== 'mongodb' || ____0.options.mongodb.enabled === !1) {
      callback(
        {
          message: 'Storage Not MongoDB || Not Enabled',
        },
        null,
      );

      return;
    }

    if (sessions.busy === !0) {
      ____0.log('Sessions is Busy');
      callback(
        {
          message: 'Sessions is Busy',
        },
        null,
      );
      return;
    }

    sessions.busy = !0;

    $sessions.deleteMany(
      {
        where: {},
      },
      function (err, result) {
        sessions.busy = !1;
        if (sessions.list.length === 0) {
          callback(
            {
              message: 'sessions is empty',
            },
            null,
          );
          return;
        }

        $sessions.insertMany(sessions.list, function (err, docs) {
          callback(err, docs);
          sessions.busy = !1;
        });
      },
    );
  };

  sessions.handle = function (session, callback) {
    callback = callback || function () {};

    if (sessions.list === undefined) {
      sessions.list = [];
    }

    let session_exists = !1;

    sessions.list.forEach((s, i) => {
      if (s.accessToken == session.accessToken) {
        session_exists = !0;

        session.createdTime = s.createdTime;
        session.data = session.data || s.data || [];
        session.lang = session.lang || s.lang || ____0.options.lang;
        session.theme = session.theme || s.theme || ____0.options.theme;
        session.requestesCount = s.requestesCount + 1;
        session.ip_info = session.ip_info || s.ip_info || {};
        session.busy = typeof session.busy == 'undefined' ? s.busy : session.busy;

        sessions.list[i] = {
          accessToken: session.accessToken,
          createdTime: session.createdTime,
          modifiedTime: session.modifiedTime,
          data: session.data,
          lang: session.lang,
          theme: session.theme,
          ip: session.ip,
          requestesCount: session.requestesCount,
          busy: session.busy,
          ip_info: session.ip_info,
        };
        callback(session);
      }
    });

    if (!session_exists) {
      session.$new = !0;
      session.lang = ____0.options.lang;
      session.theme = ____0.options.theme;
      session.data = [];
      session.ip_info = session.ip_info || {};
      session.requestesCount = 1;
      session.createdTime = new Date().getTime();
      sessions.list.push({
        accessToken: session.accessToken,
        createdTime: session.createdTime,
        modifiedTime: session.modifiedTime,
        data: session.data,
        ip: session.ip,
        requestesCount: session.requestesCount,
        busy: session.busy,
        ip_info: session.ip_info,
      });
      callback(session);
    }
    return session;
  };

  ____0.on('[any][saving data]', function () {
    sessions.saveAll();
  });

  sessions.busy = !1;

  function loadAllSessions() {
    sessions.busy = !0;

    if (____0.options.session.storage !== 'mongodb' || ____0.options.mongodb.enabled === !1) {
      sessions.busy = !1;
      return;
    }

    sessions.loadAll((err, docs) => {
      sessions.busy = !1;
      if (!err) {
        sessions.list = docs;
      } else {
        console.log(err);
        setTimeout(() => {
          loadAllSessions();
        }, 250);
      }
    });
  }

  loadAllSessions();

  ____0.get('x-api/sessions', (req, res) => {
    res.json({
      done: !0,
      list: sessions.list,
    });
  });

  ____0.get('x-api/sessions/save', (req, res) => {
    sessions.saveAll();
    res.json({
      done: !0,
    });
  });
  ____0.get('x-api/sessions/delete', (req, res) => {
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
