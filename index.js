module.exports = function init(options) {
  const site = function() {}

  site.http = require("http")
  site.url = require("url")
  site.fs = require("fs")
  site.path = require("path")
  site.querystring = require("querystring")
  site.formidable = require("formidable")
  site.mv = require("mv")

  site.require = function(file_path){
    return require(file_path)(site)
  }

  require("./lib/prototype.js")

  const fn = require("./lib/fn.js")
  fn.site = site
  site.copy = fn.copy
  site.from123 = fn.from123
  site.fromBase64 = fn.fromBase64
  site.to123 = fn.to123
  site.toBase64 = fn.toBase64
  site.getContentType = fn.getContentType
  site.getFileEncode = fn.getFileEncode

  const event = require("./lib/event.js")
  site.call = event.call
  site.on = event.on

  const option = require("./lib/option.js")(options)
  site.options = option
  site.port = option.port
  site.dir = option.dir

  const fsm = require("./lib/fsm.js")
  fsm.dir = site.dir
  site.fsm = fsm
  site.fileList = fsm.fileList
  site.createDir = fsm.createDir
  site.css = fsm.css
  site.xml = fsm.xml
  site.js = fsm.js
  site.json = fsm.json
  site.html = fsm.html
  site.deleteFile = fsm.deleteFile
  site.removeFile = fsm.removeFile
  site.download = fsm.download
  site.downloadFile = fsm.downloadFile
  site.isFileExists = fsm.isFileExists
  site.readFile = fsm.readFile
  site.readFiles = fsm.readFiles
  site.readFileSync = fsm.readFileSync
  site.writeFile = fsm.writeFile

  
  const routing = require( "./lib/routing.js")
  routing(site)
 
  require("./lib/words.js")(site)
  require("./lib/vars.js")(site)

  //DataBase Management Oprations
  let mongodb = require( "./lib/mongodb.js")
  site.mongodb = mongodb(site)

  let collection = require("./lib/collection")
  site.connectCollection = function(option){
    return collection(site , option)
  }

  if (site.options.security.enabled) {
    let security = require( "./lib/security.js")
   site.security = security(site)
    site.security.loadUsers(function(err, users) {
      site.security.users = users
    })
  }

  site.cookie = require("./lib/cookie.js")
  site.session = require("./lib/session.js")
  site.parser = require("./lib/parser.js")

  site.md5 = require("md5")

  site.ips = [] // all ip send requests [ip , requets count]
  site.logs = [] // all log Messages if logEnabled = true

  site.sessions = [] // all sessions info
  site.loadSessions = function(callback) {
    site.mongodb.find(
      {
        dbName: site.options.session.dbName,
        collectionName: site.options.session.userSessionCollection,
        where: {},
        select: {}
      },
      function(err, sessions) {
        callback(err, sessions)
      }
    )
  }
  site.loadSessions(function(err, sessions) {
    if (!err) {
      site.sessions = sessions
    }
  })
  site.saveSessions = function(callback) {
    site.mongodb.delete(
      {
        dbName: site.options.session.dbName,
        collectionName: site.options.session.userSessionCollection,
        where: {}
      },
      function(err, result) {
        site.mongodb.insert(
          {
            dbName: site.options.session.dbName,
            collectionName: site.options.session.userSessionCollection,
            docs: site.sessions
          },
          function(err, docs) {
            callback(err, docs)
          }
        )
      }
    )
  }
  site.on("saveChanges", function() {
    site.saveSessions(function(err, sessions) {
      if (err) {
      
      } else {
       
      }
    })
  })

  site.trackSession = function(session) {
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
  site.addMasterPage = function(page) {
    site.masterPages.push({
      name: page.name,
      header: page.header,
      footer: page.footer
    })
  }

  site.reset = function() {}

  site.test = function() {
    console.log(" Isite Test OK !! ")
  }

  site.on("saveChanges", function() {
    console.log("Site Will Save Changes Every " + site.options.savingTime + " minute ")
  })

  setInterval(function() {
    site.call("saveChanges")
  }, site.options.savingTime * 1000 * 60)

  // developer tools
  site.dashboard = require(__dirname + "/lib/dashboard.js")
  site.dashboard(site)

  return site
}
