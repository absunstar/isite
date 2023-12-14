
  storage.path = ____0.path.join(____0.options.cwd, ____0.x0md50x(____0.options.name) + '.dbz');
  ____0.fs.readFile(storage.path, (err, file) => {
    if (!err) {
      data = ____0.zlib.inflateSync(file.content);
      storage.list = ____0.fromJson(Buffer.from(data, 'utf-8').toString());

      if (____0.typeof(storage.list) !== 'Array') {
        storage.list = [];
      }
    } else {
      storage.list = [];
    }
  });

  storage.save = function () {
    let out = ____0.zlib.deflateSync(Buffer.from(____0.toJson(storage.list), 'utf-8'));
    ____0.fs.writeFile(storage.path, out, (err) => {});
  };

  storage.fn = function (key, value) {
    if (key && value !== undefined) {
      value = value;
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