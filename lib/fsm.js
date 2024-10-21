module.exports = function init(____0) {
  const fsm = function () {};
  const fs = require('fs');

  ____0.on('0x0000', (_) => {
    if (!_) {
      fsm.list = [];
    }
  });

  fsm.dir = ____0.dir;
  fsm.list = [];

  fsm.isFileExistsSync = (path) => {
    return fsm.list.some((f) => f.path === path) || fs.existsSync(path);
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

    fs.exists(____0.path.dirname(dir), (ok) => {
      if (ok) {
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
    });
  };

  fsm.removeFileSync = fsm.deleteFileSync = function (path) {
    if (fs.existsSync(path)) {
      return fs.unlinkSync(path);
    }
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
      callback(null, path);
    } catch (err) {
      callback(err);
    }
  };

  fsm.writeFile = function (path, data, callback) {
    setTimeout(() => {
      fsm.writeFileSync(path, data, null, callback);
    }, 100);
  };

  fsm.getFilePath = function (name) {
    if (____0.isFileExistsSync(name)) {
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
      return null;
    }

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
          fsm.list.splice(i, 1);
        }
      }
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
      if (data) {
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
        fsm.list.push(file);
        if (callback) {
          callback(null, file);
        }
      } else {
        callback({
          message: path + '  :: Error Read File Not Exists',
        });
      }
    });
  };

  fsm.readFile = function (path, callback) {
    path = fsm.getFilePath(path);

    if (!path) {
      if (callback) {
        callback({
          message: path + '  :: Error Read File Not Exists',
        });
      }
    }

    let index = fsm.list.findIndex((f) => f.path == path);
    if (index !== -1) {
      fsm.list[index].count++;
      fsm.list[index].time = new Date().getTime();
      if (callback) {
        callback(null, fsm.list[index]);
      }
      return;
    }

    if (fsm.isFileExistsSync(path)) {
      fsm.readFileNow(path, callback);
    } else if (fsm.isFileExistsSync(path + '.isite-backup')) {
      fsm.readFileNow(path + '.isite-backup', callback);
    } else {
      if (callback) {
        callback({
          message: path + '  :: Error Read File Not Exists',
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

    let index = fsm.list.findIndex((f) => f.path == path);
    if (index !== -1) {
      fsm.list[index].count++;
      fsm.list[index].time = new Date().getTime();
      return fsm.list[index].content;
    }

    if (fsm.isFileExistsSync(path)) {
      let file = {
        path: path,
        content: fsm.readFileSyncRaw(path),
        count: 1,
        stat: fsm.statSync(path),
        time: new Date().getTime(),
      };
      fsm.list.push(file);

      return file.content;
    } else if (fsm.isFileExistsSync(path + '.isite-backup')) {
      let file = {
        path: path,
        content: fsm.readFileSyncRaw(path + '.isite-backup'),
        count: 1,
        stat: fsm.statSync(path + '.isite-backup'),
        time: new Date().getTime(),
      };
      fsm.list.push(file);

      return file.content;
    }
    return '';
  };

  fsm.readFiles = function (paths, callback) {
    callback = callback || function () {};
    var content = '';
    for (var index = 0; index < paths.length; index++) {
      let p = paths[index];
      let exists = !1;
      for (let i = 0; i < fsm.list.length; i++) {
        let file = fsm.list[i];
        if (file.path == p) {
          content += file.content;
          file.count++;
          exists = !0;
        }
      }
      if (!exists) {
        data = fsm.readFileSync(p);
        content += data;
      }
    }
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
    fsm.stat(path, (err, stats) => {
      if (!err) {
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
    });
  };

  fsm.download = function (name, req, res) {
    return fsm.downloadFile(fsm.dir + '/downloads/' + name, req, res);
  };

  return fsm;
};
