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
