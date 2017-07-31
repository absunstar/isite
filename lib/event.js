module.exports = function init(site) {

    site.events = require('events')

    site.eventEmitter = new site.events.EventEmitter()

    site.on = function(name, callback) {
        site.eventEmitter.on(name, callback)
    }

    site.call = function(name) {
        site.eventEmitter.emit(name)
    }

}