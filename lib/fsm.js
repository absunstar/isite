module.exports = function init(____0) {

  const fsm = function () {}
  const fs = require('fs')

  ____0.on('0x0000', (_) => {
    if(!_){
      fsm.list = []
    }
  })


  fsm.dir = ____0.dir
  fsm.list = []




  fsm.isFileExistsSync = (path) => {
    for (let i = 0; i < fsm.list.length; i++) {
      let f = fsm.list[i];
      if (f.path === path) {
        return !0;
      }
    }
    return fs.existsSync(path)
  }

  fsm.isFileExists = (path, callback) => {
    callback = callback || function () {}
    if (fsm.isFileExistsSync(path)) {
      callback(!0)
    } else {
      callback(!1)
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
      return !0
    } catch (error) {
      return !1
    }
  }

  fsm.createDir = fsm.mkDir = (dir, callback) => {

    callback = callback || function () {}

    fs.exists(____0.path.dirname(dir), ok => {
      if (ok) {
        fs.mkdir(dir, err => {
          callback(err, dir)
        })
      } else {
        let parentDir = ____0.path.dirname(dir)
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
        ____0.log(err)
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
        ____0.log(err)
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
        ____0.log(err)
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
    encode = ____0.fn.getFileEncode(path)
    if (fsm.isFileExistsSync(path)) {
      let data = fs.readFileSync(path, encode)
      let file = {
        path: path,
        content: data,
        etag: ____0.x0md50x(data),
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
        etag: ____0.x0md50x(data),
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
      let exists = !1
      for (let i = 0; i < fsm.list.length; i++) {
        let file = fsm.list[i]
        if (file.path == p) {
          content += file.content
          file.count++
          exists = !0
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
    let extname = ____0.path.extname(name).replace('.', '')
    if (extname == 'png' || extname == 'jpg' || extname == 'jpeg' || extname == 'bmp' || extname == 'ico') {
      extname = 'images'
    }
    let path = ____0.path.join(____0.dir, extname, name)

    if (!____0.isFileExistsSync(path)) {
      let arr = name.split('/')
      if (arr.length === 2) {
        let extname = ____0.path.extname(arr[1]).replace('.', '')
        if (extname == 'png' || extname == 'jpg' || extname == 'jpeg' || extname == 'bmp' || extname == 'ico') {
          extname = 'images'
        }
        path = ____0.path.join(____0.path.dirname(____0.dir), 'apps', arr[0], 'site_files', extname, arr[1])
      } else if (arr.length === 3) {
        let extname = ____0.path.extname(arr[2]).replace('.', '')
        if (extname == 'png' || extname == 'jpg' || extname == 'jpeg' || extname == 'bmp' || extname == 'ico') {
          extname = 'images'
        }
        path = ____0.path.join(____0.path.dirname(____0.dir), 'apps', arr[0], 'site_files', extname, arr[1], arr[2])
      }
    }


    if (!____0.isFileExistsSync(path)) {
      let arr = name.split('/')
      if (arr.length > 1) {
        ____0.apps.forEach(ap => {
          if (arr.length === 2 && ap.name == arr[0]) {
            let extname = ____0.path.extname(arr[1]).replace('.', '')
            if (extname == 'png' || extname == 'jpg' || extname == 'jpeg' || extname == 'bmp' || extname == 'ico') {
              extname = 'images'
            }
            path = ____0.path.join(ap.path, 'site_files',extname, arr[1])
          } else if (arr.length === 2 && ap.name2 == arr[0]) {
            let extname = ____0.path.extname(arr[1]).replace('.', '')
            if (extname == 'png' || extname == 'jpg' || extname == 'jpeg' || extname == 'bmp' || extname == 'ico') {
              extname = 'images'
            }
            path = ____0.path.join(ap.path, 'site_files', extname, arr[1])
          } else if (arr.length === 3 && ap.name == arr[0]) {
            let extname = ____0.path.extname(arr[2]).replace('.', '')
            if (extname == 'png' || extname == 'jpg' || extname == 'jpeg' || extname == 'bmp' || extname == 'ico') {
              extname = 'images'
            }
            path = ____0.path.join(ap.path, 'site_files',extname, arr[1], arr[2])
          }
        })
      }
    }

    if (!____0.isFileExistsSync(path)) {
      ____0.log(path, 'PATH NOT EXISTS')
      callback('')
      return ''

    }

    let txt = ____0.readFileSync(path)
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
          "Content-Type": ____0.fn.contentType(path),
          "Content-Length": stats.size,
          "Content-Disposition": "attachment; filename=" + (____0.path.basename(path))
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