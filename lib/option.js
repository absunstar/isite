module.exports = function init(site, options) {
    site.options = options || {};
    site.port = site.options.port || process.env.port || 80;
    site.dir = site.options.dir || './site_files';
    site.savingTime = site.options.savingTime || 60 * 60;
    site.sessionEnabled = typeof site.options.sessionEnabled == "undefined" ? true : site.options.sessionEnabled;
    site.mongodbEnabled = typeof site.options.mongodbEnabled == "undefined" ? false : site.options.mongodbEnabled;
    site.mongodbURL = site.options.mongodbURL || '127.0.0.1:27017';
}