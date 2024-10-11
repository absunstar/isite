module.exports = function init(req, res, ____0, callback) {
  ____0.getSession({ accessToken: req.headers['Access-Token'] || req.headers['access-token'] || req.query['access-token'] || req.cookie('access_token') }, (session) => {
    session.$save = function () {
      ____0.saveSession(session);
    };
    if (!session.accessToken) {
      session.accessToken = req.host + new Date().getTime().toString() + '_' + Math.random();
      session.accessToken = ____0.x0md50x(session.accessToken);
      res.cookie('access_token', session.accessToken);
      res.set('Access-Token', session.accessToken);
    }

    session.ip = req.ip;
    session.modifiedTime = new Date().getTime();
    ____0.saveSession(session);

    function AssignFeatures() {
      ____0.options.defaults.features.forEach((f) => {
        req.features.push(f);
      });
      ____0.features.forEach((f) => {
        req.features.push(f.name);
      });
      if (____0.options.dynamic) {
        req.features.push('site.dynamic');
      }
      req.features.push('ip.' + req.ip);

      if (req.host) {
        req.features.push('host.' + req.host);
        req.hostArray = req.host.split(':')[0].split('.').reverse();
        if (req.hostArray[0] == 'localhost') {
          req.domain = req.hostArray[0];
          req.features.push('host.' + req.hostArray[0]);
          if (req.hostArray.length == 2) {
            req.domain2 = req.hostArray[1];
            req.features.push('host.' + req.hostArray[1]);
          } else if (req.hostArray.length == 3) {
            req.domain2 = req.hostArray[1];
            req.domain3 = req.hostArray[2];
            req.features.push('host.' + req.domain2);
            req.features.push('host.' + req.domain3);
          }
        } else {
          if (req.hostArray.length == 2) {
            req.domain = req.hostArray[1] + '.' + req.hostArray[0];
            req.features.push('host.' + req.domain);
            req.features.push('host.' + req.hostArray[0]);
            req.features.push('host.' + req.hostArray[1]);
          } else if (req.hostArray.length == 3) {
            req.domain = req.hostArray[1] + '.' + req.hostArray[0];
            req.domain2 = req.hostArray[2];
            req.features.push('host.' + req.domain);
            req.features.push('host.' + req.hostArray[0]);
            req.features.push('host.' + req.hostArray[1]);
            req.features.push('host.' + req.hostArray[2]);
          } else if (req.hostArray.length == 4) {
            req.domain = req.hostArray[1] + '.' + req.hostArray[0];
            req.domain2 = req.hostArray[2];
            req.domain3 = req.hostArray[3];
            req.features.push('host.' + req.domain);
            req.features.push('host.' + req.hostArray[0]);
            req.features.push('host.' + req.hostArray[1]);
            req.features.push('host.' + req.hostArray[2]);
            req.features.push('host.' + req.hostArray[3]);
          }
        }
      }

      if (req.headers['x-browser'] && req.headers['x-browser'].contains('social')) {
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

    AssignFeatures();

    if (____0.security && session.user_id) {
      ____0.security.getUser(
        {
          id: session.user_id,
        },
        function (err, user) {
          if (!err && user) {
            session.user = user;
            if (session.user) {
              req.features.push('login');
            }
            ____0.saveSession(session);
            callback(session);
          }
        }
      );
    } else {
      callback(session);
    }
  });
};
