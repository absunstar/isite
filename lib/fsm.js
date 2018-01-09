/**
 * 
 * @param {isite} site 
 * @returns {fsm}
 */
module.exports = function init(site) {

  var fsm = function () {}

  fsm.dir = site.dir

  fsm.list = []



  fsm.isFileExistsSync = (path) => {
    for (let i = 0; i < fsm.list.length; i++) {
      let f = fsm.list[i];
      if (f.path === path) {
        return true;
      }
    }
    return site.fs.existsSync(path)
  }

  fsm.isFileExists = (path, callback) => {
    if (fsm.isFileExistsSync(path)) {
      callback(true)
    } else {
      callback(false)
    }
  }

  fsm.statSync = function (path) {
    if (fsm.isFileExistsSync(path)) {
      return site.fs.statSync(path)
    }
  }

  fsm.createDir = (dir, callback) => {
    site.fs.exists(dir, ok => {
      if (!ok) {
        site.fs.mkdir(dir, err => {
          callback(err, dir)
        })
      } else {
        callback(null, dir)
      }
    })
  }
  fsm.removeFile = fsm.deleteFile = (path, callback) => {
    site.fs.unlink(path, err => {
      callback(err)
    })
  }
  fsm.writeFile = function (path, data, callback) {
    site.fs.writeFile(path, data, err => {
      callback(err)
    })
  }

  fsm.readFile = function (path, callback) {
    for (let index = 0; index < fsm.list.length; index++) {
      let file = fsm.list[index]
      if (file.path == path) {
        callback(null, file.content)
        file.count++
          return
      }
    }

    fsm.isFileExists(path, function (yes) {
      if (yes) {

        site.fs.readFile(path, function (err, data) {
          let encode = "utf8"

          if (!err) {
            encode = site.fn.getFileEncode(path)
            data = data.toString(encode)
          } else {
            data = ""
          }

          fsm.list.push({
            path: path,
            content: data,
            count: 1,
            encode: encode,
            time: Date.now()
          })
          callback(err, data)
        })

      } else {
        callback({
          message: 'File Not Exists'
        }, null)
      }
    })
  }

  fsm.readFileSync = function (path) {
    for (let index = 0; index < fsm.list.length; index++) {
      let file = fsm.list[index]
      if (file.path == path) {
        file.count++
          return file.content
      }
    }
    let encode = "utf8"
    encode = site.fn.getFileEncode(path)
    if (fsm.isFileExistsSync(path)) {
      let data = site.fs.readFileSync(path, encode)
      fsm.list.push({
        path: path,
        content: data,
        count: 1,
        encode: encode,
        time: Date.now()
      })
      return data
    } else {
      return null
    }

  }

  fsm.readFiles = function (paths, callback) {
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

  fsm.css = function (name, callback) {
    fsm.readFile(fsm.dir + "/css/" + name + ".css", function (err, data) {
      callback(err, data)
    })
  }
  fsm.js = function (name, callback) {
    fsm.readFile(fsm.dir + "/js/" + name + ".js", function (err, data) {
      callback(err, data)
    })
  }
  fsm.html = function (name, callback) {
    fsm.readFile(fsm.dir + "/html/" + name + ".html", function (err, data) {
      callback(err, data)
    })
  }
  fsm.json = function (name, callback) {
    fsm.readFile(fsm.dir + "/json/" + name + ".json", function (err, data) {
      callback(err, data)
    })
  }

  fsm.xml = function (name, callback) {
    fsm.readFile(fsm.dir + "/xml/" + name + ".xml", function (err, data) {
      callback(err, data)
    })
  }

  fsm.downloadFile = function (path, req, res) {
    var stat = site.fs.statSync(path)

    res.writeHead(200, {
      "Content-Type": site.fn.getContentType(path),
      "Content-Length": stat.size
    })

    var readStream = site.fs.createReadStream(path)
    readStream.pipe(res)
  }

  fsm.download = function (name, req, res) {
    return fsm.downloadFile(fsm.dir + "/downloads/" + name, req, res)
  }

  return fsm
}