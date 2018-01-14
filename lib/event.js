const events = function () {}

events.list = [];

events.on = function (name, callback) {
  events.list.push({
    name: name,
    callback: callback || function(){}
  });
};

events.call = function (name, args , callback2) {
  if(args && args.length === 1){
    args = args[0]
  }
  for (var i = 0; i < events.list.length; i++) {
    var ev = events.list[i];
    if (ev.name == name) {
      ev.callback(args , callback2);
    }
  }
};

module.exports = events