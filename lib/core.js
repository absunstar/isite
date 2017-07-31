module.exports = function init(site) {

    site.http = require("http")
    site.url = require("url")
    site.fs = require('fs')
    site.querystring = require("querystring")



    site.getFileEncode = function(path) {

        if (path.endsWith('.woff2') ||
            path.endsWith('.woff') ||
            path.endsWith('.ttf') ||
            path.endsWith('.svg') ||
            path.endsWith('.otf') ||
            path.endsWith('.png') ||
            path.endsWith('.jpg') ||
            path.endsWith('.jpeg') ||
            path.endsWith('.ico') ||
            path.endsWith('.bmp') ||
            path.endsWith('.eot')) {
            return 'binary';
        }
        return 'utf8'
    }


}