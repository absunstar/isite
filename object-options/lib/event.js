exports = module.exports = function init(___0) {
  ___0.events_list = [];
  ___0.quee_list = [];
  ___0.quee_busy_list = [];

  ___0.quee_check = function (name, fire) {
    if (!fire) {
      if (___0.quee_busy_list[name]) {
        return;
      }
    }
    ___0.quee_busy_list[name] = !0;
    let end = !1;
    ___0.quee_list.forEach((quee, i) => {
      if (end) {
        return;
      }
      if (quee.name == name) {
        end = !0;
        ___0.quee_list.splice(i, 1);
        for (var i = 0; i < ___0.events_list.length; i++) {
          var ev = ___0.events_list[i];
          if (ev.name == name) {
            ev.callback(quee.args, quee.callback2, () => {
              ___0.quee_busy_list[name] = !1;
              ___0.quee_check(name, !0);
            });
          }
        }
      }
    });
    if (!end) {
      ___0.quee_busy_list[name] = !1;
    }
  };

  ___0.on = function (name, callback) {
    if (___0.typeof(name) == 'Array') {
      name.forEach((n) => {
        ___0.events_list.push({
          name: n,
          callback: callback || function () {},
        });
      });
    } else {
      ___0.events_list.push({
        name: name,
        callback: callback || function () {},
      });
    }
  };

  ___0.call = function (name, args, callback2) {
    if (args && args.length === 1) {
      args = args[0];
    }
    for (var i = 0; i < ___0.events_list.length; i++) {
      var ev = ___0.events_list[i];
      if (ev.name == name) {
        ev.callback(args, callback2);
      }
    }
  };

  ___0.quee = function (name, args, callback2) {
    if (args && args.length === 1) {
      args = args[0];
    }
    ___0.quee_list.push({
      name: name,
      args: args,
      callback2: callback2,
    });

    ___0.quee_check(name);
  };



};
