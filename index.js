module.exports = function init(options) {

  const _s_ = function () {}


  _s_.package = require(__dirname + '/package.json')

  _s_.ready = true
  _s_.http = require("http")
  _s_.https = require("https")
  _s_.url = require("url")
  _s_.fs = require("fs")
  _s_.path = require("path")
  _s_.zlib = require("zlib")
  _s_.querystring = require("querystring")
  _s_.formidable = require("formidable")
  _s_.mv = require("mv")
  _s_.request = require("request")
  _s_.$ = _s_.cheerio = require("cheerio")

  _s_.require = function (file_path) {
    return require(file_path)(_s_)
  }


  require("object-options")(options, _s_)


  _s_.log = function (data, title) {
    if (_s_.options.log) {
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

  if (_s_.options.stdin) {

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
      console.log('       ' + _s_.options.name + ` Closed `)
      console.log('')
      console.log('----------------------------------------')
    })
    /* when ctrl + c */
    process.on('SIGINT', (code) => {
      _s_.call('please close mongodb', null, () => {
        process.exit()
      })
    })

    process.on('SIGTERM', (code) => {
      _s_.call('please close mongodb', null, () => {
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
  _s_.fsm = require("./lib/fsm.js")(_s_)

  _s_.fileList = _s_.fsm.list
  _s_.fileStatSync = _s_.fsm.statSync
  _s_.fileStat = _s_.fsm.stat

  _s_.css = _s_.fsm.css
  _s_.xml = _s_.fsm.xml
  _s_.js = _s_.fsm.js
  _s_.json = _s_.fsm.json
  _s_.html = _s_.fsm.html


  _s_.download = _s_.fsm.download
  _s_.downloadFile = _s_.fsm.downloadFile

  _s_.isFileExists = _s_.fsm.isFileExists
  _s_.isFileExistsSync = _s_.fsm.isFileExistsSync

  _s_.readFile = _s_.fsm.readFile
  _s_.readFiles = _s_.fsm.readFiles
  _s_.readFileSync = _s_.fsm.readFileSync

  _s_.writeFile = _s_.fsm.writeFile
  _s_.writeFileSync = _s_.fsm.writeFileSync

  _s_.removeFile = _s_.deleteFile = _s_.fsm.deleteFile
  _s_.removeFileSync = _s_.deleteFileSync = _s_.fsm.deleteFileSync

  _s_.createDir = _s_.mkDir = _s_.fsm.mkDir
  _s_.createDirSync = _s_.mkdirSync = _s_.fsm.mkdirSync

  _s_.storage = require("./lib/storage.js")(_s_).fn

  const routing = require("./lib/routing.js")(_s_)
  _s_.get = routing.get
  _s_.post = routing.post
  _s_.put = routing.put
  _s_.delete = routing.delete
  _s_.all = routing.all
  _s_.run = _s_.start = _s_.listen = routing.start
  _s_.routing = routing


  _s_.words = require("./lib/words.js")(_s_)
  _s_.words.add({
    name: 'user_name',
    en: 'User Name',
    ar: 'أسم المستخدم'
  })
  _s_.words.addList(_s_.dir + '/json/words.json')


  _s_.setting = require("./lib/setting.js")(_s_)
  _s_.setting.set({
    name: 'loaded',
    value: true
  })
  _s_.setting.addList(_s_.dir + '/json/setting.json')



  require("./lib/vars.js")(_s_)
  require("./lib/features.js")(_s_)



  //DataBase Management Oprations
  if (_s_.options.mongodb.enabled) {
    let mongodb = require("./lib/mongodb.js")
    _s_.mongodb = mongodb(_s_)

    let collection = require("./lib/collection")
    _s_.connectCollection = function (option, db) {
      return collection(_s_, option, db)
    }
  } else {
    _s_.connectCollection = function (option, db) {
      return {
        deleteDuplicate: function () {},
        findOne: function () {},
        get: function () {},
        find: function () {},
        add: function () {},
        update: function () {},
        delete: function () {},
      }
    }
  }

  if (_s_.options.security.enabled) {
    _s_.security = require("./lib/security.js")(_s_)
  }

  _s_.cookie = require("./lib/cookie.js")

  _s_.sessions = require("./lib/sessions")(_s_)
  _s_.session = require("./lib/session.js")


  _s_.parser = require("./lib/parser.js")

  _s_.md5 = _s_.hash = require("md5")


  _s_.ips = [] // all ip send requests [ip , requets count]
  _s_.logs = [] // all log Messages if logEnabled = true

  //Master Pages
  _s_.masterPages = []
  _s_.addMasterPage = function (page) {
    _s_.masterPages.push({
      name: page.name,
      header: page.header,
      footer: page.footer
    })
  }

  _s_.reset = function () {}

  _s_.test = function () {
    console.log(" I_s_ Test OK !! ")
  }

  _s_.on("[any][saving data]", function () {
    console.log("Saving Data :: " + _s_.options.saving_time + " Minute ")
  })

  setInterval(function () {
    _s_.call("[any][saving data]")
  }, _s_.options.saving_time * 1000 * 60)


  _s_.dashboard = require(__dirname + "/lib/dashboard.js")
  _s_.dashboard(_s_)

  _s_.apps = []
  _s_.importApps = function (app_dir) {

    if (_s_.isFileExistsSync(app_dir) && _s_.fs.lstatSync(app_dir).isDirectory()) {
      _s_.fs.readdir(app_dir, (err, files) => {
        if (!err && files && files.length > 0) {
          _s_.log('=== Auto Importing Apps ===')
          files.forEach(file => {
            if (_s_.fs.lstatSync(app_dir + '/' + file).isDirectory()) {
              console.log('===  Importing App : ' + file)
              _s_.importApp(app_dir + '/' + file)
            }
          })
        }
      })
    }
  }
  _s_.importApp = function (app_path, name2) {

    if (_s_.isFileExistsSync(app_path + '/site_files/json/words.json')) {
      _s_.words.addList(app_path + '/site_files/json/words.json')
    }

    if (_s_.isFileExistsSync(app_path + '/site_files/json/setting.json')) {
      _s_.setting.addList(app_path + '/site_files/json/setting.json')
    }

    if (_s_.isFileExistsSync(app_path + '/site_files/json/vars.json')) {
      _s_.addVars(app_path + '/site_files/json/vars.json')
    }

    if (_s_.isFileExistsSync(app_path + '/site_files/json/permissions.json')) {
      _s_.security.addPermissions(app_path + '/site_files/json/permissions.json')
    }

    if (_s_.isFileExistsSync(app_path + '/site_files/json/roles.json')) {
      _s_.security.addRoles(app_path + '/site_files/json/roles.json')
    }

    if (_s_.isFileExistsSync(app_path + '/libs/notifications.js')) {
      require(app_path + '/libs/notifications.js')(_s_)
    }

    if (_s_.isFileExistsSync(app_path + '/app.js')) {
      _s_.apps.push({
        name: app_path.split('/').pop(),
        name2: name2,
        path: app_path
      })
      let app = require(app_path + '/app.js')
      return app(_s_)
    }

  }




  _s_.loadApp = function (name, name2) {

    let app_path = _s_.options.apps_dir + '/' + name
    return _s_.importApp(app_path, name2)

  }

  _s_.loadLocalApp = function (name, name2) {
    _s_.importApp(__dirname + '/apps/' + name, name2)
  }

  if (_s_.options.apps === true) {
    if (_s_.isFileExistsSync(_s_.options.apps_dir) && _s_.fs.lstatSync(_s_.options.apps_dir).isDirectory()) {
      _s_.fs.readdir(_s_.options.apps_dir, (err, files) => {
        if (!err && files && files.length > 0) {
          _s_.log('Auto Loading Apps ...')
          files.forEach(file => {
            if (_s_.fs.lstatSync(_s_.options.apps_dir + '/' + file).isDirectory()) {
              console.log('Auto Loading App : ' + file)
              _s_.loadApp(file)
            }
          })
        }
      })
    }
  }

  _s_.createDir(_s_.options.upload_dir)
  _s_.createDir(_s_.options.download_dir)



  console.log('')
  console.log('************************************')
  console.log(`****** isite version ${_s_.package.version} *******`)
  console.log('************************************')
  console.log('')
  return _s_
}