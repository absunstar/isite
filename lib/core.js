module.exports = function init(site) {
  site.http = require("http")
  site.url = require("url")
  site.fs = require("fs")
  site.path = require("path")
  site.querystring = require("querystring")

  site.copy = function copy(obj) {
    if (typeof obj !== "undefined") {
      return JSON.parse(JSON.stringify(obj))
    }
    return null
  }

  site.getContentType = function(path) {
    if (path.endsWith(".exe")) {
      return "application/octet-stream"
    } else if (path.endsWith(".png")) {
      return "image/png"
    } else if (path.endsWith(".ico")) {
      return "image/ico"
    } else {
      return null
    }
  }
  site.getFileEncode = function(path) {
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

  site.$base64Letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  site.$base64Numbers = []
  for (let $i = 11; $i < 99; $i++) {
    if ($i % 10 !== 0 && $i % 11 !== 0) {
      site.$base64Numbers.push($i)
    }
  }

  site.toBase64 = data => {
    if (typeof data === undefined) {
      return ""
    }
    if (typeof data === "object") {
      data = JSON.stringify(data)
    }
    return Buffer.from(data).toString("base64")
  }
  site.fromBase64 = data => {
    if (typeof data !== "string") {
      return ""
    }
    return Buffer.from(data, "base64").toString()
  }

  site.to123 = data => {
    data = site.toBase64(data)
    let newData = ""

    for (let i = 0; i < data.length; i++) {
      let letter = data[i]
      newData += site.$base64Numbers[site.$base64Letter.indexOf(letter)]
    }

    return newData
  }
  site.from123 = data => {
    let newData = ""
    for (let i = 0; i < data.length; i++) {
      let num = data[i] + data[i + 1]
      let index = site.$base64Numbers.indexOf(parseInt(num))
      newData += site.$base64Letter[index]
      i++
    }
    newData = site.fromBase64(newData)

    return newData
  }
}
