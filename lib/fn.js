module.exports = function init(site) {

  var fn = function () {}

  fn.typeOf = function type(elem) {
    return Object.prototype.toString.call(elem).slice(8, -1);
  }


  fn.copy = function copy(obj) {
    if (obj !== undefined) {
      return Object.assign({} , obj)
    }
    return {}
  }

  fn.getExtension = function (filename) {
    var i = filename.lastIndexOf(".")
    return i < 0 ? "" : filename.substr(i)
  }

  fn.getContentType = function (path) {
    if (typeof path === undefined) return null
    if (path.endsWith(".exe")) {
      return "application/octet-stream"
    } else if (path.endsWith(".png")) {
      return "image/png"
    } else if (path.endsWith(".ico")) {
      return "image/ico"
    } else {
      return "application/" + site.path.extname(path)
    }
  }

  fn.getFileEncode = function (path) {
    if (
      path.endsWith(".woff2") ||
      path.endsWith(".woff") ||
      path.endsWith(".ttf") ||
      path.endsWith(".svg") ||
      path.endsWith(".otf") ||
      path.endsWith(".png") ||
      path.endsWith(".jpg") ||
      path.endsWith(".jpeg") ||
      path.endsWith(".ico") ||
      path.endsWith(".bmp") ||
      path.endsWith(".eot")
    ) {
      return "binary"
    }
    return "utf8"
  }

  fn.fromJson = data => {

    try {
      if (data === undefined) {
        return {}
      }

      if (data && typeof data === 'string' && data != '') {
        return JSON.parse(data)
      }

      if (typeof data === 'object') {
        return data
      }
    } catch (e) {
      return {}
    }

    return {}
  }

  fn.toJson = obj => {
    if (obj === undefined || obj === null) {
      return ''
    }
    return JSON.stringify(obj)
  }

  fn.$base64Letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  fn.$base64Numbers = []
  for (let $i = 11; $i < 99; $i++) {
    if ($i % 10 !== 0 && $i % 11 !== 0) {
      fn.$base64Numbers.push($i)
    }
  }

  fn.toBase64 = data => {
    if (typeof data === undefined) {
      return ""
    }
    if (typeof data === "object") {
      data = JSON.stringify(data)
    }
    return Buffer.from(data).toString("base64")
  }

  fn.fromBase64 = data => {
    if (typeof data !== "string") {
      return ""
    }
    return Buffer.from(data, "base64").toString()
  }

  fn.to123 = data => {
    data = fn.toBase64(data)
    let newData = ""

    for (let i = 0; i < data.length; i++) {
      let letter = data[i]
      newData += fn.$base64Numbers[fn.$base64Letter.indexOf(letter)]
    }

    return newData
  }

  fn.from123 = data => {
    let newData = ""
    for (let i = 0; i < data.length; i++) {
      let num = data[i] + data[i + 1]
      let index = fn.$base64Numbers.indexOf(parseInt(num))
      newData += fn.$base64Letter[index]
      i++
    }
    newData = fn.fromBase64(newData)

    return newData
  }

  return fn

}