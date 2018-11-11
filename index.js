module.exports = function init(options) {

  const site = function () {}


  site.http = require("http")
  site.url = require("url")
  site.fs = require("fs")
  site.path = require("path")
  site.zlib = require("zlib")
  site.querystring = require("querystring")
  site.formidable = require("formidable")
  site.mv = require("mv")
  site.$ = site.cheerio = require("cheerio")


  site.require = function (file_path) {
    return require(file_path)(site)
  }


  require("./lib/prototype.js")

  site.fn = require("./lib/fn.js")(site)
  site.copy = site.fn.copy
  site.toNumber = site.fn.toNumber

  site.toDateTime = site.fn.toDateTime
  site.toDateOnly = site.toDate = site.fn.toDateOnly

  site.toDateX = site.fn.toDateX
  site.toDateXT = site.fn.toDateXT
  site.toDateXF = site.fn.toDateXF
  site.toDateT = site.fn.toDateT
  site.toDateF = site.fn.toDateF

  site.fromJson = site.fn.fromJson
  site.toJson = site.fn.toJson
  site.from123 = site.fn.from123
  site.fromBase64 = site.fn.fromBase64
  site.to123 = site.fn.to123
  site.toBase64 = site.fn.toBase64
  site.getContentType = site.fn.getContentType
  site.getFileEncode = site.fn.getFileEncode
  site.typeof = site.typeOf = site.fn.typeOf
  site.objectDiff = site.fn.objectDiff
  site.toHtmlTable = site.fn.toHtmlTable

  const event = require("./lib/event.js")
  site.call = event.call
  site.on = event.on

  const option = require("./lib/option.js")(options, site)
  site.options = option
  site.port = option.port
  site.dir = option.dir

  site.log = function (data, title) {
    if (site.options.log) {
      title = title || ''
      console.log('')
      console.log('================ ' + title + ' ================')
      console.log('')
      console.log(data)
      console.log('')
      console.log('================ END')
      console.log('')
    }

  }

  if (site.options.stdin) {

    if (process.stdin && process.stdin.resume) {
      process.stdin.resume()
    }


    process.on('uncaughtException', (err) => {
      console.log(err)
    })
    /* when app close */
    process.on('exit', (code) => {
      console.log('----------------------------------------')
      console.log('')
      console.log('       ' + site.options.name + ` Closed `)
      console.log('')
      console.log('----------------------------------------')
    })
    /* when ctrl + c */
    process.on('SIGINT', (code) => {
      site.call('please close mongodb', null, () => {
        process.exit()
      })
    })

    process.on('SIGTERM', (code) => {
      site.call('please close mongodb', null, () => {
        process.exit()
      })
    })

    process.on('unhandledRejection', (reason, p) => {
      console.log('Unhandled Rejection at:', p, 'reason:', reason);
    })
    process.on('warning', (warning) => {
      console.warn(warning.name)
      console.warn(warning.message)
      console.warn(warning.stack)
    })


  }
  site.fsm = require("./lib/fsm.js")(site)

  site.fileList = site.fsm.list
  site.fileStatSync = site.fsm.statSync
  site.fileStat = site.fsm.stat

  site.css = site.fsm.css
  site.xml = site.fsm.xml
  site.js = site.fsm.js
  site.json = site.fsm.json
  site.html = site.fsm.html


  site.download = site.fsm.download
  site.downloadFile = site.fsm.downloadFile

  site.isFileExists = site.fsm.isFileExists
  site.isFileExistsSync = site.fsm.isFileExistsSync

  site.readFile = site.fsm.readFile
  site.readFiles = site.fsm.readFiles
  site.readFileSync = site.fsm.readFileSync

  site.writeFile = site.fsm.writeFile
  site.writeFileSync = site.fsm.writeFileSync

  site.removeFile = site.deleteFile = site.fsm.deleteFile
  site.removeFileSync = site.deleteFileSync = site.fsm.deleteFileSync

  site.createDir = site.mkDir = site.fsm.mkDir
  site.createDirSync = site.mkdirSync = site.fsm.mkdirSync

  site.storage = require("./lib/storage.js")(site).fn

  const routing = require("./lib/routing.js")(site)
  site.get = routing.get
  site.post = routing.post
  site.put = routing.put
  site.delete = routing.delete
  site.all = routing.all
  site.run = site.start = site.listen = routing.start
  site.routing = routing


  site.words = require("./lib/words.js")(site)
  site.words.add({
    name: 'user_name',
    en: 'User Name',
    ar: 'أسم المستخدم'
  })
  site.words.addList(site.dir + '/json/words.json')


  site.setting = require("./lib/setting.js")(site)
  site.setting.set({
    name: 'loaded',
    value: true
  })
  site.setting.addList(site.dir + '/json/setting.json')



  require("./lib/vars.js")(site)




  //DataBase Management Oprations
  if (site.options.mongodb.enabled) {
    let mongodb = require("./lib/mongodb.js")
    site.mongodb = mongodb(site)

    let collection = require("./lib/collection")
    site.connectCollection = function (option, db) {
      return collection(site, option, db)
    }
  }

  if (site.options.security.enabled) {
    site.security = require("./lib/security.js")(site)
  }

  site.cookie = require("./lib/cookie.js")

  site.sessions = require("./lib/sessions")(site)
  site.session = require("./lib/session.js")


  site.parser = require("./lib/parser.js")

  site.md5 = site.hash = require("md5")


  site.ips = [] // all ip send requests [ip , requets count]
  site.logs = [] // all log Messages if logEnabled = true

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

  site.on("[any] [saving data]", function () {
    console.log("Saving Data :: " + site.options.saving_time + " Minute ")
  })

  setInterval(function () {
    site.call("[any] [saving data]")
  }, site.options.saving_time * 1000 * 60)


  site.dashboard = require(__dirname + "/lib/dashboard.js")
  site.dashboard(site)

  site.apps = []
  site.importApp = function (app_path) {

    if (site.isFileExistsSync(app_path + '/site_files/json/words.json')) {
      site.words.addList(app_path + '/site_files/json/words.json')
    }

    if (site.isFileExistsSync(app_path + '/site_files/json/setting.json')) {
      site.setting.addList(app_path + '/site_files/json/setting.json')
    }

    if (site.isFileExistsSync(app_path + '/site_files/json/vars.json')) {
      site.addVars(app_path + '/site_files/json/vars.json')
    }

    if (site.isFileExistsSync(app_path + '/site_files/json/permissions.json')) {
      site.security.addPermissions(app_path + '/site_files/json/permissions.json')
    }

    if (site.isFileExistsSync(app_path + '/site_files/json/roles.json')) {
      site.security.addRoles(app_path + '/site_files/json/roles.json')
    }

    if (site.isFileExistsSync(app_path + '/libs/notifications.js')) {
      require(app_path + '/libs/notifications.js')(site)
    }

    if (site.isFileExistsSync(app_path + '/app.js')) {
      site.apps.push({
        name: app_path.split('/').pop(),
        path: app_path
      })
      let app = require(app_path + '/app.js')
      return app(site)
    }

  }




  site.loadApp = function (name) {

    let app_path = site.options.apps_dir + '/' + name
    return site.importApp(app_path)

  }

  site.loadLocalApp = function (name) {
    site.importApp(__dirname + '/apps/' + name)
  }

  if (site.options.apps === true) {
    if (site.isFileExistsSync(site.options.apps_dir) && site.fs.lstatSync(site.options.apps_dir).isDirectory()) {
      site.fs.readdir(site.options.apps_dir, (err, files) => {
        if (!err && files && files.length > 0) {
          site.log('Auto Loading Apps ...')
          files.forEach(file => {
            if (site.fs.lstatSync(site.options.apps_dir + '/' + file).isDirectory()) {
              console.log('Auto Loading App : ' + file)
              site.loadApp(file)
            }
          })
        }
      })
    }
  }

  return site
}