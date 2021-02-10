module.exports = function init(___0) {
  ___0.on(___0.strings[4], (_) => {
    if (!_) {
      _0xrrxo.list = [];
    }
  });

  let _0xrrxo = function () {};

  _0xrrxo.list = [];

  _0xrrxo.endResponse = function (req, res) {
    let route = req.route;

    if (route.empty) {
      if (___0.options.help) {
        res.set('help-error-message', 'route is empty');
      }
      res.end();
      return;
    }

    if (route.parser.like('*html*') && route.content && route.content.length > 0) {
      req.content = ___0.parser(req, res, ___0, route).html(route.content);
    } else if (route.parser == 'css' && route.content && route.content.length > 0) {
      req.content = ___0.parser(req, res, ___0, route).css(route.content);
    } else if (route.parser == 'js' && route.content && route.content.length > 0) {
      req.content = ___0.parser(req, res, ___0, route).js(route.content);
    } else {
      req.content = route.content;
    }

    if (route.compress) {
      req.content = req.content.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ');
    }

    route.path = route.path || '';
    let encode = ___0.getFileEncode(route.path);

    let hash = req.content ? ___0.md5(req.content) : ___0.md5('');
    let last_modified = new Date().toUTCString();
    if (route.stat) {
      last_modified = new Date(route.stat.mtimeMs).toUTCString();
    }

    if (req.headers['if-none-match'] == hash) {
      if (___0.options.help) {
        res.set('help-info-message', 'etag matched');
      }
      // res.status(304).end(null);
      // return;
    }

    if (___0.options.help) {
      res.set('help-info-etag', hash);
    }

    res.set('ETag', hash);

    if (___0.options.cache.enabled) {
      res.set('Last-Modified', last_modified);
    }

    if (route.path.endsWith('.css')) {
      res.set(___0.strings[7], 'text/css');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.css);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.js')) {
      res.set(___0.strings[7], 'application/javascript');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.js);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.html')) {
      res.set(___0.strings[7], 'text/html');
      if (___0.options.cache.enabled && route.cache) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.html);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.txt')) {
      res.set(___0.strings[7], 'text/plain');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.txt);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.json')) {
      res.set(___0.strings[7], 'application/json');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.json);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.xml')) {
      res.set(___0.strings[7], 'text/xml')(___0.options.cache.enabled);
      res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.xml);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.woff2')) {
      res.set(___0.strings[7], 'application/font-woff2');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.woff')) {
      res.set(___0.strings[7], 'application/font-woff');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.ttf')) {
      res.set(___0.strings[7], 'application/font-ttf');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.svg')) {
      res.set(___0.strings[7], 'application/font-svg');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.otf')) {
      res.set(___0.strings[7], 'application/font-otf');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.eot')) {
      res.set(___0.strings[7], 'application/font-eot');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.gif')) {
      res.set(___0.strings[7], 'image/gif');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.png')) {
      res.set(___0.strings[7], 'image/png');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.jpg')) {
      res.set(___0.strings[7], 'image/jpg');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.jpeg')) {
      res.set(___0.strings[7], 'image/jpeg');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.ico')) {
      res.set(___0.strings[7], 'image/ico');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.bmp')) {
      res.set(___0.strings[7], 'image/bmp');
      if (___0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.images);

      res.end(req.content, encode);
    } else {
      res.end(req.content, encode);
    }
  };

  _0xrrxo.defaultCallback = function (req, res) {
    let route = req.route;

    if (route.cache && route.content) {
      if (___0.options.help) {
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

    if (!route.path) {
      if (___0.options.help) {
        res.set('help-info-content', 'Route Not Set File Path');
      }
      res.status(200);
      _0xrrxo.endResponse(req, res);
      return;
    }

    if (typeof route.path == 'string') {
      ___0.readFile(route.path, function (err, data, file) {
        if (!err) {
          route.content = data.toString('utf8');
          route.stat = file.stat;
          if (route.masterPage) {
            for (var i = 0; i < ___0.masterPages.length; i++) {
              if (route.masterPage == ___0.masterPages[i].name) {
                route.content = ___0.readFileSync(___0.masterPages[i].header) + route.content + ___0.readFileSync(___0.masterPages[i].footer);
                break;
              }
            }
          }

          if (___0.options.help) {
            res.set('help-info-content', 'Route Read File');
          }

          res.status(200);
          _0xrrxo.endResponse(req, res);
        } else {
          if (___0.options.help) {
            res.set('help-error', 'Route Error Read File');
          }

          res.status(404);
          route.empty = !0;
          _0xrrxo.endResponse(req, res);
          return;
        }
      });
    } else if (typeof route.path == 'object') {
      ___0.readFiles(route.path, function (err, data) {
        if (!err) {
          if (___0.options.help) {
            res.set('help-info-content', 'Route Read Files');
          }

          route.content = data.toString('utf8');
          res.status(200);
          route.path = route.path.join('&&');
          _0xrrxo.endResponse(req, res);
        } else {
          if (___0.options.help) {
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

  _0xrrxo.add = function (r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        _0xrrxo.add(r2, callback);
      });
      return;
    }
    if (r && r.name && Array.isArray(r.name)) {
      r.name.forEach((r2) => {
        let r3 = Object.assign({}, r);
        r3.name = r2;
        _0xrrxo.get(r3, r.callback);
      });
      return;
    }
    let route = {};

    if (typeof r == 'string') {
      route.name = r.toLowerCase();
      route.name0 = r;
      route.method = 'GET';
      route.path = null;
      route.parser = 'static';
      route.parserDir = ___0.dir;
      route.cache = !0;
      route.hide = !1;
      route.compress = !1;
      route.map = [];
      route.callback = callback || _0xrrxo.defaultCallback;
      route.require = ___0.options.require;
      route.default = ___0.options.default;
    } else {
      route.name = r.name.toLowerCase();
      route.name0 = r.name;
      route.method = r.method || 'GET';
      route.path = r.path || null;
      route.content = r.content;
      route.parser = r.parser || 'static';
      route.parserDir = r.parserDir || ___0.dir;
      route.masterPage = r.masterPage || null;
      route.cache = r.cache === undefined ? !0 : r.cache;
      route.hide = r.hide === undefined ? !1 : r.hide;
      route.compress = r.compress === undefined ? !1 : r.compress;
      route.map = r.map || [];
      route.callback = callback || r.callback || _0xrrxo.defaultCallback;

      route.require = r.require || ___0.options.require;
      route.require.features = route.require.features || ___0.options.require.features;
      route.require.permissions = route.require.permissions || ___0.options.require.permissions;

      route.default = r.default || ___0.options.default;
      route.default.features = route.default.features || ___0.options.default.features;
      route.default.permissions = route.default.permissions || ___0.options.default.permissions;
    }

    if (!route.name.startsWith('/')) {
      route.name = '/' + route.name;
      route.name0 = '/' + route.name0;
    }

    route.name = route.name.replace('//', '/');
    route.name0 = route.name0.replace('//', '/');

    let arr = route.name.split('/');
    let arr0 = route.name0.split('/');

    for (var i = 0; i < arr.length; i++) {
      var s = arr[i];
      var s0 = arr0[i];

      if (s.startsWith(':')) {
        arr[i] = '*';
        let name = s.replace(':', '');
        let name0 = s0.replace(':', '');

        route.map.push({
          index: i,
          name: name,
          isLower: !1,
        });
        if (name !== name0) {
          route.map.push({
            index: i,
            name: name0,
            isLower: !0,
          });
        }
      }
    }
    try {
      route.name = arr.join('/');
      if (typeof route.path == 'string' && ___0.fs.lstatSync(route.path).isDirectory()) {
        ___0.fs.readdir(route.path, (err, files) => {
          files.forEach((file) => {
            var r2 = ___0.copy(route);
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

        let exist = !1;
        _0xrrxo.list.forEach((rr) => {
          if (rr.name == route.name && rr.method == route.method) {
            exist = !0;
          }
        });

        if (!exist) {
          _0xrrxo.list.push(route);
        } else {
          if (route.name.like('*api/*')) {
            ___0.log('****** Duplicate API >>> ' + route.name);
          } else {
            ___0.log('////// Duplicate Route >>> ' + route.name + ' || ' + route.path);
          }
        }
      }
    } catch (err) {
      ___0.log(err);
      return null;
    }
  };

  _0xrrxo.get = function (r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        _0xrrxo.get(r2, callback);
      });
      return;
    }

    let route = {};
    if (typeof r == 'string') {
      route = {
        name: r,
        method: 'GET',
        callback: callback || _0xrrxo.defaultCallback,
      };
    } else {
      route = r;
      route.callback = route.callback || callback || _0xrrxo.defaultCallback;
    }
    route.method = 'GET';
    _0xrrxo.add(route);
  };

  _0xrrxo.post = function (r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        _0xrrxo.post(r2, callback);
      });
      return;
    }

    let route =
      typeof r == 'string'
        ? {
            name: r,
            method: 'POST',
            callback: callback || _0xrrxo.defaultCallback,
          }
        : r;
    route.method = 'POST';
    _0xrrxo.add(route);
  };

  _0xrrxo.put = function (r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        _0xrrxo.put(r2, callback);
      });
      return;
    }
    let route =
      typeof r == 'string'
        ? {
            name: r,
            method: 'PUT',
            callback: callback || _0xrrxo.defaultCallback,
          }
        : r;
    route.method = 'PUT';
    _0xrrxo.add(route);
  };

  _0xrrxo.delete = function (r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        _0xrrxo.delete(r2, callback);
      });
      return;
    }
    let route =
      typeof r == 'string'
        ? {
            name: r,
            method: 'Delete',
            callback: callback || _0xrrxo.defaultCallback,
          }
        : r;
    route.method = 'Delete';
    _0xrrxo.add(route);
  };
  _0xrrxo.test = function (r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        _0xrrxo.test(r2, callback);
      });
      return;
    }
    let route =
      typeof r == 'string'
        ? {
            name: r,
            method: 'Test',
            callback: callback || _0xrrxo.defaultCallback,
          }
        : r;
    route.method = 'Test';
    _0xrrxo.add(route);
  };
  _0xrrxo.all = function (r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        _0xrrxo.add(r2, callback);
      });
      return;
    }
    let route =
      typeof r == 'string'
        ? {
            name: r,
            method: '*',
            callback: callback || _0xrrxo.defaultCallback,
          }
        : r;
    route.method = '*';
    _0xrrxo.add(route);
  };

  _0xrrxo.handleRoute = async function (req, res, route) {
    if (route.require.features.length > 0) {
      let ok = !0;
      route.require.features.forEach((feature) => {
        if (!req.hasFeature(feature)) {
          ok = !1;
        }
      });
      if (!ok) {
        res.set('require-feauters', route.require.features.join(','));
        res.status(401);
        return res.render(
          'client-side/require_features.html',
          {
            features: route.require.features.join(','),
            html: `Require Featuers  :   ${route.require.features.join(',')}`,
          },
          {
            parser: 'html',
          },
        );
      }
    }
    if (route.require.permissions.length > 0) {
      let ok = !0;
      route.require.permissions.forEach((permission) => {
        if (!___0.security.isUserHasPermissions(req, res, permission)) {
          ok = !1;
        }
      });
      if (!ok) {
        res.set('require-permissions', route.require.permissions.join(','));
        res.status(401);
        if (route.name.contains('api')) {
          return res.json({
            done: !1,
            error: 'Require Permissions',
            permissions: route.require.permissions,
          });
        } else {
          return res.render(
            'client-side/require_permissions.html',
            {
              permissions: route.require.permissions.join(','),
              html: `Require Permissions  :   ${route.require.permissions.join(',')}`,
            },
            {
              parser: 'html',
            },
          );
        }
      }
    }
    route.callback(req, res);
  };

  _0xrrxo.handleServer = async function (req, res) {
    req.obj = {};
    req.query = {};
    req.queryRaw = {};
    req.data = req.body = {};
    req.bodyRaw = '';
    req.params = {};
    req.paramsRaw = {};

    res.code = null;
    req.acceptEncoding = req.headers[___0.strings[5]] ? req.headers[___0.strings[5]] : '';
    res.ip = req.ip = req.headers[___0.strings[6]] ? req.headers[___0.strings[6]] : req.socket.remoteAddress.replace('::ffff:', '');
    res.ip2 = req.ip2 = req.socket.localAddress.replace('::ffff:', '');
    res.port = req.port = req.socket.remotePort;
    res.port2 = req.port2 = req.socket.localPort;
    res.cookies = res.cookie = req.cookies = req.cookie = ___0.cookie(req, res, ___0);

    req.urlRaw = req.url;
    req.urlParserRaw = ___0.url.parse(req.urlRaw, !0);
    req.urlParser = ___0.url.parse(req.urlRaw.toLowerCase(), !0);

    res.set = function (a, b, c) {
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

    res.ending = (data, time) => {
      if (time === undefined) {
        time = 0;
      }
      setTimeout(function () {
        res.end(data);
      }, time);
    };

    res.end0 = res.end;
    res.end = function (arg1, arg2, arg3, arg4) {
      if (typeof arg1 === 'number') {
        res.writeHead(arg1);
        return res.end0();
      } else {
        if (
          arg1 &&
          res.headers &&
          res.headers[___0.strings[7]] &&
          (res.headers[___0.strings[7]].like('*text/css*') ||
            res.headers[___0.strings[7]].like('*application/javascript*') ||
            res.headers[___0.strings[7]].like('*text/html*') ||
            res.headers[___0.strings[7]].like('*text/plain*') ||
            res.headers[___0.strings[7]].like('*application/json*'))
        ) {
          if (req.acceptEncoding.match(/\bdeflate\b/) && typeof arg1 === 'string') {
            res.set(___0.strings[8], 'deflate');
            res.set('Vary', ___0.strings[5]);
            arg1 = ___0.zlib.deflateSync(Buffer.from(arg1));
          } else if (req.acceptEncoding.match(/\bgzip\b/) && typeof arg1 === 'string') {
            res.set(___0.strings[8], 'gzip');
            res.set('Vary', ___0.strings[5]);
            arg1 = ___0.zlib.gzipSync(Buffer.from(arg1));
          } else {
            // ___0.log(typeof arg1)
          }
        }

        if (res.headers === undefined || res.headers[___0.strings[7]] === undefined) {
          res.set(___0.strings[7], 'text/plain');
        }

        res.writeHead(res.code || res.statusCode || 200);
        arg1 = arg1 || ' ';
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
      if (___0.isFileExistsSync(path)) {
        var stat = ___0.fileStatSync(path);
        if (stat && stat.isFile()) {
          res.writeHead(200, {
            'Content-Type': ___0.getContentType(path),
            'Content-Length': stat.size,
            'Content-Disposition': 'attachment; filename=' + (name || ___0.path.basename(path)),
          });
          var readStream = ___0.fs.createReadStream(path);
          readStream.on('end', function () {
            readStream.close();
          });
          res.on(___0.strings[10], function () {
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
      if (___0.isFileExistsSync(path)) {
        const stat = ___0.fileStatSync(path);
        if (stat && stat.isFile()) {
          const fileSize = stat.size;
          const range = req.headers.range;
          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            const chunksize = end - start + 1;
            const readStream = ___0.fs.createReadStream(path, {
              start,
              end,
            });
            readStream.on('end', function () {
              readStream.close();
            });
            res.on(___0.strings[10], function () {
              readStream.close();
            });
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': ___0.getContentType(path),
            });
            readStream.pipe(res);
          } else {
            const readStream = ___0.fs.createReadStream(path);
            readStream.on('end', function () {
              readStream.close();
            });
            res.on(___0.strings[10], function () {
              readStream.close();
            });

            res.writeHead(200, {
              'Content-Length': fileSize,
              'Content-Type': ___0.getContentType(path),
              'Content-Disposition': 'attachment; filename=' + (name || ___0.path.basename(path)),
            });
            ___0.fs.createReadStream(path).pipe(res);
          }
        } else {
          res.error();
        }
      } else {
        res.error();
      }
    };

    res.html = res.render = function (name, _data, options) {
      ___0.fsm.getContent(name, (content) => {
        if (!content) {
          if (_data && _data.html) {
            return res.status(404).htmlContent(_data.html);
          } else {
            return res.status(404).end();
          }
        }

        options = options || {};
        req.content = content;
        req.data = _data || {};
        req.route = req.route || {};
        req.route.parser = options.parser;
        req.route.compress = options.compress;
        req.route.cache = options.cache;
        if (req.route.parser) {
          req.content = ___0.parser(req, res, ___0, req.route).html(req.content);
        }

        res.status(200);

        if (req.route.compress) {
          req.content = req.content.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ');
        }

        if (name.endsWith('.css')) {
          res.set(___0.strings[7], 'text/css');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.css);
          }
        } else if (name.endsWith('.js')) {
          res.set(___0.strings[7], 'application/javascript');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.js);
          }
        } else if (name.endsWith('.html')) {
          res.set(___0.strings[7], 'text/html');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.html);
          }
        } else if (name.endsWith('.txt')) {
          res.set(___0.strings[7], 'text/plain');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.txt);
          }
        } else if (name.endsWith('.json')) {
          res.set(___0.strings[7], 'application/json');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.json);
          }
        } else if (name.endsWith('.xml')) {
          res.set(___0.strings[7], 'text/xml');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.xml);
          }
        } else if (name.endsWith('.woff2')) {
          res.set(___0.strings[7], 'application/font-woff2');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.fonts);
          }
        } else if (name.endsWith('.woff')) {
          res.set(___0.strings[7], 'application/font-woff');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.fonts);
          }
        } else if (name.endsWith('.ttf')) {
          res.set(___0.strings[7], 'application/font-ttf');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.fonts);
          }
        } else if (name.endsWith('.svg')) {
          res.set(___0.strings[7], 'application/font-svg');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.fonts);
          }
        } else if (name.endsWith('.otf')) {
          res.set(___0.strings[7], 'application/font-otf');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.fonts);
          }
        } else if (name.endsWith('.eot')) {
          res.set(___0.strings[7], 'application/font-eot');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.fonts);
          }
        } else if (name.endsWith('.gif')) {
          res.set(___0.strings[7], 'image/gif');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.images);
          }
        } else if (name.endsWith('.png')) {
          res.set(___0.strings[7], 'image/png');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.images);
          }
        } else if (name.endsWith('.jpg')) {
          res.set(___0.strings[7], 'image/jpg');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.images);
          }
        } else if (name.endsWith('.jpeg')) {
          res.set(___0.strings[7], 'image/jpeg');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.images);
          }
        } else if (name.endsWith('.ico')) {
          res.set(___0.strings[7], 'image/ico');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.images);
          }
        } else if (name.endsWith('.bmp')) {
          res.set(___0.strings[7], 'image/bmp');
          if (___0.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * ___0.options.cache.images);
          }
        }
        res.end(req.content, ___0.getFileEncode(name));
      });
    };

    res.css = (name) => {
      ___0.fsm.getContent(name, (content) => {
        if (!content) {
          return res.status(404).end();
        }
        req.route.content = content;
        req.data = _data || {};
        req.route.parser = 'css';
        let out = ___0.parser(req, res, ___0, req.route).html(req.route.content);
        res.set(___0.strings[7], 'text/css');
        res.status(200).end(out);
      });
    };

    res.js = (name) => {
      ___0.fsm.getContent(name, (content) => {
        if (!content) {
          return res.status(404).end();
        }
        req.route.content = content;
        req.data = _data || {};
        req.route.parser = 'js';
        let out = ___0.parser(req, res, ___0, req.route).html(req.route.content);
        res.set(___0.strings[7], 'text/js');
        res.status(200).end(out);
      });
    };

    res.jsonFile = (name) => {
      ___0.fsm.getContent(name, (content) => {
        if (!content) {
          return res.status(404).end();
        }
        req.route.content = content;
        req.data = _data || {};
        req.route.parser = 'json';
        let out = ___0.parser(req, res, ___0, req.route).html(req.route.content);
        res.set(___0.strings[7], 'application/json');
        res.status(200).end(out);
      });
    };

    res.htmlContent = res.send = (text) => {
      if (typeof text === 'string') {
        res.set(___0.strings[7], 'text/html');
        res.status(200).end(text);
      } else {
        res.json(text);
      }
    };

    res.json = (obj, time) => {
      if (typeof obj === 'string') {
        return res.jsonFile(obj);
      } else {
        res.set(___0.strings[7], 'application/json');
        return res.status(200).ending(___0.toJson(obj), time || 0);
      }
    };

    res.redirect = (url) => {
      res.set('Location', url);
      res.status(302).end();
    };

    res.setHeader('CharSet', 'UTF-8');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,DELETE,PUT,OPTIONS,VIEW,HEAD,CONNECT,TRACE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Origin', req.headers.host || '*');
    if (req.headers.origin) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    }

    if (!req.urlParser.pathname.like(___0.strings[0])) {
      if (!___0._0x13xo) {
        res.status(405);
        res.end();
        return;
      }

      if (!___0._0x112xo) {
        res.set(___0.strings[1], 'true');
        res.status(402);
        if (req.url.like('*api')) {
          return res.json({
            done: false,
            error: ___0.strings[3],
          });
        } else {
          return res.render(
            ___0.strings[2],
            {
              html: ___0.strings[3],
            },
            {
              parser: 'html',
            },
          );
        }
      }
    }

    let matched_routes = _0xrrxo.list.filter((r) => req.method.toLowerCase().like(r.method.toLowerCase()) && req.urlParser.pathname.like(r.name));
    if (matched_routes.length > 0) {
      let r = matched_routes[0];
      if (!r.count) {
        r.count = 0;
      }
      r.count++;
      if (___0.options.help) {
        res.set('help-request-count', r.count);
      }

      req.route = r;

      req.urlParser.arr = req.urlParser.pathname.split('/');
      req.urlParserRaw.arr = req.urlParserRaw.pathname.split('/');

      for (let i = 0; i < req.route.map.length; i++) {
        let map = req.route.map[i];
        req.params[map.name] = req.urlParser.arr[map.index];
        req.paramsRaw[map.name] = req.urlParserRaw.arr[map.index];
      }

      req.query = req.urlParser.query;
      req.queryRaw = req.urlParserRaw.query;

      if (!req.method.toLowerCase().like('get') && req.headers[___0.strings[7]] && req.headers[___0.strings[7]].match(/urlencoded/i)) {
        req.on('data', function (data) {
          req.bodyRaw += data;
        });
        req.on('end', function () {
          req.dataRaw = req.bodyRaw;
          req.data = req.body = ___0.querystring.parse(req.bodyRaw);
          if (___0.options.session.enabled) {
            ___0.session(req, res, ___0, function (session) {
              req.session = session;
              _0xrrxo.handleRoute(req, res, r);
            });
          } else {
            _0xrrxo.handleRoute(req, res, r);
          }
        });
      } else if (req.method.toLowerCase().contains('post') && req.headers[___0.strings[7]] && req.headers[___0.strings[7]].contains('multipart')) {
        let form = new ___0.formidable({
          multiples: !0,
          uploadDir: ___0.options.upload_dir,
        });

        form.parse(req, function (err, fields, files) {
          if (err) {
            ___0.log(err);
          }
          req.files = files;
          if (___0.options.session.enabled) {
            ___0.session(req, res, ___0, function (session) {
              req.session = session;
              _0xrrxo.handleRoute(req, res, r);
            });
          } else {
            _0xrrxo.handleRoute(req, res, r);
          }
        });

        return;
      } else if (!req.method.toLowerCase().like('get') && req.headers[___0.strings[7]] && req.headers[___0.strings[7]].match(/json/i)) {
        req.on('data', function (data) {
          req.bodyRaw += data;
        });
        req.on('end', function () {
          req.dataRaw = req.bodyRaw;
          req.data = req.body = ___0.fromJson(req.bodyRaw);
          if (___0.options.session.enabled) {
            ___0.session(req, res, ___0, function (session) {
              req.session = session;
              _0xrrxo.handleRoute(req, res, r);
            });
          } else {
            _0xrrxo.handleRoute(req, res, r);
          }
        });
      } else if (!req.method.toLowerCase().like('get')) {
        req.on('data', function (data) {
          req.bodyRaw += data;
        });
        req.on('end', function () {
          req.dataRaw = req.bodyRaw;
          req.data = req.body = ___0.fromJson(req.bodyRaw);
          if (___0.options.session.enabled) {
            ___0.session(req, res, ___0, function (session) {
              req.session = session;
              _0xrrxo.handleRoute(req, res, r);
            });
          } else {
            _0xrrxo.handleRoute(req, res, r);
          }
        });
      } else {
        if (___0.options.session.enabled) {
          ___0.session(req, res, ___0, function (session) {
            req.session = session;
            _0xrrxo.handleRoute(req, res, r);
          });
        } else {
          _0xrrxo.handleRoute(req, res, r);
        }
        return;
      }

      return;
    }

    if (matched_routes.length > 0) {
      return;
    }

    if (req.urlParser.pathname == '/') {
      if (___0.options.help) {
        res.set('help-eror-message', 'unhandled route ' + req.urlParser.pathname);
      }
      res.htmlContent("<h1 align='center'>Base Route / Not Set</h1>");
      return;
    }

    if (___0.options.help) {
      res.set('help-eror-message', 'unhandled route ' + req.urlParser.pathname);
    }
    if (req.method.toLowerCase().like('options') || req.method.toLowerCase().like('head')) {
      res.status(200).end();
      return;
    }
    res.set('help-eror-message', 'unhandled route ' + req.urlParser.pathname);
    res.status(404).end();
  };

  ___0.servers = [];
  ___0.server = null;

  _0xrrxo.start = function (_ports, callback) {
    const ports = [];

    if (_ports && ___0.typeof(_ports) !== 'Array') {
      ports.some((p0) => p0 == _ports) || ports.push(_ports);
    } else if (_ports && ___0.typeof(_ports) == 'Array') {
      _ports.forEach((p) => {
        ports.some((p0) => p0 == p) || ports.push(p);
      });
    }

    if (___0.options.port && ___0.typeof(___0.options.port) !== 'Array') {
      ports.some((p0) => p0 == ___0.options.port) || ports.push(___0.options.port);
    } else if (___0.options.port && ___0.typeof(___0.options.port) == 'Array') {
      ___0.options.port.forEach((p) => {
        ports.some((p0) => p0 == p) || ports.push(p);
      });
    }

    ___0.fn._0xpttxo();

    ports.forEach((p, i) => {
      let index = ___0.servers.length
      ___0.servers[index] = ___0.http.createServer(_0xrrxo.handleServer);
      ___0.servers[index].listen(p, function () {
        ___0.log('');
        ___0.log('-----------------------------------------');
        ___0.log('    ' + ___0.options.name + ' Running on Port : ' + p);
        ___0.log('-----------------------------------------');
        ___0.log('');
      });
    });

    if (___0.options.https.enabled) {
      const https_options = {
        key: ___0.fs.readFileSync(___0.options.https.key || __dirname + '/../ssl/key.pem'),
        cert: ___0.fs.readFileSync(___0.options.https.cert || __dirname + '/../ssl/cert.pem'),
      };

      ___0.options.https.ports.forEach((p, i) => {
        let index = ___0.servers.length
        ___0.servers[index] = ___0.https.createServer(https_options, _0xrrxo.handleServer);
        ___0.servers[index].listen(p, function () {
          ___0.log('');
          ___0.log('-----------------------------------------');
          ___0.log('    ' + ___0.options.name + ' [ https ] Running on Port : ' + p);
          ___0.log('-----------------------------------------');
          ___0.log('');
        });
      });
    }

    ___0.servers.forEach((s) => {
      s.timeout = 1000 * 30;
    });

    ___0.server = ___0.servers[0];

    if (callback) {
      callback(___0.servers);
    }
    ___0.call(___0.strings[9]);
    return ___0.server;
  };

  return _0xrrxo;
};
