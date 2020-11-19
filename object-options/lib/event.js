exports = module.exports = function init(_e_) {
  _e_.events_list = [];
  _e_.quee_list = [];
  _e_.quee_busy_list = [];

  _e_.quee_check = function (name, fire) {
    if (!fire) {
      if (_e_.quee_busy_list[name]) {
        return;
      }
    }
    _e_.quee_busy_list[name] = true;
    let end = false;
    _e_.quee_list.forEach((quee, i) => {
      if (end) {
        return;
      }
      if (quee.name == name) {
        end = true;
        _e_.quee_list.splice(i, 1);
        for (var i = 0; i < _e_.events_list.length; i++) {
          var ev = _e_.events_list[i];
          if (ev.name == name) {
            ev.callback(quee.args, quee.callback2, () => {
              _e_.quee_busy_list[name] = false;
              _e_.quee_check(name, true);
            });
          }
        }
      }
    });
    if (!end) {
      _e_.quee_busy_list[name] = false;
    }
  };

  _e_.on = function (name, callback) {
    if (_e_.typeof(name) == 'Array') {
      name.forEach((n) => {
        _e_.events_list.push({
          name: n,
          callback: callback || function () {},
        });
      });
    } else {
      _e_.events_list.push({
        name: name,
        callback: callback || function () {},
      });
    }
  };

  _e_.call = function (name, args, callback2) {
    if (args && args.length === 1) {
      args = args[0];
    }
    for (var i = 0; i < _e_.events_list.length; i++) {
      var ev = _e_.events_list[i];
      if (ev.name == name) {
        ev.callback(args, callback2);
      }
    }
  };

  _e_.quee = function (name, args, callback2) {
    if (args && args.length === 1) {
      args = args[0];
    }
    _e_.quee_list.push({
      name: name,
      args: args,
      callback2: callback2,
    });

    _e_.quee_check(name);
  };



};
