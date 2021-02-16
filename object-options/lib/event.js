exports = module.exports = function init(____0) {
  ____0.events_list = [];
  ____0.quee_list = [];
  ____0.quee_busy_list = [];

  ____0.quee_check = function (name, fire) {
    if (!fire) {
      if (____0.quee_busy_list[name]) {
        return;
      }
    }
    ____0.quee_busy_list[name] = !0;
    let end = !1;
    ____0.quee_list.forEach((quee, i) => {
      if (end) {
        return;
      }
      if (quee.name == name) {
        end = !0;
        ____0.quee_list.splice(i, 1);
        for (var i = 0; i < ____0.events_list.length; i++) {
          var ev = ____0.events_list[i];
          if (ev.name == name) {
            ev.callback(quee.args, quee.callback2, () => {
              ____0.quee_busy_list[name] = !1;
              ____0.quee_check(name, !0);
            });
          }
        }
      }
    });
    if (!end) {
      ____0.quee_busy_list[name] = !1;
    }
  };

  ____0.on = function (name, callback) {
    if (____0.typeof(name) == 'Array') {
      name.forEach((n) => {
        ____0.events_list.push({
          name: n,
          callback: callback || function () {},
        });
      });
    } else {
      ____0.events_list.push({
        name: name,
        callback: callback || function () {},
      });
    }
  };

  ____0.call = function (name, args, callback2) {
    if (args && args.length === 1) {
      args = args[0];
    }
    for (var i = 0; i < ____0.events_list.length; i++) {
      var ev = ____0.events_list[i];
      if (ev.name == name) {
        ev.callback(args, callback2);
      }
    }
  };

  ____0.quee = function (name, args, callback2) {
    if (args && args.length === 1) {
      args = args[0];
    }
    ____0.quee_list.push({
      name: name,
      args: args,
      callback2: callback2,
    });

    ____0.quee_check(name);
  };



};
