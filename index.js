module.exports = function init(options) {
  const site = function () {}

  site.http = require("http")
  site.url = require("url")
  site.fs = require("fs")
  site.path = require("path")
  site.querystring = require("querystring")
  site.formidable = require("formidable")
  site.mv = require("mv")


  site.require = function (file_path) {
    return require(file_path)(site)
  }

  require("./lib/prototype.js")

  site.fn = require("./lib/fn.js")(site)
  site.copy = site.fn.copy
  site.fromJson = site.fn.fromJson
  site.toJson = site.fn.toJson
  site.from123 = site.fn.from123
  site.fromBase64 = site.fn.fromBase64
  site.to123 = site.fn.to123
  site.toBase64 = site.fn.toBase64
  site.getContentType = site.fn.getContentType
  site.getFileEncode = site.fn.getFileEncode

  const event = require("./lib/event.js")
  site.call = event.call
  site.on = event.on

  const option = require("./lib/option.js")(options)
  site.options = option
  site.port = option.port
  site.dir = option.dir

  site.log = function (data, title) {
    let _data = site.copy(data)
    let _title = site.copy(title)
    if (site.options.log) {
      title = title || ''
      console.log('')
      console.log('================ ' + _title + ' ================')
      console.log('')
      console.log(_data)
      console.log('')
      console.log('================ END')
      console.log('')
    }

  }

  site.fsm = require("./lib/fsm.js")(site)
  site.fileList = site.fsm.list
  site.createDir = site.fsm.createDir
  site.css = site.fsm.css
  site.xml = site.fsm.xml
  site.js = site.fsm.js
  site.json = site.fsm.json
  site.html = site.fsm.html
  site.deleteFile = site.fsm.deleteFile
  site.removeFile = site.fsm.removeFile
  site.download = site.fsm.download
  site.downloadFile = site.fsm.downloadFile
  site.isFileExists = site.fsm.isFileExists
  site.readFile = site.fsm.readFile
  site.readFiles = site.fsm.readFiles
  site.readFileSync = site.fsm.readFileSync
  site.writeFile = site.fsm.writeFile


  const routing = require("./lib/routing.js")(site)
  site.get = routing.get
  site.post = routing.post
  site.put = routing.put
  site.delete = routing.delete
  site.all = routing.all
  site.run = site.start = site.listen = routing.start
  site.routing = routing


  require("./lib/words.js")(site)
  require("./lib/vars.js")(site)

  //DataBase Management Oprations
  let mongodb = require("./lib/mongodb.js")
  site.mongodb = mongodb(site)

  let collection = require("./lib/collection")
  site.connectCollection = function (option) {
    return collection(site, option)
  }

  if (site.options.security.enabled) {
    site.security = require("./lib/security.js")(site)    
  }

  site.cookie = require("./lib/cookie.js")
  site.session = require("./lib/session.js")
  site.parser = require("./lib/parser.js")

  site.md5 = require("md5")

  site.ips = [] // all ip send requests [ip , requets count]
  site.logs = [] // all log Messages if logEnabled = true

  site.sessions = [] // all sessions info
  site.loadSessions = function (callback) {
    site.mongodb.find({
        dbName: site.options.session.db,
        collectionName: site.options.session.userSessionCollection,
        where: {},
        select: {}
      },
      function (err, sessions) {
        callback(err, sessions)
      }
    )
  }
  site.loadSessions(function (err, sessions) {
    if (!err) {
      site.sessions = sessions
    }
  })
  site.saveSessions = function (callback) {
    site.mongodb.delete({
        dbName: site.options.session.db,
        collectionName: site.options.session.userSessionCollection,
        where: {}
      },
      function (err, result) {
        site.mongodb.insert({
            dbName: site.options.session.db,
            collectionName: site.options.session.userSessionCollection,
            docs: site.sessions
          },
          function (err, docs) {
            callback(err, docs)
          }
        )
      }
    )
  }
  site.on("saveChanges", function () {
    site.saveSessions(function (err, sessions) {
      if (err) {

      } else {

      }
    })
  })

  site.trackSession = function (session) {
    for (var i = 0; i < site.sessions.length; i++) {
      var s = site.sessions[i]
      if (s.accessToken == session.accessToken) {
        session.createdTime = s.createdTime
        session.data = session.data || s.data
        session.lang = session.lang || s.lang || "ar"
        session.theme = session.theme || s.theme || "default"
        session.requestesCount = s.requestesCount + 1

        site.sessions[i] = {
          accessToken: session.accessToken,
          createdTime: session.createdTime,
          modifiedTime: session.modifiedTime,
          data: session.data,
          lang: session.lang,
          theme: session.theme,
          ip: session.ip,
          requestesCount: session.requestesCount
        }
        return session
      }
    }

    session.lang = "ar"
    session.theme = "default"
    session.data = []
    session.requestesCount = 1
    session.createdTime = new Date().getTime()
    site.sessions.push({
      accessToken: session.accessToken,
      createdTime: session.createdTime,
      modifiedTime: session.modifiedTime,
      data: session.data,
      ip: session.ip,
      requestesCount: session.requestesCount
    })
    return session
  }

  //Master Pages
  site.masterPages = []
  site.addMasterPage = function (page) {
    site.masterPages.push({
      name: page.name,
      header: page.header,
      footer: page.footer
    })
  }

  site.reset = function () {}

  site.test = function () {
    console.log(" Isite Test OK !! ")
  }

  site.on("saveChanges", function () {
    console.log("Site saveChanges Event Fire Every " + site.options.savingTime + " minute ")
  })

  setInterval(function () {
    site.call("saveChanges")
  }, site.options.savingTime * 1000 * 60)

  // developer tools
  site.dashboard = require(__dirname + "/lib/dashboard.js")
  site.dashboard(site)

  return site
}