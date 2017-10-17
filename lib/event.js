
const event = function() {}

const events = require("events")

event.eventEmitter = new events.EventEmitter()

event.on = function(name, callback) {
  event.eventEmitter.on(name, callback)
}

event.call = function(name) {
  event.eventEmitter.emit(name)
}

module.exports = event