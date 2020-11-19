
  storage.path = _s_.path.join(_s_.options.cwd, _s_.md5(_s_.options.name) + '.dbz');
  _s_.fs.readFile(storage.path, (err, data) => {
    if (!err) {
      data = _s_.zlib.inflateSync(data);
      storage.list = _s_.fromJson(Buffer.from(data, 'utf-8').toString());

      if (_s_.typeof(storage.list) !== 'Array') {
        storage.list = [];
      }
    } else {
      storage.list = [];
    }
  });

  storage.save = function () {
    let out = _s_.zlib.deflateSync(Buffer.from(_s_.toJson(storage.list), 'utf-8'));
    _s_.fs.writeFile(storage.path, out, (err) => {});
  };

  storage.fn = function (key, value) {
    if (key && value !== undefined) {
      value = _s_.copy(value);
      for (let i = 0; i < storage.list.length; i++) {
        if (key === storage.list[i].key) {
          storage.list[i].value = value;
          storage.save();
          return;
        }
      }
      storage.list.push({
        key: key,
        value: value,
      });
      storage.save();
    } else if (key && value === undefined) {
      for (let i = 0; i < storage.list.length; i++) {
        if (key === storage.list[i].key) {
          return storage.list[i].value;
        }
      }
    } else {
      return null;
    }
  };