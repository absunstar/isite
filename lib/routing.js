module.exports = function init(site) {

  let routing = function () {}

  routing.list = []

  routing.endResponse = function (req, res) {
    let route = req.route

    if (route.empty) {
      if (site.options.help) {
        res.set('help-error-message', 'route is empty')
      }
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

    let hash = site.md5(req.content)
    let last_modified = new Date().toUTCString()
    if (route.stat) {
      last_modified = new Date(route.stat.mtimeMs).toUTCString()
    }

    if (req.headers["if-none-match"] == hash) {
      if (site.options.help) {
        res.set('help-info-message', 'etag matched')
      }
      res.status(304).end(null)
      return
    }
    if (site.options.help) {
      res.set('help-info-etag', hash)
    }

    res.set("ETag", hash)

    if (site.options.cache.enabled) {
      res.set("Last-Modified", last_modified)
    }

    if (route.path.endsWith(".css")) {
      res.set("Content-Type", "text/css")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.css)

      res.end(req.content, encode)
    } else if (route.path.endsWith(".js")) {
      res.set("Content-Type", "application/javascript")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.js)

      res.end(req.content, encode)
    } else if (route.path.endsWith(".html")) {
      res.set("Content-Type", "text/html")
      if (site.options.cache.enabled && route.cache)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.html)

      res.end(req.content, encode)
    } else if (route.path.endsWith(".json")) {
      res.set("Content-Type", "application/json")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.json)

      res.end(req.content, encode)
    } else if (route.path.endsWith(".xml")) {
      res.set("Content-Type", "text/xml")
        (site.options.cache.enabled)
      res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.xml)

      res.end(req.content, encode)
    } else if (route.path.endsWith(".woff2")) {
      res.set("Content-Type", "application/font-woff2")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)

      res.end(req.content, encode)
    } else if (route.path.endsWith(".woff")) {
      res.set("Content-Type", "application/font-woff")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)

      res.end(req.content, encode)
    } else if (route.path.endsWith(".ttf")) {
      res.set("Content-Type", "application/font-ttf")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)

      res.end(req.content, encode)
    } else if (route.path.endsWith(".svg")) {
      res.set("Content-Type", "application/font-svg")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)

      res.end(req.content, encode)
    } else if (route.path.endsWith(".otf")) {
      res.set("Content-Type", "application/font-otf")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)

      res.end(req.content, encode)
    } else if (route.path.endsWith(".eot")) {
      res.set("Content-Type", "application/font-eot")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.fonts)

      res.end(req.content, encode)
    }else if (route.path.endsWith(".gif")) {
      res.set("Content-Type", "image/gif")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)

      res.end(req.content, encode)
    }  else if (route.path.endsWith(".png")) {
      res.set("Content-Type", "image/png")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)

      res.end(req.content, encode)
    } else if (route.path.endsWith(".jpg")) {
      res.set("Content-Type", "image/jpg")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)

      res.end(req.content, encode)
    } else if (route.path.endsWith(".jpeg")) {
      res.set("Content-Type", "image/jpeg")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)

      res.end(req.content, encode)
    } else if (route.path.endsWith(".ico")) {
      res.set("Content-Type", "image/ico")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)

      res.end(req.content, encode)
    } else if (route.path.endsWith(".bmp")) {
      res.set("Content-Type", "image/bmp")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)

      res.end(req.content, encode)
    } else if (route.path.endsWith(".txt")) {
      res.set("Content-Type", "plan/text")
      if (site.options.cache.enabled)
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.txt)

      res.end(req.content, encode)
    } else {

      res.end(req.content, encode)
    }
  }

  routing.defaultCallback = function (req, res) {
    let route = req.route

    if (route.cache && route.content) {
      if (site.options.help) {
        res.set("help-info-content", "From Route Memory")
      }

      res.code = 200
      routing.endResponse(req, res)
      return
    }

    if (route.empty) {
      res.code = 404
      routing.endResponse(req, res)
      return
    }

    if (!route.path) {
      if (site.options.help) {
        res.set("help-info-content", "Route Not Set File Path")
      }
      res.code = 200
      routing.endResponse(req, res)
      return
    }

    if (typeof route.path == "string") {
      site.readFile(route.path, function (err, data, file) {
        if (!err) {
          route.content = data.toString("utf8")
          route.stat = file.stat
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

          if (site.options.help) {
            res.set("help-info-content", "Route Read File")
          }

          res.code = 200
          routing.endResponse(req, res)
        } else {
          if (site.options.help) {
            res.set("help-error", "Route Error Read File")
          }

          res.code = 404
          route.empty = true
          routing.endResponse(req, res)
          return
        }
      })
    } else if (typeof route.path == "object") {
      site.readFiles(route.path, function (err, data) {
        if (!err) {
          if (site.options.help) {
            res.set("help-info-content", "Route Read Files")
          }

          route.content = data.toString("utf8")
          res.code = 200
          route.path = route.path.join("&&")
          routing.endResponse(req, res)
        } else {
          if (site.options.help) {
            res.set("help-error", "Route Error Read Files")
          }

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

  routing.handleServer = function (req, res) {

    req.obj = {}
    req.query = {}
    req.queryRaw = {}
    req.data = req.body = {}
    req.bodyRaw = ''
    req.params = {}
    req.paramsRaw = {}

    req.acceptEncoding = req.headers['accept-encoding'] ? req.headers['accept-encoding'] : ''
    res.ip = req.ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : req.socket.remoteAddress.replace("::ffff:", "")
    res.ip2 = req.ip2 = req.socket.localAddress.replace("::ffff:", "")
    res.port = req.port = req.socket.remotePort
    res.port2 = req.port2 = req.socket.localPort
    res.cookies = res.cookie = req.cookies = req.cookie = site.cookie(req, res, site)

    req.urlRaw = req.url
    req.urlParserRaw = site.url.parse(req.urlRaw, true)
    req.urlParser = site.url.parse(req.urlRaw.toLowerCase(), true)


    res.set = function (a, b, c) {
      if (res.writeHeadEnabled === false || res.finished === true || res.headersSent) {
        return res
      }
      if (typeof b == 'string') {
        res.headers = res.headers || []
        res.headers[a] = b.toLowerCase()
      }


      res.setHeader(a, b, c)
      return res
    }
    res.delete = res.remove = res.removeHeader;
    res.writeHead0 = res.writeHead
    res.writeHeadEnabled = true
    res.writeHead = (code, obj) => {
      if (res.writeHeadEnabled === false || res.finished === true) {
        return res
      }
      res.cookie.write()
      res.writeHeadEnabled = false
      res.writeHead0(code, obj)
      return res
    }

    res.ending = (data, time) => {
      if (time === undefined) {
        time = 0
      }
      setTimeout(function () {
        res.end(data)
      }, time)
    }


    res.end0 = res.end
    res.end = function (arg1, arg2, arg3, arg4) {
      if (typeof arg1 === 'number') {
        res.writeHead(arg1)
        return res.end0()
      } else {
        if (arg1 && res.headers && res.headers['Content-Type'] && (
            res.headers['Content-Type'].like('*text/css*') ||
            res.headers['Content-Type'].like('*application/javascript*') ||
            res.headers['Content-Type'].like('*text/html*') ||
            res.headers['Content-Type'].like('*text/plain*') ||
            res.headers['Content-Type'].like('*application/json*')
          )) {
          if (req.acceptEncoding.match(/\bdeflate\b/) && typeof arg1 === 'string') {
            res.set('Content-Encoding', 'deflate')
            res.set('Vary', 'Accept-Encoding')
            arg1 = site.zlib.deflateSync(new Buffer(arg1))
          } else if (req.acceptEncoding.match(/\bgzip\b/) && typeof arg1 === 'string') {
            res.set('Content-Encoding', 'gzip')
            res.set('Vary', 'Accept-Encoding')
            arg1 = site.zlib.gzipSync(new Buffer(arg1))
          } else {
            console.log(typeof arg1)
          }
        }
       
        if (res.headers === undefined || res.headers['Content-Type'] === undefined) {
          res.set('Content-Type', 'text/plain')
        }

        res.writeHead(res.code || res.statusCode || 200)
        arg1 = arg1 || ' '
        return res.end0(arg1, arg2, arg3, arg4)

      }


    }

    res.status = code => {
      res.code = code || 200
      return res
    }

    res.error = code => {
      res.status(code || 404).end()
    }

    res.download = (path, name) => {
      if (site.isFileExistsSync(path)) {
        var stat = site.fileStatSync(path)
        if (stat && stat.isFile()) {
          res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Length": stat.size,
            "Content-Disposition": "attachment; filename=" + (name || site.path.basename(path))
          })
          var readStream = site.fs.createReadStream(path)
          readStream.pipe(res)
        } else {
          res.error()
        }
      } else {
        res.error()
      }
    }

    res.html = res.render = function (name, _data) {
      site.html(name, (err, content) => {
        if (!err) {
          req.route.content = content
          req.data = _data || {}
          req.route.parser = "html css"
          let out = site.parser(req, res, site, req.route).html(req.route.content)
          res.set("Content-Type", "text/html")
          res.status(200).end(out)
        } else {
          res.set("Content-Type", "text/html")
          res.status(404).end()
        }
      })
    }



    res.css = name => {
      site.css(name, (err, content) => {
        if (!err) {
          req.route.content = content
          req.route.parser = "css"
          let out = site.parser(req, res, site, req.route).css(req.route.content)
          res.set("Content-Type", "text/css")
          res.status(200).end(out)
        } else {
          res.set("Content-Type", "text/css")
          res.status(404).end()
        }
      })
    }

    res.js = name => {
      site.js(name, (err, content) => {
        if (!err) {

          req.route.content = content
          req.route.parser = "js"
          let out = site.parser(req, res, site, req.route).js(req.route.content)
          res.set("Content-Type", "text/javascript")
          res.status(200).end(out)
        } else {
          res.set("Content-Type", "text/javascript")
          res.status(4040).end()
        }
      })
    }

    res.jsonFile = name => {
      site.json(name, (err, content) => {
        if (!err) {
          req.route.content = content
          req.route.parser = "json"
          let out = site.parser(req, res, site, req.route).json(req.route.content)
          res.set("Content-Type", "application/json")
          res.status(200).end(out)
        } else {
          res.set("Content-Type", "application/json")
          res.status(404).end()
        }
      })
    }

    res.htmlContent = res.send = text => {
      if (typeof text === "string") {
        res.set("Content-Type", "text/html")
        res.status(200).end(text)
      } else {
        res.json(text)
      }
    }

    res.json = (obj, time) => {
      if (typeof obj === "string") {
        return res.jsonFile(obj)
      } else {
        res.set("Content-Type", "application/json")
        return res.status(200).ending(site.toJson(obj), time || 0)
      }
    }

    res.redirect = url => {
      res.set('Location', url)
      res.status(302).end()
    }


    res.setHeader("CharSet", "UTF-8")
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Allow-Origin", req.headers.host)
    if(req.headers.origin){
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin)
    }
   





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
          if (site.options.help) {
            res.set('help-request-count', r.count)
          }

        req.route = r

        req.urlParser.arr = req.urlParser.pathname.split("/")
        req.urlParserRaw.arr = req.urlParserRaw.pathname.split("/")

        for (let i = 0; i < req.route.map.length; i++) {
          let map = req.route.map[i]
          req.params[map.name] = req.urlParser.arr[map.index]
          req.paramsRaw[map.name] = req.urlParserRaw.arr[map.index]
        }

        req.query = req.urlParser.query
        req.queryRaw = req.urlParserRaw.query

        if (!req.method.toLowerCase().like("get") &&
          req.headers["content-type"] &&
          req.headers["content-type"].match(/urlencoded/i)
        ) {
          req.on("data", function (data) {
            req.bodyRaw += data
            if (req.bodyRaw.length > 1e6) req.connection.destroy()
          })
          req.on("end", function () {
            req.data = req.body = site.querystring.parse(req.bodyRaw)
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
        } else if (!req.method.toLowerCase().like("get") &&
          req.headers["content-type"] &&
          req.headers["content-type"].match(/json/i)) {

          req.on("data", function (data) {
            req.bodyRaw += data
            if (req.bodyRaw.length > 1e6) req.connection.destroy()
          })
          req.on("end", function () {
            req.data = req.body = site.fromJson(req.bodyRaw)
            if (site.options.session.enabled) {
              site.session(req, res, site, function (session) {
                req.session = session
                r.callback(req, res)
              })
            } else {
              r.callback(req, res)
            }
          })
        } else if (!req.method.toLowerCase().like("get")) {
          req.on("data", function (data) {
            req.bodyRaw += data
            if (req.bodyRaw.length > 1e6) req.connection.destroy()
          })
          req.on("end", function () {
            req.data = req.body = site.fromJson(req.bodyRaw)
            if (site.options.session.enabled) {
              site.session(req, res, site, function (session) {
                req.session = session
                r.callback(req, res)
              })
            } else {
              r.callback(req, res)
            }
          })
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
      if (site.options.help) {
        res.set("help-eror-message", "unhandled route " + req.urlParser.pathname)
      }
      res.htmlContent("<h1 align='center'>Base Route / Not Set</h1>")
      return
    }

    if (site.options.help) {
      res.set("help-eror-message", "unhandled route " + req.urlParser.pathname)
    }

    res.status(404).end()
  }

  routing.start = function (ports, callback) {

    ports = ports || [site.options.port]
    if (site.typeof(ports) == 'Array') {

    } else {
      ports = [ports]
    }

    let port_exists = false
    ports.forEach(p=>{
      if(p === site.options.port){
        port_exists = true
      }
    })

    if(!port_exists){
      ports.push(site.options.port)
    }

 
    //First Function Will Run With Every Request
   
    let apps = []

    ports.forEach((p , i)=>{
      apps[i] = site.http.createServer(routing.handleServer)
      apps[i].listen(p, function () {
        console.log("")
        console.log("-----------------------------------------")
        console.log("    " + site.options.name + " Running on Port : " + p)
        console.log("-----------------------------------------")
        console.log("")
      })
    })
   
    
    if (callback) {
      callback(apps[0])
    }
    return apps[0]

  }

  return routing
}