module.exports = function init(_r_) {
  _r_.on('big error', () => {
    routing.list = [];
  });

  let routing = function () {};

  routing.list = [];

  routing.endResponse = function (req, res) {
    let route = req.route;

    if (route.empty) {
      if (_r_.options.help) {
        res.set('help-error-message', 'route is empty');
      }
      res.end();
      return;
    }

    if (route.parser.like('*html*') && route.content && route.content.length > 0) {
      req.content = _r_.parser(req, res, _r_, route).html(route.content);
    } else if (route.parser == 'css' && route.content && route.content.length > 0) {
      req.content = _r_.parser(req, res, _r_, route).css(route.content);
    } else if (route.parser == 'js' && route.content && route.content.length > 0) {
      req.content = _r_.parser(req, res, _r_, route).js(route.content);
    } else {
      req.content = route.content;
    }

    if (route.compress) {
      req.content = req.content.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ');
    }

    route.path = route.path || '';
    let encode = _r_.getFileEncode(route.path);

    let hash = req.content ? _r_.md5(req.content) : _r_.md5('');
    let last_modified = new Date().toUTCString();
    if (route.stat) {
      last_modified = new Date(route.stat.mtimeMs).toUTCString();
    }

    if (req.headers['if-none-match'] == hash) {
      if (_r_.options.help) {
        res.set('help-info-message', 'etag matched');
      }
      // res.status(304).end(null);
      // return;
    }

    if (_r_.options.help) {
      res.set('help-info-etag', hash);
    }

    res.set('ETag', hash);

    if (_r_.options.cache.enabled) {
      res.set('Last-Modified', last_modified);
    }

    if (route.path.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.css);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.js);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.html')) {
      res.set('Content-Type', 'text/html');
      if (_r_.options.cache.enabled && route.cache) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.html);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.txt')) {
      res.set('Content-Type', 'text/plain');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.txt);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.json')) {
      res.set('Content-Type', 'application/json');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.json);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.xml')) {
      res.set('Content-Type', 'text/xml')(_r_.options.cache.enabled);
      res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.xml);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.woff2')) {
      res.set('Content-Type', 'application/font-woff2');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.woff')) {
      res.set('Content-Type', 'application/font-woff');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.ttf')) {
      res.set('Content-Type', 'application/font-ttf');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.svg')) {
      res.set('Content-Type', 'application/font-svg');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.otf')) {
      res.set('Content-Type', 'application/font-otf');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.eot')) {
      res.set('Content-Type', 'application/font-eot');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.fonts);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.gif')) {
      res.set('Content-Type', 'image/gif');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.jpg')) {
      res.set('Content-Type', 'image/jpg');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.jpeg')) {
      res.set('Content-Type', 'image/jpeg');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.ico')) {
      res.set('Content-Type', 'image/ico');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.images);

      res.end(req.content, encode);
    } else if (route.path.endsWith('.bmp')) {
      res.set('Content-Type', 'image/bmp');
      if (_r_.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.images);

      res.end(req.content, encode);
    } else {
      res.end(req.content, encode);
    }
  };

  routing.defaultCallback = function (req, res) {
    let route = req.route;

    if (route.cache && route.content) {
      if (_r_.options.help) {
        res.set('help-info-content', 'From Route Memory');
      }

      res.status(200);
      routing.endResponse(req, res);
      return;
    }

    if (route.empty) {
      res.status(404);
      routing.endResponse(req, res);
      return;
    }

    if (!route.path) {
      if (_r_.options.help) {
        res.set('help-info-content', 'Route Not Set File Path');
      }
      res.status(200);
      routing.endResponse(req, res);
      return;
    }

    if (typeof route.path == 'string') {
      _r_.readFile(route.path, function (err, data, file) {
        if (!err) {
          route.content = data.toString('utf8');
          route.stat = file.stat;
          if (route.masterPage) {
            for (var i = 0; i < _r_.masterPages.length; i++) {
              if (route.masterPage == _r_.masterPages[i].name) {
                route.content = _r_.readFileSync(_r_.masterPages[i].header) + route.content + _r_.readFileSync(_r_.masterPages[i].footer);
                break;
              }
            }
          }

          if (_r_.options.help) {
            res.set('help-info-content', 'Route Read File');
          }

          res.status(200);
          routing.endResponse(req, res);
        } else {
          if (_r_.options.help) {
            res.set('help-error', 'Route Error Read File');
          }

          res.status(404);
          route.empty = true;
          routing.endResponse(req, res);
          return;
        }
      });
    } else if (typeof route.path == 'object') {
      _r_.readFiles(route.path, function (err, data) {
        if (!err) {
          if (_r_.options.help) {
            res.set('help-info-content', 'Route Read Files');
          }

          route.content = data.toString('utf8');
          res.status(200);
          route.path = route.path.join('&&');
          routing.endResponse(req, res);
        } else {
          if (_r_.options.help) {
            res.set('help-error', 'Route Error Read Files');
          }

          res.status(404);
          route.empty = true;
          routing.endResponse(req, res);
          return;
        }
      });
    }
  };

  routing.add = function (r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        routing.add(r2, callback);
      });
      return;
    }
    if (r && r.name && Array.isArray(r.name)) {
      r.name.forEach((r2) => {
        let r3 = Object.assign({}, r);
        r3.name = r2;
        routing.get(r3, r.callback);
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
      route.parserDir = _r_.dir;
      route.cache = true;
      route.hide = false;
      route.compress = false;
      route.map = [];
      route.callback = callback || routing.defaultCallback;
      route.require = _r_.options.require;
      route.default = _r_.options.default;
    } else {
      route.name = r.name.toLowerCase();
      route.name0 = r.name;
      route.method = r.method || 'GET';
      route.path = r.path || null;
      route.content = r.content;
      route.parser = r.parser || 'static';
      route.parserDir = r.parserDir || _r_.dir;
      route.masterPage = r.masterPage || null;
      route.cache = r.cache === undefined ? true : r.cache;
      route.hide = r.hide === undefined ? false : r.hide;
      route.compress = r.compress === undefined ? false : r.compress;
      route.map = r.map || [];
      route.callback = callback || r.callback || routing.defaultCallback;

      route.require = r.require || _r_.options.require;
      route.require.features = route.require.features || _r_.options.require.features;
      route.require.permissions = route.require.permissions || _r_.options.require.permissions;

      route.default = r.default || _r_.options.default;
      route.default.features = route.default.features || _r_.options.default.features;
      route.default.permissions = route.default.permissions || _r_.options.default.permissions;
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
          isLower: false,
        });
        if (name !== name0) {
          route.map.push({
            index: i,
            name: name0,
            isLower: true,
          });
        }
      }
    }
    try {
      route.name = arr.join('/');
      if (typeof route.path == 'string' && _r_.fs.lstatSync(route.path).isDirectory()) {
        _r_.fs.readdir(route.path, (err, files) => {
          files.forEach((file) => {
            var r2 = _r_.copy(route);
            if (route.name.endsWith('/')) {
              r2.name = route.name + file;
            } else {
              r2.name = route.name + '/' + file;
            }

            r2.path = route.path + '/' + file;
            r2.is_dynamic = true;
            routing.add(r2);
          });
        });
      } else {
        if (!route.name.startsWith('/')) {
          route.name = '/' + route.name;
        }

        let exist = false;
        routing.list.forEach((rr) => {
          if (rr.name == route.name && rr.method == route.method) {
            exist = true;
          }
        });

        if (!exist) {
          routing.list.push(route);
        } else {
          if (route.name.like('*api/*')) {
            console.log('****** Duplicate API >>> ' + route.name);
          } else {
            console.log('////// Duplicate Route >>> ' + route.name + ' || ' + route.path);
          }
        }
      }
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  routing.get = function (r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        routing.get(r2, callback);
      });
      return;
    }

    let route = {};
    if (typeof r == 'string') {
      route = {
        name: r,
        method: 'GET',
        callback: callback || routing.defaultCallback,
      };
    } else {
      route = r;
      route.callback = route.callback || callback || routing.defaultCallback;
    }
    route.method = 'GET';
    routing.add(route);
  };

  routing.post = function (r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        routing.post(r2, callback);
      });
      return;
    }

    let route =
      typeof r == 'string'
        ? {
            name: r,
            method: 'POST',
            callback: callback || routing.defaultCallback,
          }
        : r;
    route.method = 'POST';
    routing.add(route);
  };

  routing.put = function (r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        routing.put(r2, callback);
      });
      return;
    }
    let route =
      typeof r == 'string'
        ? {
            name: r,
            method: 'PUT',
            callback: callback || routing.defaultCallback,
          }
        : r;
    route.method = 'PUT';
    routing.add(route);
  };

  routing.delete = function (r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        routing.delete(r2, callback);
      });
      return;
    }
    let route =
      typeof r == 'string'
        ? {
            name: r,
            method: 'Delete',
            callback: callback || routing.defaultCallback,
          }
        : r;
    route.method = 'Delete';
    routing.add(route);
  };
  routing.test = function (r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        routing.test(r2, callback);
      });
      return;
    }
    let route =
      typeof r == 'string'
        ? {
            name: r,
            method: 'Test',
            callback: callback || routing.defaultCallback,
          }
        : r;
    route.method = 'Test';
    routing.add(route);
  };
  routing.all = function (r, callback) {
    if (Array.isArray(r)) {
      r.forEach((r2) => {
        routing.add(r2, callback);
      });
      return;
    }
    let route =
      typeof r == 'string'
        ? {
            name: r,
            method: '*',
            callback: callback || routing.defaultCallback,
          }
        : r;
    route.method = '*';
    routing.add(route);
  };

  routing.handleRoute = async function (req, res, route) {
    if (route.require.features.length > 0) {
      let ok = true;
      route.require.features.forEach((feature) => {
        if (!req.hasFeature(feature)) {
          ok = false;
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
      let ok = true;
      route.require.permissions.forEach((permission) => {
        if (!_r_.security.isUserHasPermissions(req, res, permission)) {
          ok = false;
        }
      });
      if (!ok) {
        res.set('require-permissions', route.require.permissions.join(','));
        res.status(401);
        if (route.name.contains('api')) {
          return res.json({
            done: false,
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

  routing.handleServer = async function (req, res) {
    req.obj = {};
    req.query = {};
    req.queryRaw = {};
    req.data = req.body = {};
    req.bodyRaw = '';
    req.params = {};
    req.paramsRaw = {};

    res.code = null;
    req.acceptEncoding = req.headers['accept-encoding'] ? req.headers['accept-encoding'] : '';
    res.ip = req.ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : req.socket.remoteAddress.replace('::ffff:', '');
    res.ip2 = req.ip2 = req.socket.localAddress.replace('::ffff:', '');
    res.port = req.port = req.socket.remotePort;
    res.port2 = req.port2 = req.socket.localPort;
    res.cookies = res.cookie = req.cookies = req.cookie = _r_.cookie(req, res, _r_);

    req.urlRaw = req.url;
    req.urlParserRaw = _r_.url.parse(req.urlRaw, true);
    req.urlParser = _r_.url.parse(req.urlRaw.toLowerCase(), true);

    res.set = function (a, b, c) {
      if (res.writeHeadEnabled === false || res.finished === true || res.headersSent) {
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
    res.writeHeadEnabled = true;
    res.writeHead = (code, obj) => {
      if (res.writeHeadEnabled === false || res.finished === true) {
        return res;
      }
      res.cookie.write();
      res.writeHeadEnabled = false;
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
          res.headers['Content-Type'] &&
          (res.headers['Content-Type'].like('*text/css*') ||
            res.headers['Content-Type'].like('*application/javascript*') ||
            res.headers['Content-Type'].like('*text/html*') ||
            res.headers['Content-Type'].like('*text/plain*') ||
            res.headers['Content-Type'].like('*application/json*'))
        ) {
          if (req.acceptEncoding.match(/\bdeflate\b/) && typeof arg1 === 'string') {
            res.set('Content-Encoding', 'deflate');
            res.set('Vary', 'Accept-Encoding');
            arg1 = _r_.zlib.deflateSync(Buffer.from(arg1));
          } else if (req.acceptEncoding.match(/\bgzip\b/) && typeof arg1 === 'string') {
            res.set('Content-Encoding', 'gzip');
            res.set('Vary', 'Accept-Encoding');
            arg1 = _r_.zlib.gzipSync(Buffer.from(arg1));
          } else {
            // _r_.log(typeof arg1)
          }
        }

        if (res.headers === undefined || res.headers['Content-Type'] === undefined) {
          res.set('Content-Type', 'text/plain');
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
      if (_r_.isFileExistsSync(path)) {
        var stat = _r_.fileStatSync(path);
        if (stat && stat.isFile()) {
          res.writeHead(200, {
            'Content-Type': _r_.getContentType(path),
            'Content-Length': stat.size,
            'Content-Disposition': 'attachment; filename=' + (name || _r_.path.basename(path)),
          });
          var readStream = _r_.fs.createReadStream(path);
          readStream.on('end', function () {
            readStream.close();
          });
          res.on('close', function () {
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
      if (_r_.isFileExistsSync(path)) {
        const stat = _r_.fileStatSync(path);
        if (stat && stat.isFile()) {
          const fileSize = stat.size;
          const range = req.headers.range;
          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            const chunksize = end - start + 1;
            const readStream = _r_.fs.createReadStream(path, {
              start,
              end,
            });
            readStream.on('end', function () {
              readStream.close();
            });
            res.on('close', function () {
              readStream.close();
            });
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': _r_.getContentType(path),
            });
            readStream.pipe(res);
          } else {
            const readStream = _r_.fs.createReadStream(path);
            readStream.on('end', function () {
              readStream.close();
            });
            res.on('close', function () {
              readStream.close();
            });

            res.writeHead(200, {
              'Content-Length': fileSize,
              'Content-Type': _r_.getContentType(path),
              'Content-Disposition': 'attachment; filename=' + (name || _r_.path.basename(path)),
            });
            _r_.fs.createReadStream(path).pipe(res);
          }
        } else {
          res.error();
        }
      } else {
        res.error();
      }
    };

    res.html = res.render = function (name, _data, options) {
      _r_.fsm.getContent(name, (content) => {
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
          req.content = _r_.parser(req, res, _r_, req.route).html(req.content);
        }

        res.status(200);

        if (req.route.compress) {
          req.content = req.content.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ');
        }

        if (name.endsWith('.css')) {
          res.set('Content-Type', 'text/css');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.css);
          }
        } else if (name.endsWith('.js')) {
          res.set('Content-Type', 'application/javascript');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.js);
          }
        } else if (name.endsWith('.html')) {
          res.set('Content-Type', 'text/html');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.html);
          }
        } else if (name.endsWith('.txt')) {
          res.set('Content-Type', 'text/plain');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.txt);
          }
        } else if (name.endsWith('.json')) {
          res.set('Content-Type', 'application/json');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.json);
          }
        } else if (name.endsWith('.xml')) {
          res.set('Content-Type', 'text/xml');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.xml);
          }
        } else if (name.endsWith('.woff2')) {
          res.set('Content-Type', 'application/font-woff2');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.fonts);
          }
        } else if (name.endsWith('.woff')) {
          res.set('Content-Type', 'application/font-woff');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.fonts);
          }
        } else if (name.endsWith('.ttf')) {
          res.set('Content-Type', 'application/font-ttf');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.fonts);
          }
        } else if (name.endsWith('.svg')) {
          res.set('Content-Type', 'application/font-svg');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.fonts);
          }
        } else if (name.endsWith('.otf')) {
          res.set('Content-Type', 'application/font-otf');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.fonts);
          }
        } else if (name.endsWith('.eot')) {
          res.set('Content-Type', 'application/font-eot');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.fonts);
          }
        } else if (name.endsWith('.gif')) {
          res.set('Content-Type', 'image/gif');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.images);
          }
        } else if (name.endsWith('.png')) {
          res.set('Content-Type', 'image/png');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.images);
          }
        } else if (name.endsWith('.jpg')) {
          res.set('Content-Type', 'image/jpg');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.images);
          }
        } else if (name.endsWith('.jpeg')) {
          res.set('Content-Type', 'image/jpeg');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.images);
          }
        } else if (name.endsWith('.ico')) {
          res.set('Content-Type', 'image/ico');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.images);
          }
        } else if (name.endsWith('.bmp')) {
          res.set('Content-Type', 'image/bmp');
          if (_r_.options.cache.enabled && req.route.cache) {
            res.set('Cache-Control', 'public, max-age=' + 60 * _r_.options.cache.images);
          }
        }
        res.end(req.content, _r_.getFileEncode(name));
      });
    };

    res.css = (name) => {
      _r_.fsm.getContent(name, (content) => {
        if (!content) {
          return res.status(404).end();
        }
        req.route.content = content;
        req.data = _data || {};
        req.route.parser = 'css';
        let out = _r_.parser(req, res, _r_, req.route).html(req.route.content);
        res.set('Content-Type', 'text/css');
        res.status(200).end(out);
      });
    };

    res.js = (name) => {
      _r_.fsm.getContent(name, (content) => {
        if (!content) {
          return res.status(404).end();
        }
        req.route.content = content;
        req.data = _data || {};
        req.route.parser = 'js';
        let out = _r_.parser(req, res, _r_, req.route).html(req.route.content);
        res.set('Content-Type', 'text/js');
        res.status(200).end(out);
      });
    };

    res.jsonFile = (name) => {
      _r_.fsm.getContent(name, (content) => {
        if (!content) {
          return res.status(404).end();
        }
        req.route.content = content;
        req.data = _data || {};
        req.route.parser = 'json';
        let out = _r_.parser(req, res, _r_, req.route).html(req.route.content);
        res.set('Content-Type', 'application/json');
        res.status(200).end(out);
      });
    };

    res.htmlContent = res.send = (text) => {
      if (typeof text === 'string') {
        res.set('Content-Type', 'text/html');
        res.status(200).end(text);
      } else {
        res.json(text);
      }
    };

    res.json = (obj, time) => {
      if (typeof obj === 'string') {
        return res.jsonFile(obj);
      } else {
        res.set('Content-Type', 'application/json');
        return res.status(200).ending(_r_.toJson(obj), time || 0);
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

    if (!req.urlParser.pathname.like('*x-api*|*x-css*')) {
      if (!_r_.ready) {
        res.status(405);
        res.end();
        return;
      }

      if (!_r_._is_) {
        res.set('require_payments', 'true');
        res.status(402);
        return res.render(
          'client-side/require_payments.html',
          {
            html: `Require Payments`,
          },
          {
            parser: 'html',
          },
        );
      }
    }

    let matched_routes = routing.list.filter((r) => req.method.toLowerCase().like(r.method.toLowerCase()) && req.urlParser.pathname.like(r.name));
    if (matched_routes.length > 0) {
      let r = matched_routes[0];
      if (!r.count) {
        r.count = 0;
      }
      r.count++;
      if (_r_.options.help) {
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

      if (!req.method.toLowerCase().like('get') && req.headers['content-type'] && req.headers['content-type'].match(/urlencoded/i)) {
        req.on('data', function (data) {
          req.bodyRaw += data;
        });
        req.on('end', function () {
          req.dataRaw = req.bodyRaw;
          req.data = req.body = _r_.querystring.parse(req.bodyRaw);
          if (_r_.options.session.enabled) {
            _r_.session(req, res, _r_, function (session) {
              req.session = session;
              routing.handleRoute(req, res, r);
            });
          } else {
            routing.handleRoute(req, res, r);
          }
        });
      } else if (req.method.toLowerCase().contains('post') && req.headers['content-type'] && req.headers['content-type'].contains('multipart')) {
        let form = new _r_.formidable({
          multiples: true,
          uploadDir: _r_.options.upload_dir,
        });

        form.parse(req, function (err, fields, files) {
          if (err) {
            console.log(err);
          }
          req.files = files;
          if (_r_.options.session.enabled) {
            _r_.session(req, res, _r_, function (session) {
              req.session = session;
              routing.handleRoute(req, res, r);
            });
          } else {
            routing.handleRoute(req, res, r);
          }
        });

        return;
      } else if (!req.method.toLowerCase().like('get') && req.headers['content-type'] && req.headers['content-type'].match(/json/i)) {
        req.on('data', function (data) {
          req.bodyRaw += data;
        });
        req.on('end', function () {
          req.dataRaw = req.bodyRaw;
          req.data = req.body = _r_.fromJson(req.bodyRaw);
          if (_r_.options.session.enabled) {
            _r_.session(req, res, _r_, function (session) {
              req.session = session;
              routing.handleRoute(req, res, r);
            });
          } else {
            routing.handleRoute(req, res, r);
          }
        });
      } else if (!req.method.toLowerCase().like('get')) {
        req.on('data', function (data) {
          req.bodyRaw += data;
        });
        req.on('end', function () {
          req.dataRaw = req.bodyRaw;
          req.data = req.body = _r_.fromJson(req.bodyRaw);
          if (_r_.options.session.enabled) {
            _r_.session(req, res, _r_, function (session) {
              req.session = session;
              routing.handleRoute(req, res, r);
            });
          } else {
            routing.handleRoute(req, res, r);
          }
        });
      } else {
        if (_r_.options.session.enabled) {
          _r_.session(req, res, _r_, function (session) {
            req.session = session;
            routing.handleRoute(req, res, r);
          });
        } else {
          routing.handleRoute(req, res, r);
        }
        return;
      }

      return;
    }

    if (matched_routes.length > 0) {
      return;
    }

    if (req.urlParser.pathname == '/') {
      if (_r_.options.help) {
        res.set('help-eror-message', 'unhandled route ' + req.urlParser.pathname);
      }
      res.htmlContent("<h1 align='center'>Base Route / Not Set</h1>");
      return;
    }

    if (_r_.options.help) {
      res.set('help-eror-message', 'unhandled route ' + req.urlParser.pathname);
    }
    if (req.method.toLowerCase().like('options') || req.method.toLowerCase().like('head')) {
      res.status(200).end();
      return;
    }
    res.set('help-eror-message', 'unhandled route ' + req.urlParser.pathname);
    res.status(404).end();
  };

  _r_.servers = [];
  _r_.server = null;

  routing.start = function (_ports, callback) {
    const ports = [];

    if (_ports && _r_.typeof(_ports) !== 'Array') {
      ports.some((p0) => p0 == _ports) || ports.push(_ports);
    } else if (_ports && _r_.typeof(_ports) == 'Array') {
      _ports.forEach((p) => {
        ports.some((p0) => p0 == p) || ports.push(p);
      });
    }

    if (_r_.options.port && _r_.typeof(_r_.options.port) !== 'Array') {
      ports.some((p0) => p0 == _r_.options.port) || ports.push(_r_.options.port);
    } else if (_r_.options.port && _r_.typeof(_r_.options.port) == 'Array') {
      _r_.options.port.forEach((p) => {
        ports.some((p0) => p0 == p) || ports.push(p);
      });
    }

    _r_.fn.printtt();

    ports.forEach((p, i) => {
      _r_.servers[i] = _r_.http.createServer(routing.handleServer);
      _r_.servers[i].listen(p, function () {
        console.log('');
        console.log('-----------------------------------------');
        console.log('    ' + _r_.options.name + ' Running on Port : ' + p);
        console.log('-----------------------------------------');
        console.log('');
      });
    });

    if (_r_.options.https.enabled) {
      const https_options = {
        key: _r_.fs.readFileSync(_r_.options.https.key || __dirname + '/../ssl/key.pem'),
        cert: _r_.fs.readFileSync(_r_.options.https.cert || __dirname + '/../ssl/cert.pem'),
      };

      _r_.options.https.ports.forEach((p, i) => {
        _r_.servers[i] = _r_.https.createServer(https_options, routing.handleServer);
        _r_.servers[i].listen(p, function () {
          console.log('');
          console.log('-----------------------------------------');
          console.log('    ' + _r_.options.name + ' [ https ] Running on Port : ' + p);
          console.log('-----------------------------------------');
          console.log('');
        });
      });
    }

    _r_.servers.forEach((s) => {
      s.timeout = 1000 * 30;
    });

    _r_.server = _r_.servers[0];

    if (callback) {
      callback(_r_.servers);
    }
    _r_.call('site-started');
    return _r_.server;
  };

  return routing;
};
