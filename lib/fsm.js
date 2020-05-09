module.exports = function init(_f_) {

  const fsm = function () {}
  const fs = require('fs')

  _f_.on('big error', () => {
    fsm.list = []
  })


  fsm.dir = _f_.dir
  fsm.list = []




  fsm.isFileExistsSync = (path) => {
    for (let i = 0; i < fsm.list.length; i++) {
      let f = fsm.list[i];
      if (f.path === path) {
        return true;
      }
    }
    return fs.existsSync(path)
  }

  fsm.isFileExists = (path, callback) => {
    callback = callback || function () {}
    if (fsm.isFileExistsSync(path)) {
      callback(true)
    } else {
      callback(false)
    }
  }

  fsm.statSync = function (path) {
    if (fsm.isFileExistsSync(path)) {
      return fs.statSync(path)
    }
  }

  fsm.stat = function (path, callback) {
    callback = callback || function () {}
    fsm.isFileExists(path, function (yes) {
      if (yes) {
        fs.stat(path, callback)
      } else {
        callback({
          message: 'file not exists'
        })
      }

    })
  }

  fsm.createDirSync = fsm.mkdirSync = function (path) {
    try {
      fs.mkdirSync(path)
      return true
    } catch (error) {
      return false
    }
  }

  fsm.createDir = fsm.mkDir = (dir, callback) => {

    callback = callback || function () {}

    fs.exists(_f_.path.dirname(dir), ok => {
      if (ok) {
        fs.mkdir(dir, err => {
          callback(err, dir)
        })
      } else {
        let parentDir = _f_.path.dirname(dir)
        fsm.mkDir(parentDir, () => {
          fs.mkdir(dir, err => {
            callback(err, dir)
          })
        })
      }
    })

  }

  fsm.removeFileSync = fsm.deleteFileSync = function (path) {
    if (fs.existsSync(path)) {
      return fs.unlinkSync(path)
    }
    return null
  }

  fsm.removeFile = fsm.deleteFile = function (path, callback) {

    callback = callback || function (err) {
      if (err) {
        _f_.log(err)
      }
    }

    fsm.isFileExists(path, yes => {
      if (yes) {
        fs.unlink(path, err => {
          callback(err)
        })
      } else {
        callback({
          message: path + ' :: Error Deleting :: file not exists'
        })
      }
    })
  }

  fsm.writeFileSync = function (path, data, encode, callback) {

    callback = callback || function (err) {
      if (err) {
        _f_.log(err)
      }
    }

    try {
      let path2 = path + '_tmp'
      fsm.deleteFileSync(path2)
      fs.writeFileSync(path2, data, {
        encoding: encode || 'utf8'
      })
      fsm.deleteFileSync(path)
      fs.renameSync(path2, path)
      fsm.deleteFileSync(path2)
      callback()
    } catch (err) {
      callback(err)
    }

  }

  fsm.writeFile = function (path, data, callback) {

    setTimeout(() => {
      fsm.writeFileSync(path, data, null, callback)
    }, 100);
  }

  fsm.readFile = function (path, callback) {
    setTimeout(() => {
      fsm.readFileSync(path, callback)
    }, 100);
  }

  fsm.readFileSync = function (path, callback) {

    callback = callback || function (err) {
      if (err) {
        _f_.log(err)
      }
    }

    let path2 = path + '_tmp'

    for (let index = 0; index < fsm.list.length; index++) {
      let file = fsm.list[index]
      if (file.path == path) {
        file.count++
        callback(null, file.content, file)
        return file.content
      }
    }

    let encode = "utf8"
    encode = _f_.fn.getFileEncode(path)
    if (fsm.isFileExistsSync(path)) {
      let data = fs.readFileSync(path, encode)
      let file = {
        path: path,
        content: data,
        etag: _f_.md5(data),
        count: 1,
        stat: fsm.statSync(path),
        encode: encode,
        time: Date.now()
      }
      fsm.list.push(file)
      callback(null, file.content, file)
      return data
    } else if (fsm.isFileExistsSync(path2)) {
      let data = fs.readFileSync(path2, encode)
      let file = {
        path: path,
        content: data,
        etag: _f_.md5(data),
        count: 1,
        stat: fsm.statSync(path),
        encode: encode,
        time: Date.now()
      }
      fsm.list.push(file)
      callback(null, file.content, file)
      return data
    } else {
      callback({
        message: path + '  :: Error Read File Not Exists'
      })
      return null
    }

  }

  fsm.readFiles = function (paths, callback) {
    callback = callback || function () {}
    var content = ""
    for (var index = 0; index < paths.length; index++) {
      let p = paths[index]
      let exists = false
      for (let i = 0; i < fsm.list.length; i++) {
        let file = fsm.list[i]
        if (file.path == p) {
          content += file.content
          file.count++
          exists = true
        }
      }
      if (!exists) {
        data = fsm.readFileSync(p)
        content += data
      }
    }
    callback(null, content)
  }


  fsm.getContent = function (name, callback) {
    callback = callback || function () {}
    let extname = _f_.path.extname(name).replace('.', '')
    if (extname == 'png' || extname == 'jpg' || extname == 'jpeg' || extname == 'bmp' || extname == 'ico') {
      extname = 'images'
    }
    let path = _f_.path.join(_f_.dir, extname, name)

    if (!_f_.isFileExistsSync(path)) {
      let arr = name.split('/')
      if (arr.length === 2) {
        let extname = _f_.path.extname(arr[1]).replace('.', '')
        if (extname == 'png' || extname == 'jpg' || extname == 'jpeg' || extname == 'bmp' || extname == 'ico') {
          extname = 'images'
        }
        path = _f_.path.join(_f_.path.dirname(_f_.dir), 'apps', arr[0], 'site_files', extname, arr[1])
      } else if (arr.length === 3) {
        let extname = _f_.path.extname(arr[2]).replace('.', '')
        if (extname == 'png' || extname == 'jpg' || extname == 'jpeg' || extname == 'bmp' || extname == 'ico') {
          extname = 'images'
        }
        path = _f_.path.join(_f_.path.dirname(_f_.dir), 'apps', arr[0], 'site_files', extname, arr[1], arr[2])
      }
    }


    if (!_f_.isFileExistsSync(path)) {
      let arr = name.split('/')
      if (arr.length > 1) {
        _f_.apps.forEach(ap => {
          if (arr.length === 2 && ap.name == arr[0]) {
            let extname = _f_.path.extname(arr[1]).replace('.', '')
            if (extname == 'png' || extname == 'jpg' || extname == 'jpeg' || extname == 'bmp' || extname == 'ico') {
              extname = 'images'
            }
            path = _f_.path.join(ap.path, 'site_files',extname, arr[1])
          } else if (arr.length === 2 && ap.name2 == arr[0]) {
            let extname = _f_.path.extname(arr[1]).replace('.', '')
            if (extname == 'png' || extname == 'jpg' || extname == 'jpeg' || extname == 'bmp' || extname == 'ico') {
              extname = 'images'
            }
            path = _f_.path.join(ap.path, 'site_files', extname, arr[1])
          } else if (arr.length === 3 && ap.name == arr[0]) {
            let extname = _f_.path.extname(arr[2]).replace('.', '')
            if (extname == 'png' || extname == 'jpg' || extname == 'jpeg' || extname == 'bmp' || extname == 'ico') {
              extname = 'images'
            }
            path = _f_.path.join(ap.path, 'site_files',extname, arr[1], arr[2])
          }
        })
      }
    }

    if (!_f_.isFileExistsSync(path)) {
      _f_.log(path, 'PATH NOT EXISTS')
      callback('')
      return ''

    }

    let txt = _f_.readFileSync(path)
    callback(txt)
    return txt
  }

  fsm.css = function (name, callback) {
    callback = callback || function () {}
    fsm.readFile(fsm.dir + "/css/" + name + ".css", function (err, data, file) {
      callback(err, data, file)
    })
  }

  fsm.js = function (name, callback) {
    callback = callback || function () {}
    fsm.readFile(fsm.dir + "/js/" + name + ".js", function (err, data, file) {
      callback(err, data, file)
    })
  }

  fsm.html = function (name, callback) {
    callback = callback || function () {}
    fsm.readFile(fsm.dir + "/html/" + name + ".html", function (err, data, file) {
      callback(err, data, file)
    })
  }

  fsm.json = function (name, callback) {
    callback = callback || function () {}
    fsm.readFile(fsm.dir + "/json/" + name + ".json", function (err, data, file) {
      callback(err, data, file)
    })
  }

  fsm.xml = function (name, callback) {
    callback = callback || function () {}
    fsm.readFile(fsm.dir + "/xml/" + name + ".xml", function (err, data, file) {
      callback(err, data, file)
    })
  }

  fsm.downloadFile = function (path, req, res) {
    fsm.stat(path, (err, stats) => {
      if (!err) {
        res.writeHead(200, {
          "Content-Type": _f_.fn.contentType(path),
          "Content-Length": stats.size,
          "Content-Disposition": "attachment; filename=" + (_f_.path.basename(path))
        })
        var readStream = fs.createReadStream(path)
        readStream.pipe(res)
      } else {
        res.error()
      }
    })
  }

  fsm.download = function (name, req, res) {
    return fsm.downloadFile(fsm.dir + "/downloads/" + name, req, res)
  }

  return fsm
}