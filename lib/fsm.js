

const fn = require('./fn')
const fs = require('fs')

var fsm = function() {}

fsm.fileList = []

fsm.isFileExists = (path, callback) => {
    fs.exists(path, ok => {
      callback(ok)
    })
  }

  fsm.createDir = (dir, callback) => {
    fs.exists(dir, ok => {
      if (!ok) {
        fs.mkdir(dir, err => {
          callback(err, dir)
        })
      } else {
        callback(null, dir)
      }
    })
  }
  fsm.removeFile = fsm.deleteFile = (path, callback) => {
    fs.unlink(path, err => {
      callback(err)
    })
  }
  fsm.writeFile = function(path, data, callback) {
    fs.writeFile(path, data, err => {
      callback(err)
    })
  }

  fsm.readFile = function(path, callback) {
    for (let index = 0; index < fsm.fileList.length; index++) {
      let file = fsm.fileList[index]
      if (file.path == path) {
        callback(null, file.content)
        file.count++
        return
      }
    }

    fs.readFile(path, function(err, data) {
      let encode = "utf8"

      if (!err) {
        encode = fn.getFileEncode(path)
        data = data.toString(encode)
      } else {
        data = ""
      }

      fsm.fileList.push({
        path: path,
        content: data,
        count: 1,
        encode: encode,
        time: Date.now()
      })
      callback(err, data)
    })
  }

  fsm.readFileSync = function(path) {
    for (let index = 0; index < fsm.fileList.length; index++) {
      let file = fsm.fileList[index]
      if (file.path == path) {
        file.count++
        return file.content
      }
    }
    let encode = "utf8"
    encode = fn.getFileEncode(path)
    let data = fs.readFileSync(path, encode)
    fsm.fileList.push({
      path: path,
      content: data,
      count: 1,
      encode: encode,
      time: Date.now()
    })
    return data
  }

  fsm.readFiles = function(paths, callback) {
    var content = ""
    for (var index = 0; index < paths.length; index++) {
      let p = paths[index]
      let exists = false
      for (let i = 0; i < fsm.fileList.length; i++) {
        let file = fsm.fileList[i]
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

  fsm.css = function(name, callback) {
    fsm.readFile(fsm.dir + "/css/" + name + ".css", function(err, data) {
      callback(err, data)
    })
  }
  fsm.js = function() {
    fsm.readFile(fsm.dir + "/js/" + name + ".js", function(err, data) {
      callback(err, data)
    })
  }
  fsm.html = function(name, callback) {
    fsm.readFile(fsm.dir + "/html/" + name + ".html", function(err, data) {
      callback(err, data)
    })
  }
  fsm.json = function(name, callback) {
    fsm.readFile(fsm.dir + "/json/" + name + ".json", function(err, data) {
      callback(err, data)
    })
  }

  fsm.xml = function(name, callback) {
    fsm.readFile(fsm.dir + "/xml/" + name + ".xml", function(err, data) {
      callback(err, data)
    })
  }

  fsm.downloadFile = function(path, req, res) {
    var stat = fsm.fs.statSync(path)

    res.writeHead(200, {
      "Content-Type": core.getContentType(path),
      "Content-Length": stat.size
    })

    var readStream = fs.createReadStream(path)
    readStream.pipe(res)
  }

  fsm.download = function(name, req, res) {
    return fsm.downloadFile(fsm.dir + "/downloads/" + name, req, res)
  }

  module.exports = fsm