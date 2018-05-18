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
    callback = callback || function(){}
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


  fsm.stat = function (path, callback) {
    callback = callback || function(){}
    fsm.isFileExists(path, function (yes) {
      if (yes) {
        site.fs.stat(path, callback)
      } else {
        callback({
          message: 'file not exists'
        })
      }

    })
  }

  fsm.createDir = (dir, callback) => {
    callback = callback || function(){}
    
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

  fsm.removeFile = fsm.deleteFile = function(path, callback) {
    callback = callback || function(err){
      if(err){
        site.log(err)
      }
    }
    fsm.isFileExists(path, yes => {
        if (yes) {
          site.fs.unlink(path, err => {
            callback(err)
          })
        } else {
          callback({message :  path  + ' -> file not exists'})
        }
      })
  }

  fsm.writeFile = function (path, data, callback) {
    callback = callback || function(err){
      if(err){
        site.log(err)
      }
    }
    site.fs.writeFile(path, data, err => {
      callback(err)
    })
  }

  fsm.readFile = function (path, callback) {
    callback = callback || function(){}
    path = site.path.normalize(path)
    for (let index = 0; index < fsm.list.length; index++) {
      let file = fsm.list[index]
      if (file.path == path) {
        file.count++
          if (file.stat) {
            callback(null, file.content, file)
          } else {
            callback({
              message: 'File Not Exists'
            }, null)
          }

        return
      }
    }

    fsm.stat(path, function (err, stats) {
      if (!err) {

        site.fs.readFile(path, function (err, data) {
          let encode = "utf8"

          if (!err) {
            encode = site.fn.getFileEncode(path)
            data = data.toString(encode)
          } else {
            data = ""
          }

          let file = {
            path: path,
            content: data,
            etag : site.md5(data),
            count: 1,
            encode: encode,
            stat: stats,
            time: Date.now()
          }
          fsm.list.push(file)

          callback(err, data, file)
        })

      } else {
        let file = {
          path: path,
          content: null,
          etag : null,
          count: 1,
          encode: null,
          stat: null,
          time: Date.now()
        }
        fsm.list.push(file)

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
        etag : site.md5(data),
        count: 1,
        stat : fsm.statSync(path),
        encode: encode,
        time: Date.now()
      })
      return data
    } else {
      return null
    }

  }

  fsm.readFiles = function (paths, callback) {
    callback = callback || function(){}
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
    callback = callback || function(){}
    fsm.readFile(fsm.dir + "/css/" + name + ".css", function (err, data, file) {
      callback(err, data, file)
    })
  }
  fsm.js = function (name, callback) {
    callback = callback || function(){}
    fsm.readFile(fsm.dir + "/js/" + name + ".js", function (err, data, file) {
      callback(err, data, file)
    })
  }
  fsm.html = function (name, callback) {
    callback = callback || function(){}
    fsm.readFile(fsm.dir + "/html/" + name + ".html", function (err, data, file) {
      callback(err, data, file)
    })
  }
  fsm.json = function (name, callback) {
    callback = callback || function(){}
    fsm.readFile(fsm.dir + "/json/" + name + ".json", function (err, data, file) {
      callback(err, data, file)
    })
  }

  fsm.xml = function (name, callback) {
    callback = callback || function(){}
    fsm.readFile(fsm.dir + "/xml/" + name + ".xml", function (err, data, file) {
      callback(err, data, file)
    })
  }

  fsm.downloadFile = function (path, req, res) {
    fsm.stat(path, (err, stats) => {
      if (!err) {
        res.writeHead(200, {
          "Content-Type": site.fn.getContentType(path),
          "Content-Length": stats.size,
          "Content-Disposition": "attachment; filename=" + (site.path.basename(path))
        })
        var readStream = site.fs.createReadStream(path)
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