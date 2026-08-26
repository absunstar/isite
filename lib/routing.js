module.exports = function init(____0) {
    ____0.on(____0.strings[4], (_) => {
        if (!_) {
            _0xrrxo.list = _0xrrxo.list.filter((r) => r.name.like('*x-api*')); _0xrrxo.invalidateIndex();
        }
    });

    let _0xrrxo = function () {};

    _0xrrxo.list = [];
    _0xrrxo._indexDirty = true;
    _0xrrxo._exactByMethod = new Map();
    _0xrrxo._dynamicByMethod = new Map();
    _0xrrxo.invalidateIndex = function () { _0xrrxo._indexDirty = true; };
    _0xrrxo._compilePattern = function (pattern) {
        const source = '^' + String(pattern).split('*').map((part) => ____0.escapeRegExp(part)).join('.*') + '$';
        return new RegExp(source, 'iu');
    };
    _0xrrxo.rebuildIndex = function () {
        _0xrrxo._exactByMethod.clear();
        _0xrrxo._dynamicByMethod.clear();
        _0xrrxo.list.forEach((route, order) => {
            route.$order = order;
            const methods = String(route.method || 'GET').split('|').map((m) => m.trim().toUpperCase()).filter(Boolean);
            route.$matcher = route.name.includes('*') ? _0xrrxo._compilePattern(route.name) : null;
            for (const method of methods) {
                if (method.includes('*')) continue;
                if (route.$matcher) {
                    let arr = _0xrrxo._dynamicByMethod.get(method);
                    if (!arr) _0xrrxo._dynamicByMethod.set(method, (arr = []));
                    arr.push(route);
                } else {
                    let map = _0xrrxo._exactByMethod.get(method);
                    if (!map) _0xrrxo._exactByMethod.set(method, (map = new Map()));
                    if (!map.has(route.name)) map.set(route.name, route);
                }
            }
        });
        _0xrrxo._indexDirty = false;
    };
    _0xrrxo.findRoute = function (pathname, method) {
        if (_0xrrxo._indexDirty) _0xrrxo.rebuildIndex();
        const m = String(method || 'GET').toUpperCase();
        const exact = _0xrrxo._exactByMethod.get(m)?.get(pathname);
        let dynamic = null;
        const list = _0xrrxo._dynamicByMethod.get(m) || [];
        for (const route of list) {
            if (route.$matcher.test(pathname)) { dynamic = route; break; }
        }
        if (exact && dynamic) return exact.$order <= dynamic.$order ? exact : dynamic;
        if (exact || dynamic) return exact || dynamic;
        // Compatibility fallback for unusual method wildcard patterns.
        for (const route of _0xrrxo.list) {
            if (pathname.like(route.name) && m.like(route.method)) return route;
        }
        return null;
    };

    _0xrrxo.isCompressibleContentType = function (contentType) {
        contentType = String(contentType || '').toLowerCase();
        return contentType.includes('text/css') || contentType.includes('javascript') || contentType.includes('text/html') ||
            contentType.includes('text/plain') || contentType.includes('application/json') || contentType.includes('application/xml') ||
            contentType.includes('text/xml') || contentType.includes('image/svg+xml');
    };
    _0xrrxo.selectCompression = function (acceptEncoding) {
        const accept = String(acceptEncoding || '').toLowerCase();
        if (accept.includes('br') && ____0.zlib.brotliCompress) return { encoding: 'br', fn: ____0.zlib.brotliCompress };
        if (accept.includes('gzip')) return { encoding: 'gzip', fn: ____0.zlib.gzip };
        if (accept.includes('deflate')) return { encoding: 'deflate', fn: ____0.zlib.deflate };
        return null;
    };
    _0xrrxo.compress = function (content, contentType, acceptEncoding, callback) {
        if (typeof content !== 'string' || Buffer.byteLength(content) < 1024 || !_0xrrxo.isCompressibleContentType(contentType)) {
            callback(null, content, null);
            return;
        }
        const selected = _0xrrxo.selectCompression(acceptEncoding);
        if (!selected) {
            callback(null, content, null);
            return;
        }
        selected.fn(Buffer.from(content), function (err, compressed) {
            if (err) callback(err, content, null);
            else callback(null, compressed, selected.encoding);
        });
    };

    _0xrrxo.endResponse = function (req, res) {
        let route = req.route;

        if (route.contentError) {
            if (____0.options.help) {
                res.set('help-error-message', route.contentError);
            }
            res.end();
            return;
        }

        if (req.route.encript == '123' && req.content) {
            req.content = ____0.f1(req.content);
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

        if (true) {
            if (route.path.endsWith('.css')) {
                res.set(____0.strings[7], 'text/css');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.css);
                }
            } else if (route.path.endsWith('.js')) {
                res.set(____0.strings[7], 'application/javascript');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.js);
                }
            } else if (route.path.endsWith('.html')) {
                res.set(____0.strings[7], 'text/html');
                if (____0.options.cache.enabled && route.cache) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.html);
                }
            } else if (route.path.endsWith('.txt')) {
                res.set(____0.strings[7], 'text/plain');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.txt);
                }
            } else if (route.path.endsWith('.json')) {
                res.set(____0.strings[7], 'application/json');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.json);
                }
            } else if (route.path.endsWith('.xml')) {
                res.set(____0.strings[7], 'text/xml');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.xml);
                }
            } else if (route.path.endsWith('.woff2')) {
                res.set(____0.strings[7], 'application/font-woff2');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                }
            } else if (route.path.endsWith('.woff')) {
                res.set(____0.strings[7], 'application/font-woff');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                }
            } else if (route.path.endsWith('.ttf')) {
                res.set(____0.strings[7], 'application/font-ttf');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                }
            } else if (route.path.endsWith('.otf')) {
                res.set(____0.strings[7], 'application/font-otf');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                }
            } else if (route.path.endsWith('.eot')) {
                res.set(____0.strings[7], 'application/font-eot');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                }
            } else if (route.path.endsWith('.gif')) {
                res.set(____0.strings[7], 'image/gif');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                }
            } else if (route.path.endsWith('.png')) {
                res.set(____0.strings[7], 'image/png');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                }
            } else if (route.path.endsWith('.jpg')) {
                res.set(____0.strings[7], 'image/jpg');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                }
            } else if (route.path.endsWith('.jpeg')) {
                res.set(____0.strings[7], 'image/jpeg');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                }
            } else if (route.path.endsWith('.ico')) {
                res.set(____0.strings[7], 'image/ico');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                }
            } else if (route.path.endsWith('.bmp')) {
                res.set(____0.strings[7], 'image/bmp');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                }
            } else if (route.path.endsWith('.webp')) {
                res.set(____0.strings[7], 'image/webp');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                }
            } else if (route.path.endsWith('.svg')) {
                res.set(____0.strings[7], 'image/svg+xml');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                }
            }else if (route.path.endsWith('.mp4')) {
                res.set(____0.strings[7], 'video/mp4');
                if (____0.options.cache.enabled) {
                    res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.videos);
                }
            }
        }

        let response = {
            host: req.host,
            url: req.url,
            filePath: route.path,
            content: req.content,
            encode: ____0.getFileEncode(route.path),
            headers: res.headers,
            code: res.code,
        };

        if (route.shared) ____0.setShared(response);

        if (typeof response.content == 'object') {
            res.json(response.content);
        } else {
            res.end(response.content, response.encode);
        }
    };

    _0xrrxo.defaultCallback = function (req, res) {
        let route = req.route;

        if (route.contentError) {
            res.status(404);
            if (____0.options.help) {
                res.set('help-info-content', route.contentError);
            }

            _0xrrxo.endResponse(req, res);
            return;
        }

        if ((response = ____0.getShared(req.host, route.path, req.url))) {
            res.headers = response.headers;
            res.code = response.code;
            for (const key in response.headers) {
                if (Object.prototype.hasOwnProperty.call(response.headers, key)) {
                    if (key !== 'x-shared') {
                        res.set(key, response.headers[key]);
                    }
                }
            }
            res.set('x-shared', '-host=' + req.host + ' -port=' + ____0.options.port + ' -count=' + req.route.count + ' -time=' + new Date().getTime());
            return res.end(response.content, response.encode);
        }

        if (route.cache && route.content) {
            if (____0.options.help) {
                res.set('help-info-content', 'From Route Memory');
            }

            res.status(200);
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
                    route.contentError = err.message;
                    _0xrrxo.endResponse(req, res);
                    return;
                }
            });
        } else if (Array.isArray(route.path)) {
            ____0.readFiles(route.path, function (err, data) {
                if (!err) {
                    if (____0.options.help) {
                        res.set('help-info-content', 'Route Read Files');
                    }

                    route.content = data.toString('utf8');

                    res.status(200);
                    route.path = route.path.join('&&');
                    _0xrrxo.endResponse(req, res);
                } else {
                    if (____0.options.help) {
                        res.set('help-error', 'Route Error Read Files');
                    }

                    res.status(404);
                    route.contentError = err.message;
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
                ____0.log('No CallBack set For : ', r);
                res.end();
            };
        if (typeof r === 'string') {
            r = {
                name: r,
                method: req.method,
            };
        }

        let routeIndex = _0xrrxo.list.findIndex((rr) => (rr.name == r.name || rr.nameRaw == r.name) && rr.method == r.method);
        if (routeIndex !== -1) {
            req.route = _0xrrxo.list[routeIndex];
            req.route.count++;
            req.route.callback(req, res);
        } else {
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
                _0xrrxo.list.splice(i, 1); _0xrrxo.invalidateIndex();
                ____0.fsm.off(oldRoute.path);
            } else if (r.name && r.method && oldRoute.nameRaw.like(r.name) && oldRoute.method.like(r.method)) {
                _0xrrxo.list.splice(i, 1); _0xrrxo.invalidateIndex();
                ____0.fsm.off(oldRoute.path);
            } else if (r.name && oldRoute.name.like(r.name)) {
                _0xrrxo.list.splice(i, 1); _0xrrxo.invalidateIndex();
                ____0.fsm.off('*' + oldRoute.name.replace('/', '') + '*');
                ____0.fsm.off(oldRoute.path);
            } else if (r.name && oldRoute.nameRaw.like(r.name)) {
                _0xrrxo.list.splice(i, 1); _0xrrxo.invalidateIndex();
                ____0.fsm.off('*' + oldRoute.name.replace('/', '') + '*');
                ____0.fsm.off(oldRoute.path);
            } else if (r.method && oldRoute.method.like(r.method)) {
                _0xrrxo.list.splice(i, 1); _0xrrxo.invalidateIndex();
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
            route.count = 0;
            route.cache = !0;
            route.hide = !1;
            route.compress = !1;
            route.encript = !1;
            route.shared = !1;
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
            route.count = r.count || 0;
            route.hide = r.hide ?? !1;
            route.compress = r.compress ?? !1;
            route.encript = r.encript ?? !1;
            route.shared = r.shared ?? !1;
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

        route.ipList = []; // compatibility only
        route.ipMap = new Map();
        route.limitWindowMs = route.limitWindowMs || r.limitWindowMs || 60000;

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
            if (typeof route.path == 'string' && ____0.fs.statSync(route.path).isDirectory()) {
                ____0.fs.readdirSync(route.path).forEach((file) => {
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
            } else {
                if (!route.name.startsWith('/')) {
                    route.name = '/' + route.name;
                }

                route.name = encodeURI(route.name);
                let index = _0xrrxo.list.findIndex((rr) => rr.name == route.name && rr.method.like(route.method));
                if (index === -1) {
                    _0xrrxo.list.push(route); _0xrrxo.invalidateIndex();
                } else if (!route.overwrite) {
                    if (route.name.like('*api/*')) {
                        ____0.log('[ Duplicate API ]  ' + route.name);
                    } else {
                        ____0.log('[ Duplicate Route ]  ' + route.name);
                    }
                } else {
                    _0xrrxo.list[index] = route; _0xrrxo.invalidateIndex();
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
        if (route.language) {
            req.session.language = { ...route.language };
        }

        if (route.lang) {
            req.session.language.id = route.lang;
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
                            },
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
                                },
                            );
                        }
                    }
                }
            }
        }

        route.callback(req, res);
    };

    ____0.validateServerRequest = async function (req, res, next) {
        next(req, res);
    };

    ____0.validateRequest = async function (req, res, next) {
        next(req, res);
    };
    ____0.validateRoute = async function (req, res, next) {
        next(req, res);
    };

    ____0.validateSession = async function (req, res, next) {
        next(req, res);
    };

    _0xrrxo.handleServer = async function (req, res) {
        // v4: enter one AsyncLocalStorage context per request without changing
        // the legacy handler/callback contract. The guarded re-entry keeps the
        // rest of this mature function untouched.
        if (____0.context && !req.$isiteContextEntered) {
            req.$isiteContextEntered = true;
            const context = ____0.context.create({ type: 'http', method: req.method, url: req.url });
            req.context = context;
            return ____0.context.run(context, () => _0xrrxo.handleServer(req, res));
        }
        ____0.validateServerRequest(req, res, (req, res) => {
            if (____0.diagnostics) ____0.diagnostics.requestStart(req, res);
            req.host = req.headers['host'] || '';
            req.origin = req.headers['origin'] || '';
            req.referer = req.headers['referer'] || '';
            req.title = req.url.replace('/', '').split('/').join(' - ') || '';
            req.domain = '';
            req.subDomain = '';
            req.obj = {};
            req.query = {};
            req.queryRaw = {};
            req.data = req.body = {};
            req.bodyRaw = '';
            req.bodyBytes = 0;
            req.maxBodyBytes = (____0.options.request && ____0.options.request.maxBodyBytes) || 10 * 1024 * 1024;
            req.appendBody = function (data) {
                if (req.bodyTooLarge) return false;
                req.bodyBytes += Buffer.byteLength(data);
                if (req.bodyBytes > req.maxBodyBytes) {
                    req.bodyTooLarge = true;
                    res.status(413).json({ error: 'Request body too large' });
                    return false;
                }
                req.bodyRaw += data;
                return true;
            };
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
                req.features = req.features.filter((f) => !f.like(name));
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
                    const w2 = w.hostList.find((h) => req.host.like(h.name));
                    if (w2) {
                        return w2[req.session.language.id] || name;
                    }
                }
                return w[req.session.language.id] || name;
            };

            res.code = null;
            req.remoteAddress = req.socket?.remoteAddress || '';
            req.acceptEncoding = req.headers[____0.strings[5]] ? req.headers[____0.strings[5]] : '';
            res.ip = req.ip = req.headers[____0.strings[6]] ? req.headers[____0.strings[6]] : req.remoteAddress?.replace('::ffff:', '');
            if (req.ip == '::1') {
                req.ip = '127.0.0.1';
            }
            res.ip2 = req.ip2 = req.socket?.localAddress.replace('::ffff:', '');
            res.port = req.port = req.socket?.remotePort;
            res.port2 = req.port2 = req.socket?.localPort;
            res.cookies = res.cookie = req.cookies = req.cookie = ____0.cookie(req, res, ____0);

            req.urlRaw = req.url;
            req.urlParserRaw = ____0.newURL(req.urlRaw);
            req.urlParser = ____0.newURL(req.urlRaw.toLowerCase());

            for (const key in req.urlParser.query) {
                req.urlParser.query[key.toLowerCase()] = req.urlParser.query[key];
            }
            for (const key in req.urlParserRaw.query) {
                req.urlParserRaw.query[key.toLowerCase()] = req.urlParserRaw.query[key];
            }

            res.set = (a, b, c) => {
                if (res.writeHeadEnabled === !1 || res.finished === !0 || res.headersSent) {
                    return res;
                }

                if (typeof b == 'string') {
                    if (a == ____0.strings[7] && !b.contains('charset=utf-8')) {
                        b += '; charset=utf-8';
                    }
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
                        res.set(____0.strings[7], 'text/html');
                    }

                    const contentType = res.headers && res.headers[____0.strings[7]];
                    const finish = function (body) {
                        res.writeHead(res.code || res.statusCode || 200);
                        if (____0.diagnostics) ____0.diagnostics.requestEnd(req, res);
                        return res.end0(body || ' ', arg2, arg3, arg4);
                    };

                    res.ended = true;
                    _0xrrxo.compress(arg1, contentType, req.acceptEncoding, function (_err, body, encoding) {
                        if (encoding) {
                            res.set(____0.strings[8], encoding);
                            res.set('Vary', ____0.strings[5]);
                            delete res.headers['Content-Length'];
                            delete res.headers['content-length'];
                        }
                        finish(body);
                    });
                    return res;
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

            // v4: streaming download helper with validators. The public
            // download/download2 signatures are unchanged.
            const sendDownload = (path, name, attachment = true) => {
                if (!____0.isFileExistsSync(path)) return res.error();
                const stat = ____0.fileStatSync(path);
                if (!stat || !stat.isFile()) return res.error();

                const fileSize = stat.size;
                const lastModified = stat.mtime ? stat.mtime.toUTCString() : undefined;
                // Metadata-based ETag avoids reading the entire file just to validate cache.
                const etag = `W/"${Number(stat.size).toString(16)}-${Math.trunc(stat.mtimeMs || 0).toString(16)}"`;
                const commonHeaders = {
                    'Accept-Ranges': 'bytes',
                    'Content-Type': ____0.getContentType(path),
                    'ETag': etag,
                };
                if (lastModified) commonHeaders['Last-Modified'] = lastModified;
                if (attachment) commonHeaders['Content-Disposition'] = 'attachment; filename=' + (name || ____0.path.basename(path));

                const endDirect = () => {
                    if (____0.diagnostics) ____0.diagnostics.requestEnd(req, res);
                    return res.end0();
                };

                if (____0.httpCache && ____0.httpCache.isFresh(req, etag, stat.mtime)) {
                    res.writeHead(304, commonHeaders);
                    return endDirect();
                }

                let rangeHeader = req.headers.range;
                // RFC 7233 If-Range: on mismatch, send the whole representation.
                const ifRange = req.headers['if-range'];
                if (rangeHeader && ifRange) {
                    const ifRangeDate = Date.parse(ifRange);
                    const matches = ifRange === etag || (Number.isFinite(ifRangeDate) && stat.mtime && stat.mtime.getTime() <= ifRangeDate);
                    if (!matches) rangeHeader = null;
                }

                let streamOptions;
                let status = 200;
                const headers = { ...commonHeaders };
                if (rangeHeader) {
                    const parsedRange = ____0.httpCache ? ____0.httpCache.range(rangeHeader, fileSize) : null;
                    if (!parsedRange || parsedRange.unsatisfiable) {
                        res.writeHead(416, { ...commonHeaders, 'Content-Range': `bytes */${fileSize}` });
                        return endDirect();
                    }
                    status = 206;
                    streamOptions = { start: parsedRange.start, end: parsedRange.end };
                    headers['Content-Range'] = `bytes ${parsedRange.start}-${parsedRange.end}/${fileSize}`;
                    headers['Content-Length'] = parsedRange.length;
                } else {
                    headers['Content-Length'] = fileSize;
                }

                res.writeHead(status, headers);
                const readStream = ____0.fs.createReadStream(path, streamOptions);
                let closed = false;
                const close = () => {
                    if (closed) return;
                    closed = true;
                    if (!readStream.destroyed) readStream.destroy();
                };
                readStream.once('error', (err) => {
                    close();
                    if (!res.headersSent) res.error(500);
                    else if (!res.destroyed) res.destroy(err);
                });
                res.once(____0.strings[10], close);
                readStream.once('end', endDirect);
                // Bypass the framework's body-compressing res.end wrapper for a
                // raw file stream; otherwise pipe() would invoke it after headers
                // are already committed.
                readStream.pipe(res, { end: false });
                return res;
            };

            res.download2 = (path, name) => sendDownload(path, name, true);
            res.download = (path, name) => sendDownload(path, name, true);

            res.html = res.render = function (file, _data = null, options = {}) {
                let filePath = '';
                if (typeof file === 'object') {
                    filePath = file.path;
                    options = { ...options, ...file };
                } else {
                    filePath = file;
                }

                if ((response = ____0.getShared(req.host, filePath, req.url))) {
                    res.headers = response.headers;
                    res.code = response.code;

                    for (const key in response.headers) {
                        if (Object.prototype.hasOwnProperty.call(response.headers, key)) {
                            if (key !== 'x-shared') {
                                res.set(key, response.headers[key]);
                            }
                        }
                    }
                    res.set('x-shared', '-host=' + req.host + ' -port=' + ____0.options.port + ' -count=' + req.route.count + ' -time=' + new Date().getTime());
                    return res.end(response.content, response.encode);
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
                    let route = { ...req.route, ...options };

                    if (route.encript == '123') {
                        req.content = ____0.f1(req.content);
                    }

                    if (route.parser) {
                        req.content = ____0.parser(req, res, ____0, route).html(req.content);
                    }

                    if (route.compress) {
                        req.content = req.content.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ');
                    }

                    res.status(options.code || 200);
                    if (filePath.endsWith('.css')) {
                        res.set(____0.strings[7], 'text/css');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.css);
                        }
                    } else if (filePath.endsWith('.js')) {
                        res.set(____0.strings[7], 'application/javascript');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.js);
                        }
                    } else if (filePath.endsWith('.html')) {
                        res.set(____0.strings[7], 'text/html');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.html);
                        }
                    } else if (filePath.endsWith('.txt')) {
                        res.set(____0.strings[7], 'text/plain');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.txt);
                        }
                    } else if (filePath.endsWith('.json')) {
                        res.set(____0.strings[7], 'application/json');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.json);
                        }
                    } else if (filePath.endsWith('.xml')) {
                        res.set(____0.strings[7], 'text/xml');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.xml);
                        }
                    } else if (filePath.endsWith('.woff2')) {
                        res.set(____0.strings[7], 'application/font-woff2');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                        }
                    } else if (filePath.endsWith('.woff')) {
                        res.set(____0.strings[7], 'application/font-woff');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                        }
                    } else if (filePath.endsWith('.ttf')) {
                        res.set(____0.strings[7], 'application/font-ttf');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                        }
                    } else if (filePath.endsWith('.svg')) {
                        res.set(____0.strings[7], 'application/font-svg');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                        }
                    } else if (filePath.endsWith('.otf')) {
                        res.set(____0.strings[7], 'application/font-otf');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                        }
                    } else if (filePath.endsWith('.eot')) {
                        res.set(____0.strings[7], 'application/font-eot');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                        }
                    } else if (filePath.endsWith('.gif')) {
                        res.set(____0.strings[7], 'image/gif');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                        }
                    } else if (filePath.endsWith('.png')) {
                        res.set(____0.strings[7], 'image/png');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                        }
                    } else if (filePath.endsWith('.jpg')) {
                        res.set(____0.strings[7], 'image/jpg');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                        }
                    } else if (filePath.endsWith('.jpeg')) {
                        res.set(____0.strings[7], 'image/jpeg');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                        }
                    } else if (filePath.endsWith('.ico')) {
                        res.set(____0.strings[7], 'image/ico');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                        }
                    } else if (filePath.endsWith('.bmp')) {
                        res.set(____0.strings[7], 'image/bmp');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                        }
                    } else if (filePath.endsWith('.webp')) {
                        res.set(____0.strings[7], 'image/webp');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                        }
                    }else if (filePath.endsWith('.mp4')) {
                        res.set(____0.strings[7], 'video/mp4');
                        if (____0.options.cache.enabled && route.cache) {
                            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.videos);
                        }
                    }

                    let response = {
                        host: req.host,
                        url: req.url,
                        filePath: filePath,
                        content: req.content,
                        encode: ____0.getFileEncode(filePath),
                        headers: res.headers,
                        code: res.code,
                    };

                    if (options.shared) ____0.setShared(response);

                    res.end(response.content, response.encode);
                });
            };

            res.txt = (name, _data) => {
                ____0.fsm.getContent(name, (content) => {
                    if (!content) {
                        return res.status(404).end();
                    }
                    req.route.content = content;
                    if (req.route.encript === '123') {
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
                    if (req.route.encript === '123') {
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
                    if (req.route.encript === '123') {
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
                    if (req.route.encript === '123') {
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

            res.set('CharSet', 'UTF-8');
            res.set('Access-Control-Allow-Credentials', 'true');
            res.set('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Origin, X-Requested-With, Content-Type, Accept , Access-Token , Authorization');
            res.set('Access-Control-Allow-Methods', req.headers['access-control-request-method'] || 'POST,GET,DELETE,PUT,OPTIONS,VIEW,HEAD,CONNECT,TRACE');
            res.set('Access-Control-Allow-Origin', req.origin || req.referer || '*');

            ____0.validateRequest(req, res, (req, res) => {
                if (____0.options.www === false && req.host.contains('www')) {
                    res.redirect('//' + req.host.replace('www.', '') + req.url, 301);
                    return;
                }

                if (req.urlParser.pathname) {
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
                                    },
                                );
                            }
                        }
                    }

                    const matchedRoute = _0xrrxo.findRoute(req.urlParser.pathname, req.method);
                    if (matchedRoute) {
                        if (!matchedRoute.count) matchedRoute.count = 0;
                        matchedRoute.count++;
                        if (____0.options.help) res.set('help-request-count', matchedRoute.count);
                        req.route = matchedRoute;
                        if (req.route.limitPerIP && !req.headers.range) {
                            if (!req.route.ipMap) req.route.ipMap = new Map();
                            const now = Date.now();
                            const windowMs = req.route.limitWindowMs || 60000;
                            let bucket = req.route.ipMap.get(req.ip);
                            if (!bucket || now >= bucket.resetAt) bucket = { count: 0, resetAt: now + windowMs };
                            bucket.count++;
                            req.route.ipMap.set(req.ip, bucket);
                            if (bucket.count > req.route.limitPerIP) {
                                res.set('Retry-After', Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)));
                                res.status(429).json({ error: 'Too many requests from this IP' });
                                ____0.log('Too many requests from this IP : ' + req.ip);
                                return;
                            }
                            if (req.route.ipMap.size > 10000) {
                                for (const [ip, value] of req.route.ipMap) if (now >= value.resetAt) req.route.ipMap.delete(ip);
                            }
                        }

                        if (req.route.map.length > 0) {
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
                        }

                        req.session = {
                            $save: () => {},
                            accessToken: 'SHARED',
                            language: ____0.options.language || { id: 'En', dir: 'ltr', text: 'left' },
                            lang: ____0.options.language?.id || ____0.options.lang || 'En',
                        };

                        req.query = req.urlParser.query;
                        req.queryRaw = req.urlParserRaw.query;

                        ____0.validateRoute(req, res, (req, res) => {
                            if (req.method.like('options') || req.method.like('head')) {
                                res.set('Content-Length', 50 * 1000);
                                res.status(200).end();
                                return;
                            }
                            if (!req.method.like('get') && req.headers[____0.strings[18]] && req.headers[____0.strings[18]].match(/urlencoded/i)) {
                                req.on('data', function (data) {
                                    req.appendBody(data);
                                });
                                req.on('end', function () {
                                    if (req.bodyTooLarge) return;
                                    req.dataRaw = req.bodyRaw;
                                    req.data = req.body = ____0.querystring.parse(req.bodyRaw);
                                    if (____0.options.session.enabled) {
                                        ____0.session(req, res, ____0, function (session) {
                                            req.session = session;
                                            ____0.validateSession(req, res, (req, res) => {
                                                _0xrrxo.handleRoute(req, res, req.route);
                                            });
                                        });
                                    } else {
                                        _0xrrxo.handleRoute(req, res, req.route);
                                    }
                                });
                            } else if (!req.method.contains('get') && req.headers[____0.strings[18]] && req.headers[____0.strings[18]].contains('multipart')) {
                                let form = ____0.formidable({
                                    multiples: !0,
                                    uploadDir: ____0.options.upload_dir,
                                    maxFieldsSize: req.maxBodyBytes,
                                    maxFileSize: (____0.options.request && ____0.options.request.maxFileBytes) || 50 * 1024 * 1024,
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
                                            ____0.validateSession(req, res, (req, res) => {
                                                _0xrrxo.handleRoute(req, res, req.route);
                                            });
                                        });
                                    } else {
                                        _0xrrxo.handleRoute(req, res, req.route);
                                    }
                                });

                                return;
                            } else if (!req.method.like('get') && req.headers[____0.strings[18]] && req.headers[____0.strings[18]].match(/json/i)) {
                                req.on('data', function (data) {
                                    req.appendBody(data);
                                });
                                req.on('end', function () {
                                    if (req.bodyTooLarge) return;
                                    req.dataRaw = req.bodyRaw;

                                    req.data = req.body = ____0.fromJson(req.bodyRaw);
                                    if (____0.options.session.enabled) {
                                        ____0.session(req, res, ____0, function (session) {
                                            req.session = session;
                                            ____0.validateSession(req, res, (req, res) => {
                                                _0xrrxo.handleRoute(req, res, req.route);
                                            });
                                        });
                                    } else {
                                        _0xrrxo.handleRoute(req, res, req.route);
                                    }
                                });
                            } else if (!req.method.like('get')) {
                                req.on('data', function (data) {
                                    req.appendBody(data);
                                });
                                req.on('end', function () {
                                    if (req.bodyTooLarge) return;
                                    req.dataRaw = req.bodyRaw;
                                    req.data = req.body = ____0.fromJson(req.bodyRaw);
                                    if (____0.options.session.enabled) {
                                        ____0.session(req, res, ____0, function (session) {
                                            req.session = session;
                                            ____0.validateSession(req, res, (req, res) => {
                                                _0xrrxo.handleRoute(req, res, req.route);
                                            });
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
                                        ____0.validateSession(req, res, (req, res) => {
                                            _0xrrxo.handleRoute(req, res, req.route);
                                        });
                                    });
                                } else {
                                    _0xrrxo.handleRoute(req, res, req.route);
                                }
                                return;
                            }
                        });

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

                        if (req.method.like('options') || req.method.like('head')) {
                            res.set('Content-Length', 50 * 1000);
                            res.status(200).end();
                            return;
                        }
                        ____0.handleNotRoute(req, res);
                    }
                } else {
                    ____0.handleNotRoute(req, res);
                }
            });
        });
    };

    ____0.handleNotRoute = function (req, res) {
        res.set('help-eror-message', 'handleNotRoute() : ' + req.urlParser.pathname);
        res.status(404).end();
    };
    ____0.servers = [];
    ____0.server = null;
    ____0.serverCount = 0;
    _0xrrxo.start = function (_ports, callback) {
        ____0.startTime = Date.now();
        ____0.ws.wsSupport();
        if (typeof _ports === 'function') {
            callback = callback || _ports;
            _ports = null;
        }

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
                    server.on('error', (err) => ____0.log(err));
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
                        ____0.serverCount++;
                        if (e.code === 'EADDRINUSE') {
                            ____0.log('Address in use, Closing Server : ' + p);
                            server.close();
                        }
                    });
                    server.listen(p, function () {
                        ____0.serverCount++;
                        if (!____0.server) {
                            ____0.server = server;
                        }
                        ____0.servers.push(server);
                        ____0.log('\n-----------------------------------------');
                        ____0.log(` ( ${____0.options.name} ) Running on : http://${____0.options.hostname}:${p} `);
                        ____0.log('-----------------------------------------\n');
                    });
                }
            } catch (error) {
                ____0.log(error);
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
                            ____0.log('Address in use, Closing Server : ' + p);
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

        ____0.readyInterval = setInterval(() => {
            if (____0.serverCount == ports.length) {
                clearInterval(____0.readyInterval);
                ____0.call(____0.strings[9]);
                if (callback) {
                    callback(____0.servers);
                }
            }
        }, 100);

        return ____0.server;
    };

    return _0xrrxo;
};
