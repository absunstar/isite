module.exports = function init(____0) {
  ____0.on(____0.strings[4], (_) => {
    if (!_) {
      _0xrrxo.list = _0xrrxo.list.filter((r) => r.name.like('*x-api*'));
    }
  });

  let _0xrrxo = function () {};

  _0xrrxo.list = [];

  _0xrrxo.endResponse = function (req, res) {
    let route = req.route;

    if (route.empty) {
      if (____0.options.help) {
        res.set('help-error-message', 'route is empty');
      }
      res.end();
      return;
    }

    if (route.parser.like('*html*') && route.content && route.content.length > 0) {
      req.content = ____0.parser(req, res, ____0, route).html(route.content);
    } else if (route.parser == 'css' && route.content && route.content.length > 0) {
      req.content = ____0.parser(req, res, ____0, route).css(route.content);
    } else if (route.parser == 'js' && route.content && route.content.length > 0) {
      req.content = ____0.parser(req, res, ____0, route).js(route.content);
    } else {
      req.content = route.content;
    }

    if (route.compress) {
      req.content = req.content.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ');
    }

    route.path = route.path || '';

    // let hash = req.content ? ____0.x0md50x(req.content) : ____0.x0md50x('');
    let last_modified = new Date().toUTCString();
    if (route.stat) {
      last_modified = new Date(route.stat.mtimeMs).toUTCString();
    }

    // if (req.headers['if-none-match'] == hash) {
    //   if (____0.options.help) {
    //     res.set('help-info-message', 'etag matched');
    //   }
    //   // res.status(304).end(null);
    //   // return;
    // }

    // res.set('ETag', hash);

    if (____0.options.cache.enabled) {
      res.set('Last-Modified', last_modified);
    }

    if (route.headers) {
      for (const property in route.headers) {
        res.set(property, route.headers[property]);
      }
    }

    let encode = ____0.getFileEncode(route.path);

    if (route.path.endsWith('.css')) {
      res.set(____0.strings[7], 'text/css');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.css);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.js')) {
      res.set(____0.strings[7], 'application/javascript');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.js);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.html')) {
      res.set(____0.strings[7], 'text/html');
      if (____0.options.cache.enabled && route.cache) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.html);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.txt')) {
      res.set(____0.strings[7], 'text/plain');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.txt);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.json')) {
      res.set(____0.strings[7], 'application/json');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.json);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.xml')) {
      res.set(____0.strings[7], 'text/xml');
      if (____0.options.cache.enabled) {
        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.xml);
      }

      res.end(req.content, encode);
    } else if (route.path.endsWith('.woff2')) {
      res.set(____0.strings[7], 'application/font-woff2');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.woff')) {
      res.set(____0.strings[7], 'application/font-woff');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.ttf')) {
      res.set(____0.strings[7], 'application/font-ttf');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.otf')) {
      res.set(____0.strings[7], 'application/font-otf');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.eot')) {
      res.set(____0.strings[7], 'application/font-eot');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.gif')) {
      res.set(____0.strings[7], 'image/gif');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.png')) {
      res.set(____0.strings[7], 'image/png');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.jpg')) {
      res.set(____0.strings[7], 'image/jpg');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.jpeg')) {
      res.set(____0.strings[7], 'image/jpeg');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.ico')) {
      res.set(____0.strings[7], 'image/ico');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.bmp')) {
      res.set(____0.strings[7], 'image/bmp');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.webp')) {
      res.set(____0.strings[7], 'image/webp');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.svg')) {
      res.set(____0.strings[7], 'image/svg+xml');
      if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);

      res.end(req.content, encode);
    } else {
      if (typeof req.content == 'object') {
        res.json(req.content);
      } else {
        res.end(req.content, encode);
      }
    }
  };

  _0xrrxo.defaultCallback = function (req, res) {
    let route = req.route;

    if (route.cache && route.content) {
      if (____0.options.help) {
        res.set('help-info-content', 'From Route Memory');
      }

      res.status(200);
      _0xrrxo.endResponse(req, res);
      return;
    }

    if (route.empty) {
      res.status(404);
      _0xrrxo.endResponse(req, res);
      return;
    }

    if (!route.path && !route.content) {
      if (____0.options.help) {
        res.set('help-info-content', 'Route Not Set File Path');
      }
      res.status(200);
      _0xrrxo.endResponse(req, res);
      return;
    } else if (route.content) {
      if (____0.options.help) {
        res.set('help-info-content', 'Content From Route init');
      }
      res.status(200);
      _0xrrxo.endResponse(req, res);
    }

    if (typeof route.path == 'string') {
      ____0.readFile(route.path, function (err, file) {
        if (!err) {
          route.content = file.content.toString('utf8');
          if (route.encript && route.encript === '123') {
            route.content = ____0.f1(route.content);
          }
          route.stat = file.stat;
          if (route.masterPage) {
            for (var i = 0; i < ____0.masterPages.length; i++) {
              if (route.masterPage == ____0.masterPages[i].name) {
                route.content = ____0.readFileSync(____0.masterPages[i].header) + route.content + ____0.readFileSync(____0.masterPages[i].footer);
                break;
              }
            }
          }

          if (____0.options.help) {
            res.set('help-info-content', 'Route Read File');
          }

          res.status(200);
          _0xrrxo.endResponse(req, res);
        } else {
          if (____0.options.help) {
            res.set('help-error', 'Route Error Read File');
          }

          res.status(404);
          route.empty = !0;
          _0xrrxo.endResponse(req, res);
          return;
        }
      });
    } else if (typeof route.path == 'object') {
      ____0.readFiles(route.path, function (err, data) {
        if (!err) {
          if (____0.options.help) {
            res.set('help-info-content', 'Route Read Files');
          }

          route.content = data.toString('utf8');
          if (route.encript && route.encript === '123') {
            route.content = ____0.f1(route.content);
          }
          res.status(200);
          route.path = route.path.join('&&');
          _0xrrxo.endResponse(req, res);
        } else {
          if (____0.options.help) {
            res.set('help-error', 'Route Error Read Files');
          }

          res.status(404);
          route.empty = !0;
          _0xrrxo.endResponse(req, res);
          return;
        }
      });
    }
  };

  _0xrrxo.call = function (r, req, res, callback) {
    callback =
      callback ||
      function (req, res) {
        console.log('No CallBack set For : ', r);
        res.end();
      };
    if (typeof r === 'string') {
      r = {
        name: r,
        method: req.method,
      };
    }

    let exists = false;
    _0xrrxo.list.forEach((rr) => {
      if (exists) {
        return;
      }
      if ((rr.name == r.name || rr.nameRaw == r.name) && rr.method == r.method) {
        exists = true;
        req.route = rr;
        rr.callback(req, res);
      }
    });

    if (!exists) {
      callback(req, res);
    }
  };
  _0xrrxo.off = function (r) {
    if (!r) {
      return;
    }
    if (typeof r == 'string') {
      r = { name: r };
    }
    if (!r.name.startsWith('/')) {
      r.name = '/' + r.name;
    }

    for (let i = _0xrrxo.list.length; i--; ) {
      let oldRoute = _0xrrxo.list[i];
      if (r.name && r.method && oldRoute.name.like(r.name) && oldRoute.method.like(r.method)) {
        _0xrrxo.list.splice(i, 1);
        ____0.fsm.off(oldRoute.path);
      } else if (r.name && r.method && oldRoute.nameRaw.like(r.name) && oldRoute.method.like(r.method)) {
        _0xrrxo.list.splice(i, 1);
        ____0.fsm.off(oldRoute.path);
      } else if (r.name && oldRoute.name.like(r.name)) {
        _0xrrxo.list.splice(i, 1);
        ____0.fsm.off('*' + oldRoute.name.replace('/', '') + '*');
        ____0.fsm.off(oldRoute.path);
      } else if (r.name && oldRoute.nameRaw.like(r.name)) {
        _0xrrxo.list.splice(i, 1);
        ____0.fsm.off('*' + oldRoute.name.replace('/', '') + '*');
        ____0.fsm.off(oldRoute.path);
      } else if (r.method && oldRoute.method.like(r.method)) {
        _0xrrxo.list.splice(i, 1);
        ____0.fsm.off(oldRoute.path);
      }
    }
  };
  _0xrrxo.add = function (r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        _0xrrxo.add(r2, callback);
      });
      return;
    }
    if (r && r.name && Array.isArray(r.name)) {
      r.name.forEach((r2) => {
        let r3 = { ...r };
        r3.name = r2;
        _0xrrxo.onREQUEST(r3, r.callback);
      });
      return;
    }
    let route = {};

    if (typeof r == 'string') {
      route.name = r.toLowerCase();
      route.nameRaw = r;
      route.public = ____0.options.public || false;
      route.method = 'GET';
      route.path = null;
      route.parser = 'static';
      route.parserDir = ____0.dir;
      route.cache = !0;
      route.hide = !1;
      route.compress = !1;
      route.content = null;
      route.headers = null;
      route.map = [];
      route.callback = callback ?? _0xrrxo.defaultCallback;
      if (route.public) {
        route.require = {
          features: [],
          permissions: [],
        };
      } else {
        route.require = ____0.options.require;
        route.default = ____0.options.defaults;
      }
    } else {
      route.name = r.name.toLowerCase();
      route.nameRaw = r.name;
      route.public = r.public ?? (____0.options.public || false);
      route.method = r.method || 'GET';
      route.path = r.path || null;
      route.lang = r.lang || null;
      route.content = r.content;
      route.headers = r.headers;
      route.parser = r.parser || 'static';
      route.parserDir = r.parserDir || ____0.dir;
      route.masterPage = r.masterPage || null;
      route.overwrite = r.overwrite ?? !1;
      route.cache = r.cache ?? !0;
      route.hide = r.hide ?? !1;
      route.encript = r.encript;
      route.compress = r.compress ?? !1;
      route.map = r.map || [];
      route.callback = callback || r.callback || _0xrrxo.defaultCallback;

      if (route.public) {
        route.require = {
          features: [],
          permissions: [],
        };
      } else {
        route.require = r.require ?? ____0.options.require;
        route.require.features = route.require.features ?? ____0.options.require.features;
        route.require.permissions = route.require.permissions ?? ____0.options.require.permissions;

        route.default = r.default ?? ____0.options.defaults;
        route.default.features = route.default.features ?? ____0.options.defaults.features;
        route.default.permissions = route.default.permissions ?? ____0.options.defaults.permissions;
      }
    }

    if (!route.name.startsWith('/')) {
      route.name = '/' + route.name;
      route.nameRaw = '/' + route.nameRaw;
    }

    route.name = route.name.replace('//', '/');
    route.nameRaw = route.nameRaw.replace('//', '/');

    let arr = route.name.split('/');
    let arr0 = route.nameRaw.split('/');

    for (var i = 0; i < arr.length; i++) {
      var s = arr[i];
      var s0 = arr0[i];

      if (s.startsWith(':')) {
        arr[i] = '*';
        let name = s.replace(':', '');
        let nameRaw = s0.replace(':', '');

        route.map.push({
          index: i,
          name: name,
          isLower: !1,
        });
        if (name !== nameRaw) {
          route.map.push({
            index: i,
            name: nameRaw,
            isLower: !0,
          });
        }
      }
    }
    try {
      route.name = arr.join('/');
      if (typeof route.path == 'string' && ____0.fs.lstatSync(route.path).isDirectory()) {
        ____0.fs.readdir(route.path, (err, files) => {
          files.forEach((file) => {
            let r2 = { ...route };
            if (route.name.endsWith('/')) {
              r2.name = route.name + file;
            } else {
              r2.name = route.name + '/' + file;
            }

            r2.path = route.path + '/' + file;
            r2.is_dynamic = !0;
            _0xrrxo.add(r2);
          });
        });
      } else {
        if (!route.name.startsWith('/')) {
          route.name = '/' + route.name;
        }

        route.name = encodeURI(route.name);
        let index = _0xrrxo.list.findIndex((rr) => rr.name == route.name && rr.method == route.method);
        if (index === -1) {
          _0xrrxo.list.push(route);
        } else if (!route.overwrite) {
          if (route.name.like('*api/*')) {
            ____0.log('[ Duplicate API ]  ' + route.name);
          } else {
            ____0.log('[ Duplicate Route ]  ' + route.name);
          }
        } else {
          _0xrrxo.list[index] = route;
        }
      }
    } catch (err) {
      ____0.log(err);
      return null;
    }
  };

  _0xrrxo.onREQUEST = function (type, r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        _0xrrxo.onREQUEST(type, r2, callback);
      });
      return;
    }
    let route = {};
    if (typeof r == 'string') {
      route = {
        name: r,
        method: type,
        callback: callback || _0xrrxo.defaultCallback,
      };
    } else {
      route = r;

      if (Array.isArray(r.name)) {
        r.name.forEach((n) => {
          let sub_route = { ...route };
          sub_route.name = n;
          _0xrrxo.onREQUEST(type, sub_route, callback);
        });
        return;
      }
      route.callback = route.callback || callback || _0xrrxo.defaultCallback;
    }
    route.method = type;
    _0xrrxo.add(route);
  };

  _0xrrxo.onGET = function (r, callback) {
    _0xrrxo.onREQUEST('GET', r, callback);
  };
  _0xrrxo.onPOST = function (r, callback) {
    _0xrrxo.onREQUEST('POST', r, callback);
  };
  _0xrrxo.onPUT = function (r, callback) {
    _0xrrxo.onREQUEST('PUT', r, callback);
  };
  _0xrrxo.onDELETE = function (r, callback) {
    _0xrrxo.onREQUEST('DELETE', r, callback);
  };

  _0xrrxo.onTEST = function (r, callback) {
    _0xrrxo.onREQUEST('TEST', r, callback);
  };

  _0xrrxo.onVIEW = function (r, callback) {
    _0xrrxo.onREQUEST('VIEW', r, callback);
  };
  _0xrrxo.onOPTIONS = function (r, callback) {
    _0xrrxo.onREQUEST('OPTIONS', r, callback);
  };
  _0xrrxo.onPATCH = function (r, callback) {
    _0xrrxo.onREQUEST('PATCH', r, callback);
  };
  _0xrrxo.onCOPY = function (r, callback) {
    _0xrrxo.onREQUEST('COPY', r, callback);
  };
  _0xrrxo.onHEAD = function (r, callback) {
    _0xrrxo.onREQUEST('HEAD', r, callback);
  };
  _0xrrxo.onLINK = function (r, callback) {
    _0xrrxo.onREQUEST('LINK', r, callback);
  };
  _0xrrxo.onUNLINK = function (r, callback) {
    _0xrrxo.onREQUEST('UNLINK', r, callback);
  };
  _0xrrxo.onPURGE = function (r, callback) {
    _0xrrxo.onREQUEST('PURGE', r, callback);
  };
  _0xrrxo.onLOCK = function (r, callback) {
    _0xrrxo.onREQUEST('LOCK', r, callback);
  };
  _0xrrxo.onUNLOCK = function (r, callback) {
    _0xrrxo.onREQUEST('UNLOCK', r, callback);
  };
  _0xrrxo.onPROPFIND = function (r, callback) {
    _0xrrxo.onREQUEST('PROPFIND', r, callback);
  };

  _0xrrxo.onALL = _0xrrxo.onANY = function (r, callback) {
    _0xrrxo.onREQUEST('*', r, callback);
  };

  _0xrrxo.handleRoute = async function (req, res, route) {
    if (route.lang) {
      req.session.language = { id: route.lang };
    }
    if (!route.public) {
      if (!route.name.like(____0.strings[15]) && route.require.features.length > 0) {
        let ok = !0;
        route.require.features.forEach((feature) => {
          if (!req.hasFeature(feature)) {
            ok = !1;
          }
        });
        if (!ok) {
          res.status(401);
          if (route.name.contains(____0.strings[16])) {
            return res.json({
              done: !1,
              error: ____0.strings[13],
              features: route.require.features,
            });
          } else
            return res.render(
              ____0.strings[11],
              {
                features: route.require.features,
                html: ` ${____0.strings[13]}  :   ${route.require.features.join(',')}`,
              },
              {
                parser: ____0.strings[17],
              }
            );
        }
      }

      if (!route.name.like(____0.strings[15]) && route.require.permissions.length > 0) {
        let ok = !0;
        route.require.permissions.forEach((permission) => {
          if (!____0.security.isUserHasPermissions(req, res, permission)) {
            ok = !1;
          }
        });
        if (!ok) {
          if (route.name.contains(____0.strings[16])) {
            res.status(401);
            return res.json({
              done: !1,
              error: ____0.strings[14],
              permissions: route.require.permissions,
            });
          } else {
            if (route.require.permissions.includes('login')) {
              return res.redirect(____0.options.security.login_url);
            } else {
              res.status(401);
              return res.render(
                ____0.strings[12],
                {
                  permissions: route.require.permissions.join(','),
                  html: `${____0.strings[14]}  :   ${route.require.permissions.join(',')}`,
                },
                {
                  parser: ____0.strings[17],
                }
              );
            }
          }
        }
      }
    }
    route.callback(req, res);
  };

  _0xrrxo.handleServer = async function (req, res) {
    req.host = req.headers['host'] || '';
    req.origin = req.headers['origin'] || req.host;
    req.referer = req.headers['referer'] || '';
    req.domain = '';
    req.subDomain = '';
    req.obj = {};
    req.query = {};
    req.queryRaw = {};
    req.data = req.body = {};
    req.bodyRaw = '';
    req.params = {};
    req.paramsRaw = {};
    req.features = [];

    res.setTimeout(1000 * ____0.options.responseTimeout, () => {
      if (req.url.like('*api*')) {
        return res.json({
          done: false,
          error: ____0.strings[19],
        });
      } else {
        res.end(503);
      }
    });
    req.addFeature = function (name) {
      req.features.push(name);
    };
    req.hasFeature = function (name) {
      return req.features.some((f) => f.like(name));
    };
    req.removeFeature = function (name) {
      req.features.forEach((f, i) => {
        if (f.like(name)) {
          req.features.splice(i, 1);
        }
      });
    };

    req.getUserFinger = function () {
      let userFinger = {
        id: null,
        email: null,
        date: new Date(),
        ip: null,
      };

      if (req && req.session && req.session.user) {
        req.session.user.profile = req.session.user.profile || {};
        userFinger.id = req.session.user.id;
        userFinger.email = req.session.user.email;
        userFinger.name = req.session.user.profile.name || userFinger.email;
        userFinger.name_ar = req.session.user.profile.name_ar || userFinger.email;
        userFinger.name_en = req.session.user.profile.name_en || userFinger.email;
        userFinger.ip = req.ip;
      } else {
      }

      return userFinger;
    };
    req.word = function (name) {
      let w = ____0.word(name);
      if (!w.hostList) {
        return w[req.session.language.id] || name;
      } else {
        if ((w2 = w.hostList.find((h) => req.host.like(h.name)))) {
          return w2[req.session.language.id] || name;
        }
      }
      return w[req.session.language.id] || name;
    };

    res.code = null;
    req.socket.remoteAddress = req.socket.remoteAddress || '';
    req.acceptEncoding = req.headers[____0.strings[5]] ? req.headers[____0.strings[5]] : '';
    res.ip = req.ip = req.headers[____0.strings[6]] ? req.headers[____0.strings[6]] : req.socket.remoteAddress?.replace('::ffff:', '');
    if (req.ip == '::1') {
      req.ip = '127.0.0.1';
    }
    res.ip2 = req.ip2 = req.socket.localAddress.replace('::ffff:', '');
    res.port = req.port = req.socket.remotePort;
    res.port2 = req.port2 = req.socket.localPort;
    res.cookies = res.cookie = req.cookies = req.cookie = ____0.cookie(req, res, ____0);

    req.urlRaw = req.url;
    req.urlParserRaw = ____0.url.parse(req.urlRaw, !0);
    req.urlParser = ____0.url.parse(req.urlRaw.toLowerCase(), !0);

    res.set = (a, b, c) => {
      if (res.writeHeadEnabled === !1 || res.finished === !0 || res.headersSent) {
        return res;
      }
      if (typeof b == 'string') {
        res.headers = res.headers || [];
        res.headers[a] = b.toLowerCase();
      }

      res.setHeader(a, b, c);
      return res;
    };
    res.delete = res.remove = res.removeHeader;
    res.writeHead0 = res.writeHead;
    res.writeHeadEnabled = !0;
    res.writeHead = (code, obj) => {
      if (res.writeHeadEnabled === !1 || res.finished === !0) {
        return res;
      }
      res.cookie.write();
      res.writeHeadEnabled = !1;
      res.writeHead0(code, obj);
      return res;
    };

    res.ending = (time, ...data) => {
      if (!time) {
        time = 0;
      }
      setTimeout(function () {
        res.end(...data);
      }, time);
    };

    res.end0 = res.end;
    res.end = function (arg1, arg2, arg3, arg4) {
      if (res.ended) {
        return;
      }

      if (typeof arg1 === 'number') {
        res.writeHead(arg1);
        return res.end(arg2, arg3, arg4);
      } else {
        if (res.headers === undefined || res.headers[____0.strings[7]] === undefined) {
          res.set(____0.strings[7], 'text/plain');
        }

        if (
          arg1 &&
          res.headers &&
          res.headers[____0.strings[7]] &&
          (res.headers[____0.strings[7]].like('*text/css*') ||
            res.headers[____0.strings[7]].like('*application/javascript*') ||
            res.headers[____0.strings[7]].like('*text/html*') ||
            res.headers[____0.strings[7]].like('*text/plain*') ||
            res.headers[____0.strings[7]].like('*application/json*'))
        ) {
          if (req.acceptEncoding.like('*gzip*') && typeof arg1 === 'string') {
            res.set(____0.strings[8], 'gzip');
            res.set('Vary', ____0.strings[5]);
            arg1 = ____0.zlib.gzipSync(Buffer.from(arg1));
          } else if (req.acceptEncoding.like('*deflate*') && typeof arg1 === 'string') {
            res.set(____0.strings[8], 'deflate');
            res.set('Vary', ____0.strings[5]);
            arg1 = ____0.zlib.deflateSync(Buffer.from(arg1));
          } else {
            // ____0.log(typeof arg1)
          }
        }

        res.writeHead(res.code || res.statusCode || 200);
        arg1 = arg1 || ' ';
        res.ended = true;
        return res.end0(arg1, arg2, arg3, arg4);
      }
    };

    res.status = (code) => {
      if (!res.code) {
        res.code = code || 200;
      }
      return res;
    };

    res.error = (code) => {
      res.status(code || 404).end();
    };

    res.download2 = (path, name) => {
      if (____0.isFileExistsSync(path)) {
        var stat = ____0.fileStatSync(path);
        if (stat && stat.isFile()) {
          res.writeHead(200, {
            'Content-Type': ____0.getContentType(path),
            'Content-Length': stat.size,
            'Content-Disposition': 'attachment; filename=' + (name || ____0.path.basename(path)),
          });
          var readStream = ____0.fs.createReadStream(path);
          readStream.on('end', function () {
            readStream.close();
          });
          res.on(____0.strings[10], function () {
            readStream.close();
          });
          readStream.pipe(res);
        } else {
          res.error();
        }
      } else {
        res.error();
      }
    };

    res.download = function (path, name) {
      if (____0.isFileExistsSync(path)) {
        const stat = ____0.fileStatSync(path);
        if (stat && stat.isFile()) {
          const fileSize = stat.size;
          const range = req.headers.range;
          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            const chunksize = end - start + 1;
            const readStream = ____0.fs.createReadStream(path, {
              start,
              end,
            });
            readStream.on('end', function () {
              readStream.close();
            });
            res.on(____0.strings[10], function () {
              readStream.close();
            });
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': ____0.getContentType(path),
            });
            readStream.pipe(res);
          } else {
            const readStream = ____0.fs.createReadStream(path);
            readStream.on('end', function () {
              readStream.close();
            });
            res.on(____0.strings[10], function () {
              readStream.close();
            });

            res.writeHead(200, {
              'Content-Length': fileSize,
              'Content-Type': ____0.getContentType(path),
              'Content-Disposition': 'attachment; filename=' + (name || ____0.path.basename(path)),
            });
            ____0.fs.createReadStream(path).pipe(res);
          }
        } else {
          res.error();
        }
      } else {
        res.error();
      }
    };

    res.html = res.render = function (file, _data = null, options = {}) {
      let filePath = '';
      if (typeof file === 'object') {
        filePath = file.path;
        options = { ...options, ...file };
      } else {
        filePath = file;
      }
      ____0.fsm.getContent(filePath, (content) => {
        if (!content) {
          if (_data && _data.html) {
            return res.status(404).htmlContent(_data.html);
          } else {
            return res.status(404).end();
          }
        }

        req.content = content;
        req.data = { ...req.data, ..._data };
        req.route = { ...req.route, ...options };
        if (req.route.parser) {
          req.content = ____0.parser(req, res, ____0, req.route).html(req.content);
        }

        res.status(options.code || 200);

        if (req.route.compress) {
          req.content = req.content.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ');
        }

        if (filePath.endsWith('.css')) {
          res.set(____0.strings[7], 'text/css');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.css);
          }
        } else if (filePath.endsWith('.js')) {
          res.set(____0.strings[7], 'application/javascript');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.js);
          }
        } else if (filePath.endsWith('.html')) {
          res.set(____0.strings[7], 'text/html');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.html);
          }
        } else if (filePath.endsWith('.txt')) {
          res.set(____0.strings[7], 'text/plain');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.txt);
          }
        } else if (filePath.endsWith('.json')) {
          res.set(____0.strings[7], 'application/json');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.json);
          }
        } else if (filePath.endsWith('.xml')) {
          res.set(____0.strings[7], 'text/xml');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.xml);
          }
        } else if (filePath.endsWith('.woff2')) {
          res.set(____0.strings[7], 'application/font-woff2');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
          }
        } else if (filePath.endsWith('.woff')) {
          res.set(____0.strings[7], 'application/font-woff');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
          }
        } else if (filePath.endsWith('.ttf')) {
          res.set(____0.strings[7], 'application/font-ttf');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
          }
        } else if (filePath.endsWith('.svg')) {
          res.set(____0.strings[7], 'application/font-svg');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
          }
        } else if (filePath.endsWith('.otf')) {
          res.set(____0.strings[7], 'application/font-otf');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
          }
        } else if (filePath.endsWith('.eot')) {
          res.set(____0.strings[7], 'application/font-eot');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
          }
        } else if (filePath.endsWith('.gif')) {
          res.set(____0.strings[7], 'image/gif');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
          }
        } else if (filePath.endsWith('.png')) {
          res.set(____0.strings[7], 'image/png');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
          }
        } else if (filePath.endsWith('.jpg')) {
          res.set(____0.strings[7], 'image/jpg');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
          }
        } else if (filePath.endsWith('.jpeg')) {
          res.set(____0.strings[7], 'image/jpeg');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
          }
        } else if (filePath.endsWith('.ico')) {
          res.set(____0.strings[7], 'image/ico');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
          }
        } else if (filePath.endsWith('.bmp')) {
          res.set(____0.strings[7], 'image/bmp');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
          }
        } else if (filePath.endsWith('.webp')) {
          res.set(____0.strings[7], 'image/webp');
          if (____0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
          }
        }
        res.end(req.content, ____0.getFileEncode(filePath));
      });
    };

    res.txt = (name, _data) => {
      ____0.fsm.getContent(name, (content) => {
        if (!content) {
          return res.status(404).end();
        }
        req.route.content = content;
        if (req.route.encript && req.route.encript === '123') {
          req.route.content = ____0.f1(req.route.content);
        }
        req.data = { ...req.data, ..._data };
        req.route.parser = 'txt';
        let out = ____0.parser(req, res, ____0, req.route).txt(req.route.content);
        res.set(____0.strings[7], 'text/plain');
        res.status(200).end(out);
      });
    };

    res.css = (name, _data) => {
      ____0.fsm.getContent(name, (content) => {
        if (!content) {
          return res.status(404).end();
        }
        req.route.content = content;
        if (req.route.encript && req.route.encript === '123') {
          req.route.content = ____0.f1(req.route.content);
        }
        req.data = { ...req.data, ..._data };
        req.route.parser = 'css';
        let out = ____0.parser(req, res, ____0, req.route).css(req.route.content);
        res.set(____0.strings[7], 'text/css');
        res.status(200).end(out);
      });
    };

    res.js = (name, _data) => {
      ____0.fsm.getContent(name, (content) => {
        if (!content) {
          return res.status(404).end();
        }
        req.route.content = content;
        if (req.route.encript && req.route.encript === '123') {
          req.route.content = ____0.f1(req.route.content);
        }
        req.data = { ...req.data, ..._data };
        req.route.parser = 'js';
        let out = ____0.parser(req, res, ____0, req.route).js(req.route.content);
        res.set(____0.strings[7], 'text/javascript');
        res.status(200).end(out);
      });
    };

    res.jsonFile = (name, _data) => {
      ____0.fsm.getContent(name, (content) => {
        if (!content) {
          return res.status(404).end();
        }
        req.route.content = content;
        if (req.route.encript && req.route.encript === '123') {
          req.route.content = ____0.f1(req.route.content);
        }
        req.data = { ...req.data, ..._data };
        req.route.parser = 'json';
        let out = ____0.parser(req, res, ____0, req.route).html(req.route.content);
        res.set(____0.strings[7], 'application/json');
        res.status(200).end(out);
      });
    };

    res.htmlContent =
      res.send =
      res.sendHTML =
        (text) => {
          if (typeof text === 'string') {
            res.set(____0.strings[7], 'text/html');
            res.status(200).end(text);
          } else {
            res.json(text);
          }
        };
    res.textContent = res.sendTEXT = (text) => {
      if (typeof text === 'string') {
        res.set(____0.strings[7], 'text/plain');
        res.status(200).end(text);
      } else {
        res.json(text);
      }
    };
    res.json = (obj, time) => {
      if (typeof obj === 'string') {
        return res.jsonFile(obj);
      } else {
        res.set(____0.strings[7], 'application/json');
        obj = ____0.toJson(obj);
        res.status(200).ending(time || 0, obj);
        obj = null;
        return res;
      }
    };

    res.redirect = (url, code = 302) => {
      res.set('Location', url);
      res.status(code).end();
    };

    res.setHeader('CharSet', 'UTF-8');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Origin, X-Requested-With, Content-Type, Accept , Access-Token , Authorization');
    res.setHeader('Access-Control-Allow-Methods', req.headers['access-control-request-method'] || 'POST,GET,DELETE,PUT,OPTIONS,VIEW,HEAD,CONNECT,TRACE');
    res.setHeader('Access-Control-Allow-Origin', req.referer || '*');
    if (req.origin) {
      res.setHeader('Access-Control-Allow-Origin', req.origin);
    }

    if (____0.options.www === false && req.host.contains('www')) {
      res.redirect('//' + req.host.replace('www.', '') + req.url, 301);
      return;
    }

    if (!req.urlParser.pathname.like(____0.strings[0])) {
      if (!____0._0_a405) {
        res.status(405);
        res.end();
        return;
      }

      if (!____0._0_ar2_0_) {
        res.set(____0.strings[1], 'true');
        res.status(402);
        if (req.url.like('*api*')) {
          return res.json({
            done: false,
            error: ____0.strings[3],
          });
        } else {
          return res.render(
            ____0.strings[2],
            {
              html: ____0.strings[3],
            },
            {
              parser: ____0.strings[17],
            }
          );
        }
      }
    }

    let findRouteIndex = _0xrrxo.list.findIndex((r) => req.method.toLowerCase().like(r.method.toLowerCase()) && req.urlParser.pathname.like(r.name));
    if (findRouteIndex !== -1) {
      if (!_0xrrxo.list[findRouteIndex].count) {
        _0xrrxo.list[findRouteIndex].count = 0;
      }
      _0xrrxo.list[findRouteIndex].count++;
      if (____0.options.help) {
        res.set('help-request-count', _0xrrxo.list[findRouteIndex].count);
      }

      req.route = _0xrrxo.list[findRouteIndex];

      req.urlParser.arr = req.urlParser.pathname.split('/');
      req.urlParserRaw.arr = req.urlParserRaw.pathname.split('/');

      for (let i = 0; i < req.route.map.length; i++) {
        let map = req.route.map[i];
        if (typeof req.urlParser.arr[map.index] === 'string') {
          try {
            req.params[map.name] = decodeURIComponent(req.urlParser.arr[map.index].replace(/\+/g, ' '));
          } catch (error) {
            req.params[map.name] = req.urlParser.arr[map.index].replace(/\+/g, ' ');
          }
          req.paramsRaw[map.name] = req.urlParserRaw.arr[map.index];
        }
      }

      req.query = req.urlParser.query;
      req.queryRaw = req.urlParserRaw.query;

      if (!req.method.toLowerCase().like('get') && req.headers[____0.strings[18]] && req.headers[____0.strings[18]].match(/urlencoded/i)) {
        req.on('data', function (data) {
          req.bodyRaw += data;
        });
        req.on('end', function () {
          req.dataRaw = req.bodyRaw;
          req.data = req.body = ____0.querystring.parse(req.bodyRaw);
          if (____0.options.session.enabled) {
            ____0.session(req, res, ____0, function (session) {
              req.session = session;
              _0xrrxo.handleRoute(req, res, req.route);
            });
          } else {
            _0xrrxo.handleRoute(req, res, req.route);
          }
        });
      } else if (req.method.contains('post') && req.headers[____0.strings[18]] && req.headers[____0.strings[18]].contains('multipart')) {
        let form = ____0.formidable({
          multiples: !0,
          uploadDir: ____0.options.upload_dir,
        });

        form.parse(req, (err, fields, files) => {
          if (err) {
            ____0.log(err);
          }
          req.form = { err, fields, files };
          req.data = req.body = fields || {};
          req.files = files;
          if (____0.options.session.enabled) {
            ____0.session(req, res, ____0, function (session) {
              req.session = session;
              _0xrrxo.handleRoute(req, res, req.route);
            });
          } else {
            _0xrrxo.handleRoute(req, res, req.route);
          }
        });

        return;
      } else if (!req.method.toLowerCase().like('get') && req.headers[____0.strings[18]] && req.headers[____0.strings[18]].match(/json/i)) {
        req.on('data', function (data) {
          req.bodyRaw += data;
        });
        req.on('end', function () {
          req.dataRaw = req.bodyRaw;
          req.data = req.body = ____0.fromJson(req.bodyRaw);
          if (____0.options.session.enabled) {
            ____0.session(req, res, ____0, function (session) {
              req.session = session;
              _0xrrxo.handleRoute(req, res, req.route);
            });
          } else {
            _0xrrxo.handleRoute(req, res, req.route);
          }
        });
      } else if (!req.method.toLowerCase().like('get')) {
        req.on('data', function (data) {
          req.bodyRaw += data;
        });
        req.on('end', function () {
          req.dataRaw = req.bodyRaw;
          req.data = req.body = ____0.fromJson(req.bodyRaw);
          if (____0.options.session.enabled) {
            ____0.session(req, res, ____0, function (session) {
              req.session = session;
              _0xrrxo.handleRoute(req, res, req.route);
            });
          } else {
            _0xrrxo.handleRoute(req, res, req.route);
          }
        });
      } else {
        req.body = req.data = req.query;
        req.bodyRaw = req.dataRaw = req.queryRaw;

        if (____0.options.session.enabled) {
          ____0.session(req, res, ____0, function (session) {
            req.session = session;
            _0xrrxo.handleRoute(req, res, req.route);
          });
        } else {
          _0xrrxo.handleRoute(req, res, req.route);
        }
        return;
      }

      return;
    } else {
      if (req.urlParser.pathname == '/') {
        if (____0.options.help) {
          res.set('help-eror-message', 'unhandled route root : ' + req.urlParser.pathname);
        }
        res.htmlContent("<h1 align='center'>Base Route / Not Set</h1>");
        return;
      }

      if (____0.options.help) {
        res.set('help-eror-message', 'unhandled route help : ' + req.urlParser.pathname);
      }

      if (req.method.toLowerCase().like('options') || req.method.toLowerCase().like('head')) {
        res.status(200).end();
        return;
      }
      ____0.handleNotRoute(req, res);
    }
  };

  ____0.handleNotRoute = function (req, res) {
    res.set('help-eror-message', 'handleNotRoute() : ' + req.urlParser.pathname);
    res.status(404).end();
  };
  ____0.servers = [];
  ____0.server = null;

  _0xrrxo.start = function (_ports, callback) {
    ____0.startTime = Date.now();

    ____0.https.globalAgent.options = {
      key: ____0.fs.readFileSync(____0.options.https.key || __dirname + '/../ssl/key.pem'),
      cert: ____0.fs.readFileSync(____0.options.https.cert || __dirname + '/../ssl/cert.pem'),
    };

    const ports = [];

    if (ports.length === 0) {
      if (typeof _ports === 'number') {
        ports.some((p0) => p0 == _ports) || ports.push(_ports);
      } else if (Array.isArray(_ports)) {
        _ports.forEach((p) => {
          ports.some((p0) => p0 == p) || ports.push(p);
        });
      }
    }

    if (ports.length === 0) {
      if (typeof ____0.options.port === 'number') {
        ports.some((p0) => p0 == ____0.options.port) || ports.push(____0.options.port);
      } else if (Array.isArray(____0.options.port)) {
        ____0.options.port.forEach((p) => {
          ports.some((p0) => p0 == p) || ports.push(p);
        });
      }
    }

    ports.forEach((p, i) => {
      try {
        if (____0.options.http2) {
          let server = ____0.http2.createServer();
          server.on('error', (err) => console.error(err));
          server.on('stream', (stream, headers) => {
            // _0xrrxo.handleStream(stream , headers , server);
            let path = headers[':path'];
            let method = headers[':method'];
            if (stream.closed) {
              return;
            }
            stream.respond({
              ':status': 200,
            });
            stream.write('isite http2 worked but not implement routes ...');
            stream.end();
          });
          server.listen(p);
        } else {
          let server = ____0.http.createServer(_0xrrxo.handleServer);
          server.maxHeadersCount = 0;
          server.timeout = 1000 * ____0.options.responseTimeout;
          server.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
              console.error('Address in use, Closing Server : ' + p);
              server.close();
            }
          });
          server.listen(p, function () {
            if (!____0.server) {
              ____0.server = server;
              setTimeout(() => {
                if (callback) {
                  callback(____0.servers);
                }
                ____0.call(____0.strings[9]);
              }, 1000 * 5);
            }
            ____0.servers.push(server);
            ____0.log('\n-----------------------------------------');
            ____0.log(` ( ${____0.options.name} ) Running on : http://${____0.options.hostname}:${p} `);
            ____0.log('-----------------------------------------\n');
          });
        }
      } catch (error) {
        console.error(error);
      }
    });

    ____0.options.port = ports;

    if (____0.options.https.enabled) {
      if (typeof ____0.options.https.port === 'number') {
        ____0.options.https.ports = [____0.options.https.port];
      }
      if (Array.isArray(____0.options.https.ports) && ____0.options.https.ports.length > 0) {
        ____0.options.https.ports.forEach((p, i) => {
          let server = ____0.https.createServer(_0xrrxo.handleServer);
          server.maxHeadersCount = 0;
          server.timeout = 1000 * ____0.options.responseTimeout;
          server.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
              console.error('Address in use, Closing Server : ' + p);
              server.close();
            }
          });
          server.listen(p, function () {
            ____0.servers.push(server);
            ____0.log('');
            ____0.log('-----------------------------------------');
            ____0.log('    ' + ____0.options.name + ' [ https ] Running on Port : ' + p);
            ____0.log('-----------------------------------------');
            ____0.log('');
          });
        });
      }
    }

    return ____0.server;
  };

  return _0xrrxo;
};
