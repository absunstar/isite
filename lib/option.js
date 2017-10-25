exports = module.exports = setOptions

function setOptions(options) {
  let template = {
    port: process.env.port || 80,
    dir: "./site_files",
    name: "Your Site",
    savingTime: 60,
    session: {
      timeout: 60 * 24 * 30,
      enabled: true,
      storage: "mongodb",
      dbName: "sessions",
      userSessionCollection: "user_sessions"
    },
    mongodb: {
      enabled: true,
      url: "127.0.0.1",
      port: "27017",
      userName: null,
      password: null,
      prefix: {
        db: "",
        collection: ""
      }
    },
    security: {
      enabled: true,
      dbName: "security",
      userCollection: "users",
      admin: {
        email: "admin@localhost",
        password: "admin"
      },
      users: []
    },
    cache: {
      enabled: true,
      html: 60 * 24 * 30,      
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

  AllOptions.session = AllOptions.session || template.session
  AllOptions.session.enabled = AllOptions.session.enabled !== undefined ? AllOptions.session.enabled : template.session.enabled
  AllOptions.session.storage = AllOptions.session.storage || template.session.storage
  AllOptions.session.dbName = AllOptions.session.dbName || template.session.dbName
  AllOptions.session.userSessionCollection = AllOptions.session.userSessionCollection || template.session.userSessionCollection

  AllOptions.mongodb = AllOptions.mongodb || template.mongodb
  AllOptions.mongodb.enabled = AllOptions.mongodb.enabled !== undefined ? AllOptions.mongodb.enabled : template.mongodb.enabled
  AllOptions.mongodb.url = AllOptions.mongodb.url || template.mongodb.url
  AllOptions.mongodb.port = AllOptions.mongodb.port || template.mongodb.port
  AllOptions.mongodb.userName = AllOptions.mongodb.userName || template.mongodb.userName
  AllOptions.mongodb.password = AllOptions.mongodb.password || template.mongodb.password
  AllOptions.mongodb.prefix = AllOptions.mongodb.prefix || template.mongodb.prefix
  AllOptions.mongodb.prefix.db = AllOptions.mongodb.prefix.db || template.mongodb.prefix.db
  AllOptions.mongodb.prefix.collection = AllOptions.mongodb.prefix.collection || template.mongodb.prefix.collection

  AllOptions.security = AllOptions.security || template.security
  AllOptions.security.enabled = AllOptions.security.enabled === undefined ? template.security.enabled : AllOptions.security.enabled
  AllOptions.security.dbName = AllOptions.security.dbName || template.security.dbName
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

  return AllOptions
}
