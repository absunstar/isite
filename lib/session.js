module.exports = function init(req, res, _s_, callback) {
  let session = function (key, value) {
    if (value === undefined) {
      return session.get(key);
    } else {
      session.set(key, value);
    }
  };

  session.save = function () {
    session.$changed = true;
    session = _s_.sessions.handle(session);
  };

  session.set = function (key, value) {
    key = key.toLowerCase();
    for (var i = 0; i < session.data.length; i++) {
      var obj = session.data[i];
      if (obj.key === key) {
        session.data[i] = {
          key: key,
          value: _s_.copy(value),
        };
        session.save();
        return;
      }
    }

    session.data.push({
      key: key,
      value: _s_.copy(value),
    });

    session.save();
  };

  session.get = function (key) {
    key = key.toLowerCase();
    for (var i = 0; i < session.data.length; i++) {
      var d = session.data[i];
      if (key.indexOf('.') != -1) {
        if (d.key == key.split('.')[0]) {
          return _s_.fromJson(_s_.copy(session.data[i].value))[key.split('.')[1]];
          break;
        }
      } else {
        if (d.key == key) {
          return _s_.copy(session.data[i].value);
          break;
        }
      }
    }
    return null;
  };

  session.accessToken = req.cookie('access_token');
  session.browserToken = req.cookie('browser_token');

  if (!session.accessToken) {
    session.accessToken = new Date().getTime().toString() + '_' + Math.random() * (10000 - 1000) + 1000;
    session.accessToken = _s_.md5(session.accessToken);
    res.cookie('access_token', session.accessToken);
  }
  if (!session.browserToken) {
    session.browserToken = new Date().getTime().toString() + '_' + Math.random() * (10000 - 1000) + 1000;
    session.browserToken = _s_.md5(session.browserToken);
    res.cookie('browser_token', session.browserToken, {
      expires: 60 * 24 * 365 * 10,
    });
  }

  session.ip = req.ip;
  session.modifiedTime = new Date().getTime();
  session.save();

  function AssignFeatures() {
    req.features = [];
    _s_.features.forEach((f) => {
      req.features.push(f.name);
    });
    if (_s_.options.dynamic) {
      req.features.push('site.dynamic');
    }
    req.features.push('ip.' + req.ip);

    if (req.headers['host']) {
      req.headers['host'].split('.').forEach((h) => {
        req.features.push('host.' + h);
      });
    }

    if (req.cookies.obj && req.cookies.obj['_ga'] && req.cookies.obj['_ga'].contains('sb')) {
      req.features.push('browser.social');
    }

    if (req.headers['x-browser'] && req.headers['x-browser'].contains('social-browser')) {
      req.features.push('browser.social');
    }

    if (req.headers['user-agent']) {
      req.userAgent = req.headers['user-agent'].toLowerCase();
      req.features.push('user-agent.' + req.userAgent);
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(req.userAgent)) {
        req.features.push('os.mobile');
      } else {
        req.features.push('os.desktop');
      }

      if (req.userAgent.contains('windows')) {
        req.features.push('os.windows');
        if (req.userAgent.contains('windows nt 5.1')) {
          req.features.push('os.windowsxp');
        } else if (req.userAgent.contains('windows nt 6.1')) {
          req.features.push('os.windows7');
        } else if (req.userAgent.contains('windows nt 6.2') || req.userAgent.contains('windows nt 6.3')) {
          req.features.push('os.windows8');
        } else if (req.userAgent.contains('windows nt 6.4') || req.userAgent.contains('windows nt 10')) {
          req.features.push('os.windows10');
        } else {
        }
      } else if (req.userAgent.contains('linux')) {
        req.features.push('os.linux');
      } else if (req.userAgent.contains('macintosh')) {
        req.features.push('os.mac');
      } else if (req.userAgent.contains('android')) {
        req.features.push('os.android');
      } else {
        req.features.push('os.unknown');
      }

      if (req.userAgent.contains('edge')) {
        req.features.push('browser.edge');
      } else if (req.userAgent.contains('firefox')) {
        req.features.push('browser.firefox');
      } else if (req.userAgent.contains('opr')) {
        req.features.push('browser.opera');
      } else if (req.userAgent.contains('ucbrowser')) {
        req.features.push('browser.ucbrowser');
      } else if (req.userAgent.contains('bdbrowser') || req.userAgent.contains('baidu') || req.userAgent.contains('baidubrowser')) {
        req.features.push('browser.baidu');
      } else if (req.userAgent.contains('chromium')) {
        req.features.push('browser.chromium');
      } else if (req.userAgent.contains('chrome')) {
        req.features.push('browser.chrome');
      } else {
        req.features.push('browser.unknown');
      }
    }
  }

  function ipInfo(session, callback) {
    callback(session);

    if (session.busy) {
      return;
    }
    session.busy = true;
    session.save();
    if (session.ip_info.status != 'success' || session.ip_info.id != session.ip) {
      //session.ip = session.ip == "127.0.0.1" ? "45.22.11.33" : "127.0.0.1"
      _s_
        .fetch(`http://ip-api.com/json/${session.ip}`, {
          method: 'get',
          headers: { 'Content-Type': 'application/json' },
        })
        .then((res) => res.json())
        .then((info) => {
          info.date = new Date();
          session.set('ip_' + session.ip, info);
          session.ip_info = info;
          session.save();
          setTimeout(() => {
            session.busy = false;
            session.save();
          }, 1000 * 30);
        }).catch(err=>{
          
          setTimeout(() => {
            session.busy = false;
            session.save();
          }, 1000 * 30);
        });
    }
  }
  AssignFeatures();

  req.hasFeature = function (name) {
    for (let i = 0; i < req.features.length; i++) {
      if (req.features[i] == name) {
        return true;
      }
    }
    return false;
  };

  session.user_id = session('user_id');

  if (_s_.security && session.user_id) {
    _s_.security.getUser(
      {
        id: session.user_id,
      },
      function (err, user) {
        session.user = user;
        if (session.user) {
          if (!session.user.permissions) {
            session.user.permissions = [];
          }
          req.features.push('login');
        }
        ipInfo(session, callback);
      },
    );
  } else {
    ipInfo(session, callback);
  }
};
