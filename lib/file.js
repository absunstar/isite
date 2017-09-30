module.exports = function init(site) {
  const fs = require("fs") // site.fs

  site.fileList = []

  site.isFileExists = (path, callback) => {
    fs.exists(path, ok => {
      callback(ok)
    })
  }
  site.createDir = (dir, callback) => {
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
  site.removeFile = site.deleteFile = (path, callback) => {
    fs.unlink(path, err => {
      callback(err)
    })
  }
  site.writeFile = function(path, data, callback) {
    fs.writeFile(path, data, err => {
      callback(err)
    })
  }

  site.readFile = function(path, callback) {
    for (let index = 0; index < site.fileList.length; index++) {
      let file = site.fileList[index]
      if (file.path == path) {
        callback(null, file.content)
        file.count++
        return
      }
    }

    site.fs.readFile(path, function(err, data) {
      let encode = "utf8"

      if (!err) {
        encode = site.getFileEncode(path)
        data = data.toString(encode)
      } else {
        data = ""
      }

      site.fileList.push({
        path: path,
        content: data,
        count: 1,
        encode: encode,
        time: Date.now()
      })
      callback(err, data)
    })
  }

  site.readFileSync = function(path) {
    for (let index = 0; index < site.fileList.length; index++) {
      let file = site.fileList[index]
      if (file.path == path) {
        file.count++
        return file.content
      }
    }
    let encode = "utf8"
    encode = site.getFileEncode(path)
    let data = site.fs.readFileSync(path, encode)
    site.fileList.push({
      path: path,
      content: data,
      count: 1,
      encode: encode,
      time: Date.now()
    })
    return data
  }

  site.readFiles = function(paths, callback) {
    var content = ""
    for (var index = 0; index < paths.length; index++) {
      let p = paths[index]
      let exists = false
      for (let i = 0; i < site.fileList.length; i++) {
        let file = site.fileList[i]
        if (file.path == p) {
          content += file.content
          file.count++
          exists = true
        }
      }
      if (!exists) {
        data = site.readFileSync(p)
        content += data
      }
    }
    callback(null, content)
  }

  site.css = function(name, callback) {
    site.readFile(site.dir + "/css/" + name + ".css", function(err, data) {
      callback(err, data)
    })
  }
  site.js = function() {
    site.readFile(site.dir + "/js/" + name + ".js", function(err, data) {
      callback(err, data)
    })
  }
  site.html = function(name, callback) {
    site.readFile(site.dir + "/html/" + name + ".html", function(err, data) {
      callback(err, data)
    })
  }
  site.json = function(name, callback) {
    site.readFile(site.dir + "/json/" + name + ".json", function(err, data) {
      callback(err, data)
    })
  }

  site.xml = function(name, callback) {
    site.readFile(site.dir + "/xml/" + name + ".xml", function(err, data) {
      callback(err, data)
    })
  }

  site.downloadFile = function(path, req, res) {
    var stat = site.fs.statSync(path)

    res.writeHead(200, {
      "Content-Type": site.getContentType(path),
      "Content-Length": stat.size
    })

    var readStream = site.fs.createReadStream(path)
    readStream.pipe(res)
  }

  site.download = function(name, req, res) {
    return site.downloadFile(site.dir + "/downloads/" + name, req, res)
  }
}
