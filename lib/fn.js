module.exports = function init(site) {

  var fn = function () { }

  fn.typeOf = function type(elem) {
    return Object.prototype.toString.call(elem).slice(8, -1);
  }


  fn.copy = function copy(obj) {
    if (obj === undefined || obj === null) {
      return {}
    }

    if (typeof (obj) === 'object') {
      return Object.assign({}, obj)
    }
    return obj
  }

  fn.toDateX = function (_time) {
    let date_time = new Date(_time)
    return date_time.getFullYear() + '-' + (date_time.getMonth() + 1) + '-' + date_time.getDate();
  }

  fn.toDateOnly = function (_time) {
    let date_time = new Date(_time);
    return new Date(date_time.getFullYear(), date_time.getMonth(), date_time.getDate())
  }
  fn.toDateTime = function (_time) {
    let date_time = new Date(_time);
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

  fn.toHtmlTable = function (obj) {
    if (obj === undefined || obj === null) {
      return ''
    }
    let table = '<table>'


    for (let index = 0; index < Object.getOwnPropertyNames(obj).length; index++) {
      let p = Object.getOwnPropertyNames(obj)[index]
      table += '<tr>'
      table += `<td> ${p} </td>`
      table += `<td> ${obj[p]} </td>`
      table += '</tr>'
    }

    table += '</table>'
    return table

  }

  fn.objectDiff = function (obj1, obj2) {

    if (obj1 === undefined || obj1 === null || obj2 === undefined || obj2 === null) {
      return obj1
    }


    if (site.typeOf(obj1) === 'Object') {
      let obj3 = {}
      for (let index = 0; index < Object.getOwnPropertyNames(obj1).length; index++) {
        let p = Object.getOwnPropertyNames(obj1)[index]
        if (site.typeOf(obj1[p]) === 'Object' || site.typeOf(obj1[p]) === 'Array') {
          obj3[p] = fn.objectDiff(obj1[p], obj2[p])
          if (site.typeOf(obj3[p]) === 'Array') {
            for (let i2 = 0; i2 < obj3[p].length; i2++) {

              if (obj3[p][i2] === null || obj3[p][i2] === undefined) {
                obj3[p].splice(i2, 1)
              }
            }
            if (obj3[p].length === 0) {
              delete obj3[p]
            }

          } else if (site.typeOf(obj3[p]) === 'Object' && Object.getOwnPropertyNames(obj3[p]).length === 0) {
            delete obj3[p]
          } else if (obj3[p] === undefined || obj3[p] === null) {
            delete obj3[p]
          }
        } else {
          if (obj1[p] != obj2[p]) {
            obj3[p] = obj1[p]
          }
        }
      }
      return obj3
    } else if (site.typeOf(obj1) === 'Array') {
      let obj3 = []
      if (site.typeOf(obj2) === 'Array') {
        for (let i = 0; i < obj1.length; i++) {
          if (site.typeOf(obj1[i]) === 'Object' || site.typeOf(obj1[i]) === 'Array') {
            obj3.push(fn.objectDiff(obj1[i], obj2[i]))
            if (site.typeOf(obj3[i]) === 'Array') {
              for (let i2 = 0; i2 < obj3[i].length; i2++) {
                if (obj3[i][i2] === undefined || obj3[i][i2] === null) {
                  obj3[i].splice(i2, 1)
                }
              }
              if (obj3[i].length === 0) {
                delete obj3[i]
              }

            } else if (site.typeOf(obj3[i]) === 'Object' && Object.getOwnPropertyNames(obj3[i]).length === 0) {
              delete obj3[i]
            } else if (obj3[i] === undefined || obj3[i] === null) {
              delete obj3[i]
            }
          } else {
            if (obj1[i] !== undefined && obj1[i] !== null && obj1[i] != obj2[i]) {
              obj3.push(obj1[i])
            }
          }
        }

        return obj3
      } else {
        return obj1
      }
    }
    return obj3
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

  fn.censor = function (censor) {
    var i = 0;

    return function (key, value) {
      if (i !== 0 && typeof (censor) === 'object' && typeof (value) == 'object' && censor == value)
        return '[Circular]';

      if (i >= 29)
        return '[Unknown]';

      ++i;

      return value;
    }
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