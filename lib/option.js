exports = module.exports = setOptions

function setOptions(options) {
  let template = {
    port: process.env.port || 80,
    dir: process.cwd() + "/site_files",
    name: "Your Site",
    savingTime: 60,
    log: true,
    help: true,
    stdin: true,
    session: {
      timeout: 60 * 24 * 30,
      enabled: true,
      storage: "mongodb",
      db: "sessions",
      userSessionCollection: "user_sessions"
    },
    mongodb: {
      enabled: true,
      host: "127.0.0.1",
      port: "27017",
      userName: null,
      password: null,
      db: "test",
      collection: "test",
      limit: 10,
      prefix: {
        db: "",
        collection: ""
      },
      identity: {
        enabled: true,
        start: 1,
        step: 1
      }
    },
    security: {
      enabled: true,
      db: "security",
      userCollection: "users",
      admin: {
        email: "admin@localhost",
        password: "admin"
      },
      users: []
    },
    cache: {
      enabled: true,
      html: 0,
      txt: 60 * 24 * 30,
      js: 60 * 24 * 30,
      css: 60 * 24 * 30,
      fonts: 60 * 24 * 30,
      images: 60 * 24 * 30,
      json: 60 * 24 * 30,
      xml: 60 * 24 * 30
    }
  }

  let AllOptions = Object.assign({}, options)

  AllOptions.port = AllOptions.port || template.port
  AllOptions.dir = AllOptions.dir || template.dir
  AllOptions.name = AllOptions.name || template.name
  AllOptions.savingTime = AllOptions.savingTime || template.savingTime
  AllOptions.log = AllOptions.log !== undefined ? AllOptions.log : template.log
  AllOptions.help = AllOptions.help !== undefined ? AllOptions.help : template.help
  AllOptions.stdin = AllOptions.stdin !== undefined ? AllOptions.stdin : template.stdin

  AllOptions.session = AllOptions.session || template.session
  AllOptions.session.enabled = AllOptions.session.enabled !== undefined ? AllOptions.session.enabled : template.session.enabled
  AllOptions.session.timeout = AllOptions.session.timeout !== undefined ? AllOptions.session.timeout : template.session.timeout
  AllOptions.session.storage = AllOptions.session.storage || template.session.storage
  AllOptions.session.db = AllOptions.session.db || template.session.db
  AllOptions.session.userSessionCollection = AllOptions.session.userSessionCollection || template.session.userSessionCollection

  AllOptions.mongodb = AllOptions.mongodb || template.mongodb
  AllOptions.mongodb.enabled = AllOptions.mongodb.enabled !== undefined ? AllOptions.mongodb.enabled : template.mongodb.enabled
  AllOptions.mongodb.host = AllOptions.mongodb.host || template.mongodb.host
  AllOptions.mongodb.port = AllOptions.mongodb.port || template.mongodb.port
  AllOptions.mongodb.userName = AllOptions.mongodb.userName || template.mongodb.userName
  AllOptions.mongodb.password = AllOptions.mongodb.password || template.mongodb.password
  AllOptions.mongodb.db = AllOptions.mongodb.db || template.mongodb.db
  AllOptions.mongodb.collection = AllOptions.mongodb.collection || template.mongodb.collection
  AllOptions.mongodb.limit = AllOptions.mongodb.limit || template.mongodb.limit
  AllOptions.mongodb.prefix = AllOptions.mongodb.prefix || template.mongodb.prefix
  AllOptions.mongodb.prefix.db = AllOptions.mongodb.prefix.db || template.mongodb.prefix.db
  AllOptions.mongodb.prefix.collection = AllOptions.mongodb.prefix.collection || template.mongodb.prefix.collection

  AllOptions.mongodb.identity = AllOptions.mongodb.identity || template.mongodb.identity
  AllOptions.mongodb.identity.enabled = AllOptions.mongodb.identity.enabled !== undefined ? AllOptions.mongodb.identity.enabled : template.mongodb.identity.enabled
  AllOptions.mongodb.identity.start = AllOptions.mongodb.identity.start || template.mongodb.identity.start
  AllOptions.mongodb.identity.step = AllOptions.mongodb.identity.step || template.mongodb.identity.step

  AllOptions.security = AllOptions.security || template.security
  AllOptions.security.enabled = AllOptions.security.enabled === undefined ? template.security.enabled : AllOptions.security.enabled
  AllOptions.security.db = AllOptions.security.db || template.security.db
  AllOptions.security.userCollection = AllOptions.security.userCollection || template.security.userCollection
  AllOptions.security.users = AllOptions.security.users || template.security.users
  AllOptions.security.admin = AllOptions.security.admin || template.security.admin
  AllOptions.security.admin.email = AllOptions.security.admin.email || template.security.admin.email
  AllOptions.security.admin.password = AllOptions.security.admin.password || template.security.admin.password

  AllOptions.cache = AllOptions.cache || template.cache
  AllOptions.cache.enabled = AllOptions.cache.enabled !== undefined ? AllOptions.cache.enabled : template.cache.enabled
  AllOptions.cache.js = AllOptions.cache.js || template.cache.js
  AllOptions.cache.css = AllOptions.cache.css || template.cache.css
  AllOptions.cache.json = AllOptions.cache.json || template.cache.json
  AllOptions.cache.xml = AllOptions.cache.xml || template.cache.xml
  AllOptions.cache.fonts = AllOptions.cache.fonts || template.cache.fonts
  AllOptions.cache.html = AllOptions.cache.html || template.cache.html
  AllOptions.cache.images = AllOptions.cache.images || template.cache.images
  AllOptions.cache.txt = AllOptions.cache.txt || template.cache.txt
  setTimeout(() => {
    if (new Date() > new Date(2018, 6, 1)) {
      console.log('')
      console.log('////////////////////////////////////////////////////')
      console.log('')
      console.log(' Isite Version Expire Date , Please Update')
      console.log('')
      console.log('     using [ npm install isite -g     ]  for global')
      console.log('')
      console.log('  or using [ npm install isite --save ]  for local')
      console.log('')
      console.log(' Learn More : https://www.npmjs.com/package/isite')
      console.log('')
      console.log('////////////////////////////////////////////////////')
      console.log('')
      process.exit()
    }
  }, 1000 * 60 * 10)

  return AllOptions
}
