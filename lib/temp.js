
  storage.path = ___0.path.join(___0.options.cwd, ___0.md5(___0.options.name) + '.dbz');
  ___0.fs.readFile(storage.path, (err, data) => {
    if (!err) {
      data = ___0.zlib.inflateSync(data);
      storage.list = ___0.fromJson(Buffer.from(data, 'utf-8').toString());

      if (___0.typeof(storage.list) !== 'Array') {
        storage.list = [];
      }
    } else {
      storage.list = [];
    }
  });

  storage.save = function () {
    let out = ___0.zlib.deflateSync(Buffer.from(___0.toJson(storage.list), 'utf-8'));
    ___0.fs.writeFile(storage.path, out, (err) => {});
  };

  storage.fn = function (key, value) {
    if (key && value !== undefined) {
      value = ___0.copy(value);
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