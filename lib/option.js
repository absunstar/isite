module.exports = function init(site, options) {

    site.options = options || {}

    site.options.port = site.options.port || process.env.port || 80
    site.dir = site.options.dir = site.options.dir || './site_files'
    site.options.savingTime = site.options.savingTime || 60 // in minutes

    site.options.session = site.options.session || {}
    site.options.session.timeout = site.options.session.timeout || 60 * 24 * 30 // in minutes
    site.options.session.enabled = typeof site.options.session.enabled == "undefined" ? true : site.options.session.enabled
    site.options.session.storage = site.options.session.storage || 'mongodb'
    site.options.session.dbName = site.options.session.dbName || 'sessions'
    site.options.session.userSessionCollection = site.options.session.userSessionCollection || 'user_sessions'

    site.options.mongodb = site.options.mongodb || {}
    site.options.mongodb.enabled = typeof site.options.mongodb.enabled == "undefined" ? true : site.options.mongodb.enabled
    site.options.mongodb.url = site.options.mongodb.url || '127.0.0.1'
    site.options.mongodb.port = site.options.mongodb.port || '27017'
    site.options.mongodb.userName = site.options.mongodb.userName || null
    site.options.mongodb.password = site.options.mongodb.password || null

    site.options.security = site.options.security || {}
    site.options.security.enabled = typeof site.options.security.enabled == "undefined" ? true : site.options.security.enabled
    site.options.security.dbName = site.options.security.dbName || 'security'
    site.options.security.userCollection = site.options.security.userCollection || 'users'

}