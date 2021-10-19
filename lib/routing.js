const { registerFormat } = require('archiver');

module.exports = function init(____0) {
    ____0.on(____0.strings[4], (_) => {
        if (!_) {
            _0xrrxo.list = [];
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
        let encode = ____0.getFileEncode(route.path);

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

        // if (____0.options.help) {
        //   res.set('help-info-etag', hash);
        // }

        // res.set('ETag', hash);

        if (____0.options.cache.enabled) {
            res.set('Last-Modified', last_modified);
        }

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
            res.set(____0.strings[7], 'text/xml')(____0.options.cache.enabled);
            res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.xml);

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
        } else if (route.path.endsWith('.svg')) {
            res.set(____0.strings[7], 'image/svg+xml');
            if (____0.options.cache.enabled) res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);

            res.end(req.content, encode);
        } else {
            res.end(req.content, encode);
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

        if (!route.path) {
            if (____0.options.help) {
                res.set('help-info-content', 'Route Not Set File Path');
            }
            res.status(200);
            _0xrrxo.endResponse(req, res);
            return;
        }

        if (typeof route.path == 'string') {
            ____0.readFile(route.path, function (err, data, file) {
                if (!err) {
                    route.content = data.toString('utf8');
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
            if (rr.name == r.name && rr.method == r.method) {
                exists = true;
                req.route = rr;
                rr.callback(req, res);
            }
        });

        if (!exists) {
            callback(req, res);
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
                _0xrrxo.onGET(r3, r.callback);
            });
            return;
        }
        let route = {};

        if (typeof r == 'string') {
            route.name = r.toLowerCase();
            route.name0 = r;
            route.public = false;
            route.method = 'GET';
            route.path = null;
            route.parser = 'static';
            route.parserDir = ____0.dir;
            route.cache = !0;
            route.hide = !1;
            route.compress = !1;
            route.map = [];
            route.callback = callback ?? _0xrrxo.defaultCallback;
            if (route.public) {
                route.require = {
                    features: [],
                    permissions: [],
                };
            } else {
                route.require = ____0.options.requires;
                route.default = ____0.options.defaults;
            }
        } else {
            route.name = r.name.toLowerCase();
            route.name0 = r.name;
            route.public = r.public ?? false;
            route.method = r.method || 'GET';
            route.path = r.path || null;
            route.content = r.content;
            route.parser = r.parser || 'static';
            route.parserDir = r.parserDir || ____0.dir;
            route.masterPage = r.masterPage || null;
            route.cache = r.cache ?? !0;
            route.hide = r.hide ?? !1;
            route.compress = r.compress ?? !1;
            route.map = r.map || [];
            route.callback = callback || r.callback || _0xrrxo.defaultCallback;

            if (route.public) {
                route.require = {
                    features: [],
                    permissions: [],
                };
            } else {
                route.require = r.require ?? ____0.options.requires;
                route.require.features = route.require.features ?? ____0.options.requires.features;
                route.require.permissions = route.require.permissions ?? ____0.options.requires.permissions;

                route.default = r.default ?? ____0.options.defaults;
                route.default.features = route.default.features ?? ____0.options.defaults.features;
                route.default.permissions = route.default.permissions ?? ____0.options.defaults.permissions;
            }
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
                        ____0.log('[ Duplicate API ]  ' + route.name);
                    } else {
                        ____0.log('[ Duplicate Route ]  ' + route.name + ' || ' + route.path);
                    }
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

    _0xrrxo.onALL = function (r, callback) {
        _0xrrxo.onREQUEST('*', r, callback);
    };

    _0xrrxo.handleRoute = async function (req, res, route) {
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
                                features: route.require.features.join(','),
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
                    res.status(401);
                    if (route.name.contains(____0.strings[16])) {
                        return res.json({
                            done: !1,
                            error: ____0.strings[14],
                            permissions: route.require.permissions,
                        });
                    } else {
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
        req.acceptEncoding = req.headers[____0.strings[5]] ? req.headers[____0.strings[5]] : '';
        res.ip = req.ip = req.headers[____0.strings[6]] ? req.headers[____0.strings[6]] : req.socket.remoteAddress.replace('::ffff:', '');
        res.ip2 = req.ip2 = req.socket.localAddress.replace('::ffff:', '');
        res.port = req.port = req.socket.remotePort;
        res.port2 = req.port2 = req.socket.localPort;
        res.cookies = res.cookie = req.cookies = req.cookie = ____0.cookie(req, res, ____0);

        req.urlRaw = req.url;
        req.urlParserRaw = ____0.url.parse(req.urlRaw, !0);
        req.urlParser = ____0.url.parse(req.urlRaw.toLowerCase(), !0);

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
            if (typeof arg1 === 'number') {
                res.writeHead(arg1);
                return res.end0();
            } else {
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
                    if (req.acceptEncoding.match(/\bdeflate\b/) && typeof arg1 === 'string') {
                        res.set(____0.strings[8], 'deflate');
                        res.set('Vary', ____0.strings[5]);
                        arg1 = ____0.zlib.deflateSync(Buffer.from(arg1));
                    } else if (req.acceptEncoding.match(/\bgzip\b/) && typeof arg1 === 'string') {
                        res.set(____0.strings[8], 'gzip');
                        res.set('Vary', ____0.strings[5]);
                        arg1 = ____0.zlib.gzipSync(Buffer.from(arg1));
                    } else {
                        // ____0.log(typeof arg1)
                    }
                }

                if (res.headers === undefined || res.headers[____0.strings[7]] === undefined) {
                    res.set(____0.strings[7], 'text/plain');
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

        res.html = res.render = function (name, _data, options) {
            ____0.fsm.getContent(name, (content) => {
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
                req.route = { ...req.route, ...options };
                if (req.route.parser) {
                    req.content = ____0.parser(req, res, ____0, req.route).html(req.content);
                }

                res.status(200);

                if (req.route.compress) {
                    req.content = req.content.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ');
                }

                if (name.endsWith('.css')) {
                    res.set(____0.strings[7], 'text/css');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.css);
                    }
                } else if (name.endsWith('.js')) {
                    res.set(____0.strings[7], 'application/javascript');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.js);
                    }
                } else if (name.endsWith('.html')) {
                    res.set(____0.strings[7], 'text/html');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.html);
                    }
                } else if (name.endsWith('.txt')) {
                    res.set(____0.strings[7], 'text/plain');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.txt);
                    }
                } else if (name.endsWith('.json')) {
                    res.set(____0.strings[7], 'application/json');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.json);
                    }
                } else if (name.endsWith('.xml')) {
                    res.set(____0.strings[7], 'text/xml');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.xml);
                    }
                } else if (name.endsWith('.woff2')) {
                    res.set(____0.strings[7], 'application/font-woff2');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                    }
                } else if (name.endsWith('.woff')) {
                    res.set(____0.strings[7], 'application/font-woff');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                    }
                } else if (name.endsWith('.ttf')) {
                    res.set(____0.strings[7], 'application/font-ttf');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                    }
                } else if (name.endsWith('.svg')) {
                    res.set(____0.strings[7], 'application/font-svg');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                    }
                } else if (name.endsWith('.otf')) {
                    res.set(____0.strings[7], 'application/font-otf');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                    }
                } else if (name.endsWith('.eot')) {
                    res.set(____0.strings[7], 'application/font-eot');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.fonts);
                    }
                } else if (name.endsWith('.gif')) {
                    res.set(____0.strings[7], 'image/gif');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                    }
                } else if (name.endsWith('.png')) {
                    res.set(____0.strings[7], 'image/png');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                    }
                } else if (name.endsWith('.jpg')) {
                    res.set(____0.strings[7], 'image/jpg');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                    }
                } else if (name.endsWith('.jpeg')) {
                    res.set(____0.strings[7], 'image/jpeg');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                    }
                } else if (name.endsWith('.ico')) {
                    res.set(____0.strings[7], 'image/ico');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                    }
                } else if (name.endsWith('.bmp')) {
                    res.set(____0.strings[7], 'image/bmp');
                    if (____0.options.cache.enabled && req.route.cache) {
                        res.set('Cache-Control', 'public, max-age=' + 60 * ____0.options.cache.images);
                    }
                }
                res.end(req.content, ____0.getFileEncode(name));
            });
        };

        res.css = (name) => {
            ____0.fsm.getContent(name, (content) => {
                if (!content) {
                    return res.status(404).end();
                }
                req.route.content = content;
                req.data = _data || {};
                req.route.parser = 'css';
                let out = ____0.parser(req, res, ____0, req.route).html(req.route.content);
                res.set(____0.strings[7], 'text/css');
                res.status(200).end(out);
            });
        };

        res.js = (name) => {
            ____0.fsm.getContent(name, (content) => {
                if (!content) {
                    return res.status(404).end();
                }
                req.route.content = content;
                req.data = _data || {};
                req.route.parser = 'js';
                let out = ____0.parser(req, res, ____0, req.route).html(req.route.content);
                res.set(____0.strings[7], 'text/js');
                res.status(200).end(out);
            });
        };

        res.jsonFile = (name) => {
            ____0.fsm.getContent(name, (content) => {
                if (!content) {
                    return res.status(404).end();
                }
                req.route.content = content;
                req.data = _data || {};
                req.route.parser = 'json';
                let out = ____0.parser(req, res, ____0, req.route).html(req.route.content);
                res.set(____0.strings[7], 'application/json');
                res.status(200).end(out);
            });
        };

        res.htmlContent = res.send = (text) => {
            if (typeof text === 'string') {
                res.set(____0.strings[7], 'text/html');
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
                return res.status(200).ending(time || 0 , ____0.toJson(obj));
            }
        };

        res.redirect = (url) => {
            res.set('Location', url);
            res.status(302).end();
        };

        res.setHeader('CharSet', 'UTF-8');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Origin, X-Requested-With, Content-Type, Accept , Access-Token , Authorization');
        res.setHeader('Access-Control-Allow-Methods', req.headers['access-control-request-method'] || 'POST,GET,DELETE,PUT,OPTIONS,VIEW,HEAD,CONNECT,TRACE');
        res.setHeader('Access-Control-Allow-Origin', req.headers.host || '*');
        if (req.headers.origin) {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
        }

        if (!req.urlParser.pathname.like(____0.strings[0])) {
            if (!____0._0x13xo) {
                res.status(405);
                res.end();
                return;
            }

            if (!____0._0x112xo) {
                res.set(____0.strings[1], 'true');
                res.status(402);
                if (req.url.like('*api')) {
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

        let matched_routes = _0xrrxo.list.filter((r) => req.method.toLowerCase().like(r.method.toLowerCase()) && req.urlParser.pathname.like(r.name));
        if (matched_routes.length > 0) {
            let r = matched_routes[0];
            if (!r.count) {
                r.count = 0;
            }
            r.count++;
            if (____0.options.help) {
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
                            _0xrrxo.handleRoute(req, res, r);
                        });
                    } else {
                        _0xrrxo.handleRoute(req, res, r);
                    }
                });
            } else if (req.method.contains('post') && req.headers[____0.strings[18]] && req.headers[____0.strings[18]].contains('multipart')) {
                let form = new ____0.formidable({
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
                            _0xrrxo.handleRoute(req, res, r);
                        });
                    } else {
                        _0xrrxo.handleRoute(req, res, r);
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
                    req.data = req.body = ____0.fromJson(req.bodyRaw);
                    if (____0.options.session.enabled) {
                        ____0.session(req, res, ____0, function (session) {
                            req.session = session;
                            _0xrrxo.handleRoute(req, res, r);
                        });
                    } else {
                        _0xrrxo.handleRoute(req, res, r);
                    }
                });
            } else {
                req.body = req.data = req.query;
                req.bodyRaw = req.dataRaw = req.queryRaw;

                if (____0.options.session.enabled) {
                    ____0.session(req, res, ____0, function (session) {
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
            if (____0.options.help) {
                res.set('help-eror-message', 'unhandled route ' + req.urlParser.pathname);
            }
            res.htmlContent("<h1 align='center'>Base Route / Not Set</h1>");
            return;
        }

        if (____0.options.help) {
            res.set('help-eror-message', 'unhandled route ' + req.urlParser.pathname);
        }
        if (req.method.toLowerCase().like('options') || req.method.toLowerCase().like('head')) {
            res.status(200).end();
            return;
        }
        res.set('help-eror-message', 'unhandled route ' + req.urlParser.pathname);
        res.status(404).end();
    };

    ____0.servers = [];
    ____0.server = null;

    _0xrrxo.start = function (_ports, callback) {
        const ports = [];

        if (_ports && ____0.typeof(_ports) !== 'Array') {
            ports.some((p0) => p0 == _ports) || ports.push(_ports);
        } else if (_ports && ____0.typeof(_ports) == 'Array') {
            _ports.forEach((p) => {
                ports.some((p0) => p0 == p) || ports.push(p);
            });
        }

        if (____0.options.port && ____0.typeof(____0.options.port) !== 'Array') {
            ports.some((p0) => p0 == ____0.options.port) || ports.push(____0.options.port);
        } else if (____0.options.port && ____0.typeof(____0.options.port) == 'Array') {
            ____0.options.port.forEach((p) => {
                ports.some((p0) => p0 == p) || ports.push(p);
            });
        }

        ports.forEach((p, i) => {
            let index = ____0.servers.length;
            ____0.servers[index] = ____0.http.createServer(_0xrrxo.handleServer);
            ____0.servers[index].listen(p, function () {
                ____0.log('\n-----------------------------------------');
                ____0.log(` ( ${____0.options.name} ) Running on : http://${____0.options.hostname}:${p} `);
                ____0.log('-----------------------------------------\n');
            });
        });

        if (____0.options.https.enabled) {
            const https_options = {
                key: ____0.fs.readFileSync(____0.options.https.key || __dirname + '/../ssl/key.pem'),
                cert: ____0.fs.readFileSync(____0.options.https.cert || __dirname + '/../ssl/cert.pem'),
            };

            ____0.options.https.ports.forEach((p, i) => {
                let index = ____0.servers.length;
                ____0.servers[index] = ____0.https.createServer(https_options, _0xrrxo.handleServer);
                ____0.servers[index].listen(p, function () {
                    ____0.log('');
                    ____0.log('-----------------------------------------');
                    ____0.log('    ' + ____0.options.name + ' [ https ] Running on Port : ' + p);
                    ____0.log('-----------------------------------------');
                    ____0.log('');
                });
            });
        }

        ____0.servers.forEach((s) => {
            s.maxHeadersCount = 0;
            s.timeout = 1000 * 30;
        });

        ____0.server = ____0.servers[0];

        if (callback) {
            callback(____0.servers);
        }
        ____0.call(____0.strings[9]);

        return ____0.server;
    };

    return _0xrrxo;
};
