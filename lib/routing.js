module.exports = function init(site) {

  let routing = function () {}

  routing.list = []

  routing.endResponse = function (req, res) {
    let route = req.route

    res.setHeader("x-count", route.count)

    if (route.empty) {
      res.writeHeader(res.code)
      res.end()
      return
    }

    if (route.parser.like("*html*") && route.content && route.content.length > 0) {
      req.content = site.parser(req, res, site, route).html(route.content)
    } else if (route.parser == "css" && route.content && route.content.length > 0) {
      req.content = site.parser(req, res, site, route).css(route.content)
    } else {
      req.content = route.content
    }

    if (route.compress) {
      req.content = req.content.replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ")
    }

    let encode = site.getFileEncode(route.path)

    if (route.path.endsWith(".css")) {
      res.setHeader("Content-Type", "text/css")
      if (site.options.cache.enabled)
        res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.css)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".js")) {
      res.setHeader("Content-Type", "application/javascript")
      if (site.options.cache.enabled)
        res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.js)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".html")) {
      res.setHeader("Content-Type", "text/html")
      if (site.options.cache.enabled && route.cache)
        res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.html)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".json")) {
      res.setHeader("Content-Type", "application/json")
      if (site.options.cache.enabled)
        res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.json)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".xml")) {
      res.setHeader("Content-Type", "text/xml")
        (site.options.cache.enabled)
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.xml)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".woff2")) {
      res.setHeader("Content-Type", "application/font-woff2")
      if (site.options.cache.enabled)
        res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".woff")) {
      res.setHeader("Content-Type", "application/font-woff")
      if (site.options.cache.enabled)
        res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".ttf")) {
      res.setHeader("Content-Type", "application/font-ttf")
      if (site.options.cache.enabled)
        res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".svg")) {
      res.setHeader("Content-Type", "application/font-svg")
      if (site.options.cache.enabled)
        res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".otf")) {
      res.setHeader("Content-Type", "application/font-otf")
      if (site.options.cache.enabled)
        res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".eot")) {
      res.setHeader("Content-Type", "application/font-eot")
      if (site.options.cache.enabled)
        res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".png")) {
      res.setHeader("Content-Type", "image/png")
      if (site.options.cache.enabled)
        res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".jpg")) {
      res.setHeader("Content-Type", "image/jpg")
      if (site.options.cache.enabled)
        res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".jpeg")) {
      res.setHeader("Content-Type", "image/jpeg")
      if (site.options.cache.enabled)
        res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".ico")) {
      res.setHeader("Content-Type", "image/ico")
      if (site.options.cache.enabled)
        res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".bmp")) {
      res.setHeader("Content-Type", "image/bmp")
      if (site.options.cache.enabled)
        res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".txt")) {
      res.setHeader("Content-Type", "plan/text")
        (site.options.cache.enabled)
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.txt)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else {
      res.writeHeader(res.code)
      res.end(req.content, encode)
    }
  }

  routing.defaultCallback = function (req, res) {
    let route = req.route

    if (route.cache && route.content) {
      res.setHeader("x-content", "Route memory")
      res.code = 200
      routing.endResponse(req, res)
      return
    }

    if (route.empty) {
      res.setHeader("x-content", "Route Empty")
      res.code = 404
      routing.endResponse(req, res)
      return
    }

    if (!route.path) {
      res.setHeader("x-content", "Route Not Set File Path")
      res.code = 200
      routing.endResponse(req, res)
      return
    }

    if (typeof route.path == "string") {
      site.readFile(route.path, function (err, data) {
        if (!err) {
          route.content = data.toString("utf8")
          if (route.masterPage) {
            for (var i = 0; i < site.masterPages.length; i++) {
              if (route.masterPage == site.masterPages[i].name) {
                route.content =
                  site.readFileSync(site.masterPages[i].header) +
                  route.content +
                  site.readFileSync(site.masterPages[i].footer)
                break
              }
            }
          }
          res.setHeader("x-content", "Route Read File")
          res.code = 200
          routing.endResponse(req, res)
        } else {
          res.setHeader("x-error", "Route Error Read File")
          res.code = 404
          route.empty = true
          routing.endResponse(req, res)
          return
        }
      })
    } else if (typeof route.path == "object") {
      site.readFiles(route.path, function (err, data) {
        if (!err) {
          res.setHeader("x-content", "Route Read Files")
          route.content = data.toString("utf8")
          res.code = 200
          route.path = route.path.join("&&")
          routing.endResponse(req, res)
        } else {
          res.setHeader("x-error", "Route Error Read Files")
          res.code = 404
          route.empty = true
          routing.endResponse(req, res)
          return
        }
      })
    }
  }

  routing.add = function (r, callback) {
    let route = {}

    if (typeof r == "string") {
      route.name = r.toLowerCase()
      route.name0 = r
      route.method = "GET"
      route.path = null
      route.parser = "static"
      route.parserDir = site.dir
      route.cache = true
      route.hide = false
      route.compress = false
      route.map = []
      route.callback = callback || routing.defaultCallback
    } else {
      route.name = r.name.toLowerCase()
      route.name0 = r.name
      route.method = r.method || "GET"
      route.path = r.path || null
      route.content = r.content
      route.parser = r.parser || "static"
      route.parserDir = r.parserDir || site.dir
      route.masterPage = r.masterPage || null
      route.cache = r.cache === undefined ? true : r.cache
      route.hide = r.hide === undefined ? false : r.hide
      route.compress = r.compress === undefined ? false : r.compress
      route.map = r.map || []
      route.callback = r.callback || routing.defaultCallback
    }

    if (!route.name.startsWith("/")) {
      route.name = "/" + route.name
      route.name0 = "/" + route.name0
    }

    route.name = route.name.replace("//", "/")
    route.name0 = route.name0.replace("//", "/")

    let arr = route.name.split("/")
    let arr0 = route.name0.split("/")

    for (var i = 0; i < arr.length; i++) {
      var s = arr[i]
      var s0 = arr0[i]

      if (s.startsWith(":")) {
        arr[i] = "*"
        let name = s.replace(":", "")
        let name0 = s0.replace(":", "")

        route.map.push({
          index: i,
          name: name,
          isLower: false
        })
        if (name !== name0) {
          route.map.push({
            index: i,
            name: name0,
            isLower: true
          })
        }
      }
    }

    route.name = arr.join("/")

    if (typeof route.path == "string" && site.fs.lstatSync(route.path).isDirectory()) {
      site.fs.readdir(route.path, (err, files) => {
        files.forEach(file => {
          var r2 = site.copy(route)
          if (route.name.endsWith("/")) {
            r2.name = route.name + file
          } else {
            r2.name = route.name + "/" + file
          }

          r2.path = route.path + "/" + file
          routing.add(r2)
        })
      })
    } else {
      if (!route.name.startsWith("/")) {
        route.name = "/" + route.name
      }
      routing.list.push(route)
    }
  }

  routing.get = function (r, callback) {
    let route =
      typeof r == "string" ? {
        name: r,
        method: "GET",
        callback: callback || routing.defaultCallback
      } :
      r
    route.method = "GET"
    routing.add(route)
  }

  routing.post = function (r, callback) {
    let route =
      typeof r == "string" ? {
        name: r,
        method: "POST",
        callback: callback || routing.defaultCallback
      } :
      r
    route.method = "POST"
    routing.add(route)
  }

  routing.put = function (r, callback) {
    let route =
      typeof r == "string" ? {
        name: r,
        method: "PUT",
        callback: callback || routing.defaultCallback
      } :
      r
    route.method = "PUT"
    routing.add(route)
  }

  routing.delete = function (r, callback) {
    let route =
      typeof r == "string" ? {
        name: r,
        method: "Delete",
        callback: callback || routing.defaultCallback
      } :
      r
    route.method = "Delete"
    routing.add(route)
  }

  routing.all = function (r, callback) {
    let route =
      typeof r == "string" ? {
        name: r,
        method: "*",
        callback: callback || routing.defaultCallback
      } :
      r
    route.method = "*"
    routing.add(route)
  }

  routing.start = function (port, callback) {
    port = port || site.options.port
    site.options.port = port

    //First Function Will Run With Every Request
    let app = site.http.createServer(function (req, res) {
      req.obj = {}
      req.query = {}
      req.body = {}
      req.params = {}

      res.set = res.setHeader
      res.writeHead0 = res.writeHead
      res.writeHead = (code, obj) => {
        res.cookie.write()
        res.writeHead0(code, obj)
      }

      res.ending = (data, time) => {
        setTimeout(function () {
          res.end(data)
        }, time || 500)
      }

      res.status = code => {
        res.writeHead0(code || 200)
        return res
      }

      res.error = code => {
        res.status(code || 404).end()
      }

      res.download = (path, name) => {
        let fs = site.fs
        var stat = fs.statSync(path)
        if (stat && stat.isFile()) {
          res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Length": stat.size,
            "Content-Disposition": "attachment; filename=" + (name || site.path.basename(path))
          })
          var readStream = fs.createReadStream(path)
          readStream.pipe(res)
        } else {
          res.error()
        }
      }

      res.html = res.render = function (name, _object) {
        site.html(name, (err, content) => {
          if (!err) {
            res.writeHead(200, {
              "content-type": "text/html"
            })
            req.route.content = content

            req.obj = _object || {}
            req.route.parser = "html css"
            let out = site.parser(req, res, site, req.route).html(req.route.content)
            res.end(out)
          } else {
            res.writeHead(404, {
              "content-type": "text/html"
            })
            res.end()
          }
        })
      }

      res.css = name => {
        site.css(name, (err, content) => {
          if (!err) {
            res.writeHead(200, {
              "content-type": "text/css"
            })
            req.route.content = content
            req.route.parser = "css"
            let out = site.parser(req, res, site, req.route).css(req.route.content)
            res.end(out)
          } else {
            res.writeHead(404, {
              "content-type": "text/css"
            })
            res.end()
          }
        })
      }

      res.js = name => {
        site.js(name, (err, content) => {
          if (!err) {
            res.writeHead(200, {
              "content-type": "text/javascript"
            })
            req.route.content = content
            req.route.parser = "js"
            let out = site.parser(req, res, site, req.route).js(req.route.content)
            res.end(out)
          } else {
            res.writeHead(404, {
              "content-type": "text/javascript"
            })
            res.end()
          }
        })
      }

      res.jsonFile = name => {
        site.json(name, (err, content) => {
          if (!err) {
            res.writeHead(200, {
              "content-type": "application/json"
            })
            req.route.content = content
            req.route.parser = "json"
            let out = site.parser(req, res, site, req.route).json(req.route.content)
            res.end(out)
          } else {
            res.writeHead(404, {
              "content-type": "application/json"
            })
            res.end()
          }
        })
      }

      res.send = text => {
        if (typeof obj === "string") {
          res.writeHead(200, {
            "content-type": "text/html"
          })
          res.end(text)
        } else {
          res.json(text)
        }
      }

      res.json = (obj, time) => {
        if (typeof obj === "string") {
          res.jsonFile(obj)
        } else {
          res.writeHead(200, {
            "content-type": "application/json"
          })
          res.ending(JSON.stringify(obj), time || 0)
        }
      }

      res.redirect = url => {
        res.writeHead(302, {
          Location: url
        })
        res.end()
      }
      res.setHeader("CharSet", "UTF-8")
      res.setHeader("Access-Control-Allow-Origin", req.headers.host)

      req.query = {}
      req.body = {}
      req.params = {}

      req.ip = req.connection.remoteAddress.replace("::ffff:", "")
      res.cookie = req.cookie = site.cookie(req, res, site)

      req.urlDefault = req.url
      req.urlParserDefault = site.url.parse(req.urlDefault, true)
      req.urlParser = site.url.parse(req.urlDefault.toLowerCase(), true)

      for (let i = 0; i < routing.list.length; i++) {
        let r = routing.list[i]
        if (
          req.method.toLowerCase().like(r.method.toLowerCase()) &&
          req.urlParser.pathname.like(r.name)
        ) {
          if (!r.count) {
            r.count = 0
          }
          r.count++
            req.route = r

          req.urlParser.arr = req.urlParser.pathname.split("/")
          req.urlParserDefault.arr = req.urlParserDefault.pathname.split("/")

          for (let i = 0; i < req.route.map.length; i++) {
            let map = req.route.map[i]
            if (map.name === map.name.toLowerCase()) {
              req.params[map.name] = req.urlParser.arr[map.index]
            } else {
              req.params[map.name] = req.urlParserDefault.arr[map.index]
            }
          }

          req.query = req.urlParser.query

          if (!req.method.toLowerCase().like("get") &&
            req.headers["content-type"] &&
            req.headers["content-type"].match(/urlencoded/i)
          ) {
            req.body = ""
            req.on("data", function (data) {
              req.body += data
              if (req.body.length > 1e6) req.connection.destroy()
            })
            req.on("end", function () {
              req.body = site.querystring.parse(req.body)
              if (site.options.session.enabled) {
                site.session(req, res, site, function (session) {
                  req.session = session
                  r.callback(req, res)
                })
              } else {
                r.callback(req, res)
              }
            })
          } else if (
            req.method.toLowerCase().like("post") &&
            req.headers["content-type"] &&
            req.headers["content-type"].match(/multipart/i)
          ) {
            var form = new site.formidable.IncomingForm()

            form.parse(req, function (err, fields, files) {
              req.files = files
              if (site.options.session.enabled) {
                site.session(req, res, site, function (session) {
                  req.session = session
                  r.callback(req, res)
                })
              } else {
                r.callback(req, res)
              }
            })

            return
          } else {
            if (site.options.session.enabled) {
              site.session(req, res, site, function (session) {
                req.session = session
                r.callback(req, res)
              })
            } else {
              r.callback(req, res)
            }
            return
          }

          return
        }
      }

      if (req.urlParser.pathname == "/") {
        res.setHeader("x-message", "unhandled route")
        res.writeHeader(200)
        res.end("you not handle your route / yet !!")
        return
      }

      res.setHeader("x-message", "unhandled route")
      res.writeHeader(404)
      res.end()
    })

    return app.listen(port, function () {
      console.log("")
      console.log("-----------------------------------------")
      console.log("    " + site.options.name + " Running on Port : " + port)
      console.log("-----------------------------------------")
      console.log("")
      if (callback) {
        callback()
      }
    })
  }

  return routing
}