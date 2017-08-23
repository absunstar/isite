module.exports = function init(site) {

    site.http = require("http")
    site.url = require("url")
    site.fs = require('fs')
    site.path = require('path');
    site.querystring = require("querystring")

    site.copy = function copy(obj) {
        if (typeof obj !== 'undefined') {
            return JSON.parse(JSON.stringify(obj))
        }
        return null
    }

    site.getContentType = function(path) {

        if (path.endsWith('.exe')) {
            return 'application/octet-stream'
        }else if (path.endsWith('.png')) {
            return 'image/png'
        }else if (path.endsWith('.ico')) {
            return 'image/ico'
        }else{
            return null
        }
       
    }
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