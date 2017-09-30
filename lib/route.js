module.exports = function init(site) {
  site.routeList = []

  site.endResponse = function(req, res) {
    let route = req.route

    res.setHeader("x-count", route.count)

    if (route.empty) {
      res.writeHeader(res.code)
      res.end()
      return
    }

    if (route.parser == "html" && route.content && route.content.length > 0) {
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
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.css)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".js")) {
      res.setHeader("Content-Type", "text/javascript")
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.js)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".html")) {
      res.setHeader("Content-Type", "text/html")
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".json")) {
      res.setHeader("Content-Type", "application/json")
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.json)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".xml")) {
      res.setHeader("Content-Type", "text/xml")
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".woff2")) {
      res.setHeader("Content-Type", "application/font-woff2")
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".woff")) {
      res.setHeader("Content-Type", "application/font-woff")
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".ttf")) {
      res.setHeader("Content-Type", "application/font-ttf")
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".svg")) {
      res.setHeader("Content-Type", "application/font-svg")
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".otf")) {
      res.setHeader("Content-Type", "application/font-otf")
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".eot")) {
      res.setHeader("Content-Type", "application/font-eot")
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".png")) {
      res.setHeader("Content-Type", "image/png")
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".jpg")) {
      res.setHeader("Content-Type", "image/jpg")
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".jpeg")) {
      res.setHeader("Content-Type", "image/jpeg")
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".ico")) {
      res.setHeader("Content-Type", "image/ico")
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".bmp")) {
      res.setHeader("Content-Type", "image/bmp")
      res.setHeader("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else if (route.path.endsWith(".txt")) {
      res.setHeader("Content-Type", "plan/text")
      res.writeHeader(res.code)
      res.end(req.content, encode)
    } else {
      res.writeHeader(res.code)
      res.end(req.content, encode)
    }
  }

  site.defaultCallback = function(req, res) {
    let route = req.route

    if (route.cache && route.content) {
      res.setHeader("x-content", "Route memory")
      res.code = 200
      site.endResponse(req, res)
      return
    }

    if (route.empty) {
      res.setHeader("x-content", "Route Empty")
      res.code = 404
      site.endResponse(req, res)
      return
    }

    if (!route.path) {
      res.setHeader("x-content", "Route Not Set File Path")
      res.code = 200
      site.endResponse(req, res)
      return
    }

    if (typeof route.path == "string") {
      site.readFile(route.path, function(err, data) {
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
          site.endResponse(req, res)
        } else {
          res.setHeader("x-error", "Route Error Read File")
          res.code = 404
          route.empty = true
          site.endResponse(req, res)
          return
        }
      })
    } else if (typeof route.path == "object") {
      site.readFiles(route.path, function(err, data) {
        if (!err) {
          res.setHeader("x-content", "Route Read Files")
          route.content = data.toString("utf8")
          res.code = 200
          route.path = route.path.join("&&")
          site.endResponse(req, res)
        } else {
          res.setHeader("x-error", "Route Error Read Files")
          res.code = 404
          route.empty = true
          site.endResponse(req, res)
          return
        }
      })
    }
  }

  site.addRoute = function(r, callback) {
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
      route.callback = callback || site.defaultCallback
    } else {
      route.name = r.name.toLowerCase()
      route.name0 = r.name
      route.method = r.method || "GET"
      route.path = r.path || null
      route.content = r.content
      route.parser = r.parser || "static"
      route.parserDir = r.parserDir || site.dir
      route.masterPage = r.masterPage || null
      route.cache = typeof r.cache == "undefined" ? true : r.cache
      route.hide = typeof r.hide == "undefined" ? false : r.hide
      route.compress = typeof r.compress == "undefined" ? false : r.compress
      route.map = r.map || []
      route.callback = r.callback || site.defaultCallback
    }

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
          site.addRoute(r2)
        })
      })
    } else {
      if (!route.name.startsWith("/")) {
        route.name = "/" + route.name
      }
      site.routeList.push(route)
    }
  }

  site.get = function(r, callback) {
    let route =
      typeof r == "string"
        ? {
            name: r,
            method: "GET",
            callback: callback || site.defaultCallback
          }
        : r
    route.method = "GET"
    site.addRoute(route)
  }

  site.post = function(r, callback) {
    let route =
      typeof r == "string"
        ? {
            name: r,
            method: "POST",
            callback: callback || site.defaultCallback
          }
        : r
    route.method = "POST"
    site.addRoute(route)
  }

  site.put = function(r, callback) {
    let route =
      typeof r == "string"
        ? {
            name: r,
            method: "PUT",
            callback: callback || site.defaultCallback
          }
        : r
    route.method = "PUT"
    site.addRoute(route)
  }

  site.delete = function(r, callback) {
    let route =
      typeof r == "string"
        ? {
            name: r,
            method: "Delete",
            callback: callback || site.defaultCallback
          }
        : r
    route.method = "Delete"
    site.addRoute(route)
  }

  site.all = function(r, callback) {
    let route =
      typeof r == "string"
        ? {
            name: r,
            method: "*",
            callback: callback || site.defaultCallback
          }
        : r
    route.method = "*"
    site.addRoute(route)
  }

  site.listen = site.run = function(port) {
      if(port){
          site.options.port = port
      }
    //First Function Will Run With Every Request
    let app = site.http.createServer(function(req, res) {
      res.ending = (data, time) => {
        setTimeout(function() {
          res.end(data)
        }, time || 500)
      }

      res.setHeader("CharSet", "UTF-8")
      res.setHeader("Access-Control-Allow-Origin", req.headers.host)

      req.query = {}
      req.body = {}
      req.params = {}

      req.ip = req.connection.remoteAddress.replace("::ffff:", "")
      req.cookie = site.cookie(req, res, site)

      req.urlDefault = req.url
      req.urlParserDefault = site.url.parse(req.urlDefault, true)
      req.urlParser = site.url.parse(req.urlDefault.toLowerCase(), true)

      for (let i = 0; i < site.routeList.length; i++) {
        let r = site.routeList[i]
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
            if(map.name === map.name.toLowerCase()){
                req.params[map.name] = req.urlParser.arr[map.index]
            }else{
                req.params[map.name] = req.urlParserDefault.arr[map.index]
            }
            
          }

          
          req.query = req.urlParser.query

          if (
            !req.method.toLowerCase().like("get") &&
            req.headers["content-type"] &&
            req.headers["content-type"].match(/urlencoded/i)
          ) {
            req.body = ""
            req.on("data", function(data) {
              req.body += data
              if (req.body.length > 1e6) req.connection.destroy()
            })
            req.on("end", function() {
              req.body = site.querystring.parse(req.body)
              if (site.options.session.enabled) {
                site.session(req, res, site, function(session) {
                  req.session = session
                  r.callback(req, res)
                })
              } else {
                r.callback(req, res)
              }
            })
          } else {
            if (site.options.session.enabled) {
              site.session(req, res, site, function(session) {
                req.session = session
                r.callback(req, res)
              })
            } else {
              r.callback(req, res)
            }
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

    return app.listen(site.options.port, function() {
      console.log("")
      console.log("-----------------------------------------")
      console.log(" Isite Running on Port : " + site.options.port)
      console.log("-----------------------------------------")
      console.log("")
    })
  }
}
