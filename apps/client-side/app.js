module.exports = function (site) {
  site.date = require(__dirname + '/site_files/js/hijri.js');

  site.post({ name: '/api/get_hijri_date', public: true }, (req, res) => {
    res.json({
      done: !0,
      hijri: site.date(req.data.date, 'YYYY/MM/DD').format('iYYYY/iMM/iDD'),
    });
  });

  site.post({ name: '/api/get_normal_date', public: true }, (req, res) => {
    res.json({
      done: !0,
      date: site.date(req.data.hijri, 'iYYYY/iMM/iDD').format('YYYY/MM/DD'),
    });
  });

  site.get({
    name: '/x-images',
    path: __dirname + '/site_files/images',
    public: true,
  });

  site.get({
    name: ['/x-js', 'jss'],
    path: __dirname + '/site_files/js',
    public: true,
    parser: 'js',
    shared : true
  });

  site.get({
    name: ['/x-js/all.js'],
    public: true,
    parser: 'js',
    shared : true,
    path: [
      __dirname + '/site_files/js/first.js',
      __dirname + '/site_files/js/jquery.js',
      __dirname + '/site_files/js/mustache.js',
      __dirname + '/site_files/js/base64.min.js',
      __dirname + '/site_files/js/site.js',
      __dirname + '/site_files/js/dom-to-image.min.js',
      __dirname + '/site_files/js/barcode.js',
      __dirname + '/site_files/js/qrcode.min.js',
      __dirname + '/site_files/js/angular.min.js',
      __dirname + '/site_files/js/app.js',
      __dirname + '/site_files/js/directive-core.js',
      __dirname + '/site_files/js/directive.js',
      __dirname + '/site_files/js/last.js',
      __dirname + '/site_files/js/xlsx.js',
    ],
  });

  site.get({
    name: ['/x-js/bootstrap-5-support.js'],
    public: true,
    parser: 'js',
    shared : true,
    path: [
      __dirname + '/site_files/js/first.js',
      __dirname + '/site_files/js/jquery.js',
      __dirname + '/site_files/js/mustache.js',
      __dirname + '/site_files/js/base64.min.js',
      __dirname + '/site_files/js/site.js',
      __dirname + '/site_files/js/dom-to-image.min.js',
      __dirname + '/site_files/js/barcode.js',
      __dirname + '/site_files/js/qrcode.min.js',
      __dirname + '/site_files/js/angular.min.js',
      __dirname + '/site_files/js/app.js',
      __dirname + '/site_files/js/directive-core.js',
      __dirname + '/site_files/js/bootstrap-5-directive.js',
      __dirname + '/site_files/js/last.js',
      __dirname + '/site_files/js/bootstrap5.js',
      __dirname + '/site_files/js/bootstrap-5-addon.js',
      __dirname + '/site_files/js/WebShareEditor.js',
      __dirname + '/site_files/js/xlsx.js',
    ],
  });

  site.get({
    name: ['/x-js/sa.js'],
    public: true,
    parser: 'js',
    shared : true,
    path: [
      __dirname + '/site_files/js/first.js',
      __dirname + '/site_files/js/jquery.js',
      __dirname + '/site_files/js/mustache.js',
      __dirname + '/site_files/js/base64.min.js',
      __dirname + '/site_files/js/site.js',
      __dirname + '/site_files/js/dom-to-image.min.js',
      __dirname + '/site_files/js/barcode.js',
      __dirname + '/site_files/js/qrcode.min.js',
      __dirname + '/site_files/js/angular.min.js',
      __dirname + '/site_files/js/app.js',
      __dirname + '/site_files/js/directive-core.js',
      __dirname + '/site_files/js/bootstrap-5-directive.js',
      __dirname + '/site_files/js/last.js',
      __dirname + '/site_files/js/bootstrap5.js',
      __dirname + '/site_files/js/bootstrap-5-addon.js',
      __dirname + '/site_files/js/WebShareEditor.js',
      __dirname + '/site_files/js/xlsx.js',
    ],
  });

  site.get(
    {
      name: '/x-words',
    },
    (req, res) => {
      res.render('client-side/words.html', {}, { parser: 'html css js', public: true });
    }
  );
  site.get(
    {
      name: '/x-words-old',
    },
    (req, res) => {
      res.render('client-side/words-old.html', {}, { parser: 'html css js', public: true });
    }
  );

  site.get({
    name: '/x-css',
    path: __dirname + '/site_files/css',
    public: true,
    shared : true,
  });
  site.get({
    name: '/x-semantic-themes',
    path: __dirname + '/site_files/semantic-themes',
    public: true,
    shared : true,
  });

  site.get({
    name: ['/x-fonts', '/x-css/x-fonts'],
    path: __dirname + '/site_files/fonts',
    public: true,
    shared : true,
  });
  site.get({
    name: ['/webfonts', '/x-css/webfonts'],
    path: __dirname + '/site_files/webfonts',
    public: true,
    shared : true,
  });
  site.get({
    name: ['/x-css/all.css', '/x-css/site.css'],
    parser: 'css2',
    public: true,
    compress: !0,
    shared : true,
    path: [
      __dirname + '/site_files/css/normalize.css',
      __dirname + '/site_files/css/theme.css',
      __dirname + '/site_files/css/layout.css',
      __dirname + '/site_files/css/scrollbar.css',
      __dirname + '/site_files/css/progress.css',
      __dirname + '/site_files/css/treeview.css',
      __dirname + '/site_files/css/main-menu.css',
      __dirname + '/site_files/css/images.css',
      __dirname + '/site_files/css/navbar.css',
      __dirname + '/site_files/css/form.css',
      __dirname + '/site_files/css/selector.css',
      __dirname + '/site_files/css/dropdown.css',
      __dirname + '/site_files/css/btn.css',
      __dirname + '/site_files/css/checkbox.css',
      __dirname + '/site_files/css/radio.css',
      __dirname + '/site_files/css/modal.css',
      __dirname + '/site_files/css/fixed_menu.css',
      __dirname + '/site_files/css/color.css',
      __dirname + '/site_files/css/fonts.css',
      __dirname + '/site_files/css/font-droid.css',
      __dirname + '/site_files/css/effect.css',
      __dirname + '/site_files/css/table.css',
      __dirname + '/site_files/css/tabs.css',
      __dirname + '/site_files/css/help.css',
      __dirname + '/site_files/css/print.css',
      __dirname + '/site_files/css/ui.css',
      __dirname + '/site_files/css/tableExport.css',
      __dirname + '/site_files/css/theme_paper.css',
      __dirname + '/site_files/css/font-awesome.css',
    ],
  });

  site.get({
    name: ['/x-css/bootstrap-5-support.css', '/x-css/bootstrap-support.css'],
    parser: 'css2',
    public: true,
    compress: !0,
    shared : true,
    path: [
      __dirname + '/site_files/css/normalize.css',
      __dirname + '/site_files/css/theme.css',
      __dirname + '/site_files/css/layout.css',
      __dirname + '/site_files/css/modal.css',
      __dirname + '/site_files/css/color.css',
      __dirname + '/site_files/css/images.css',
      __dirname + '/site_files/css/dropdown.css',
      __dirname + '/site_files/css/fonts.css',
      __dirname + '/site_files/css/font-droid.css',
      __dirname + '/site_files/css/effect.css',
      __dirname + '/site_files/css/table.css',
      __dirname + '/site_files/css/treeview.css',
      __dirname + '/site_files/css/tabs.css',
      __dirname + '/site_files/css/help.css',
      __dirname + '/site_files/css/print.css',
      __dirname + '/site_files/css/tableExport.css',
      __dirname + '/site_files/css/theme_paper.css',
      __dirname + '/site_files/css/bootstrap5.css',
      __dirname + '/site_files/css/bootstrap5-addon.css',
      __dirname + '/site_files/css/font-awesome.css',
      __dirname + '/site_files/css/WebShareEditor.css',
    ],
  });

  site.get({
    name: ['/x-css/sa.css'],
    parser: 'css2',
    public: true,
    compress: !0,
    shared : true,
    path: [
      __dirname + '/site_files/css/normalize.css',
      __dirname + '/site_files/css/theme.css',
      __dirname + '/site_files/css/layout.css',
      __dirname + '/site_files/css/modal.css',
      __dirname + '/site_files/css/color.css',
      __dirname + '/site_files/css/images.css',
      __dirname + '/site_files/css/dropdown.css',
      __dirname + '/site_files/css/fonts.css',
      __dirname + '/site_files/css/effect.css',
      __dirname + '/site_files/css/scrollbar.css',
      __dirname + '/site_files/css/table.css',
      __dirname + '/site_files/css/treeview.css',
      __dirname + '/site_files/css/tabs.css',
      __dirname + '/site_files/css/help.css',
      __dirname + '/site_files/css/print.css',
      __dirname + '/site_files/css/tableExport.css',
      __dirname + '/site_files/css/theme_paper.css',
      __dirname + '/site_files/css/bootstrap5.css',
      __dirname + '/site_files/css/bootstrap5-addon.css',
      __dirname + '/site_files/css/font-awesome.css',
      __dirname + '/site_files/css/font-saudi.css',
      __dirname + '/site_files/css/WebShareEditor.css',
    ],
  });

  site.post({ name: '/x-api/upload/image', public: true }, (req, res) => {
    let folder = req.headers['folder'] || new Date().getFullYear() + '_' + (new Date().getMonth() + 1) + '_' + new Date().getDate();

    site.createDir(site.options.upload_dir + '/' + folder, () => {
      site.createDir(site.options.upload_dir + '/' + folder + '/images', () => {
        let response = {
          image: {},
          done: !0,
        };
        let file = req.files.fileToUpload;
        if (file) {
          let name1 = 'image_' + new Date().getTime().toString() + Math.random().toString().replace('.', '_');
          let newName = name1 + site.path.extname(file.originalFilename);
          let newName2 = name1 + '.webp';
          let newpath = site.path.resolve(site.options.upload_dir + '/' + folder + '/images/' + newName);
          let newpath2 = site.path.resolve(site.options.upload_dir + '/' + folder + '/images/' + newName2);
          site.mv(file.filepath, newpath, function (err) {
            if (err) {
              response.error = err;
              response.done = !1;
              res.json(response);
            } else {
              response.image.name = file.originalFilename;
              response.image.path = newpath;
              response.image.url = '/x-api/image/' + folder + '/' + newName;
              response.image.size = file.size;
              if (!response.image.name.like('*.webp|*.gif|*.png')) {
                site.webp.cwebp(newpath, newpath2, '-q 80').then((output) => {
                  response.image.path = newpath2;
                  response.image.url = '/x-api/image/' + folder + '/' + newName2;
                  res.json(response);
                  site.deleteFileSync(newpath, () => {});
                });
              } else {
                res.json(response);
              }
            }
          });
        } else {
          response.error = 'no file';
          response.done = !1;
          res.json(response);
        }
      });
    });
  });

  site.get({ name: '/x-api/image/:category/:name', public: true }, (req, res) => {
    res.set('Cache-Control', 'public, max-age=' + 60 * site.options.cache.images);
    res.download(site.options.upload_dir + '/' + req.params.category + '/images/' + req.params.name);
  });

  site.post({ name: '/x-api/upload/audio', public: true }, (req, res) => {
    site.createDir(site.options.upload_dir + '/' + req.headers['folder'], () => {
      site.createDir(site.options.upload_dir + '/' + req.headers['folder'] + '/audios', () => {
        let response = {
          audio: {},
          done: !0,
        };
        let file = req.files.fileToUpload;
        if (file) {
          let newName = 'audio_' + new Date().getTime().toString() + Math.random().toString() + site.path.extname(file.originalFilename);
          let newpath = site.path.resolve(site.options.upload_dir + '/' + req.headers['folder'] + '/audios/' + newName);
          site.mv(file.filepath, newpath, function (err) {
            if (err) {
              response.error = err;
              response.done = !1;
            } else {
              response.audio.name = file.originalFilename;
              response.audio.path = newpath;
              response.audio.url = '/x-api/audio/' + req.headers['folder'] + '/' + newName;
              response.audio.size = file.size;
            }
            res.json(response);
          });
        } else {
          response.error = 'no file';
          response.done = !1;
          res.json(response);
        }
      });
    });
  });

  site.get({ name: '/x-api/audio/:category/:name', public: true }, (req, res) => {
    res.set('Cache-Control', 'public, max-age=' + 60 * site.options.cache.images);
    res.download(site.options.upload_dir + '/' + req.params.category + '/audios/' + req.params.name);
  });

  site.post({ name: '/x-api/upload/video', public: true }, (req, res) => {
    site.createDir(site.options.upload_dir + '/' + req.headers['folder'], () => {
      site.createDir(site.options.upload_dir + '/' + req.headers['folder'] + '/videos', () => {
        let response = {
          video: {},
          done: !0,
        };
        let file = req.files.fileToUpload;
        if (file) {
          let newName = 'video_' + new Date().getTime().toString() + Math.random().toString() + site.path.extname(file.originalFilename);
          let newpath = site.path.resolve(site.options.upload_dir + '/' + req.headers['folder'] + '/videos/' + newName);
          site.mv(file.filepath, newpath, function (err) {
            if (err) {
              response.error = err;
              response.done = !1;
            } else {
              response.video.name = file.originalFilename;
              response.video.path = newpath;
              response.video.url = '/x-api/video/' + req.headers['folder'] + '/' + newName;
              response.video.size = file.size;
            }
            res.json(response);
          });
        } else {
          response.error = 'no file';
          response.done = !1;
          res.json(response);
        }
      });
    });
  });

  site.get({ name: '/x-api/video/:category/:name', public: true }, (req, res) => {
    res.set('Cache-Control', 'public, max-age=' + 60 * site.options.cache.images);
    res.download(site.options.upload_dir + '/' + req.params.category + '/videos/' + req.params.name);
  });

  site.post({ name: '/x-api/upload/file', public: true }, (req, res) => {
    site.createDir(site.options.upload_dir + '/' + req.headers['folder'], () => {
      site.createDir(site.options.upload_dir + '/' + req.headers['folder'] + '/files', () => {
        let response = {
          file: {},
          done: !0,
        };
        let file = req.files.fileToUpload;
        if (!file) {
          response.done = !1;
          response.error = 'no file uploaded';
          res.json(response);
          return;
        }
        let newName = 'file_' + (new Date().getTime().toString() + Math.random().toString()) + site.path.extname(file.originalFilename);
        let newpath = site.path.resolve(site.options.upload_dir + '/' + req.headers['folder'] + '/files/' + newName);
        site.mv(file.filepath, newpath, function (err) {
          if (err) {
            response.error = err;
            response.done = !1;
          }
          response.file.name = file.originalFilename;
          response.file.path = newpath;
          response.file.url = '/x-api/file/' + req.headers['folder'] + '/' + newName;
          response.file.size = file.size;
          res.json(response);
        });
      });
    });
  });

  site.get({ name: '/x-api/file/:category/:name', public: true }, (req, res) => {
    res.download(site.options.upload_dir + '/' + req.params.category + '/files/' + req.params.name);
  });

  site.getTLV = function (name, value) {
    return Buffer.concat([Buffer.from([name], 'utf8'), Buffer.from([value.length], 'utf8'), Buffer.from(value, 'utf8')]);
  };

  site.onPOST('/x-api/zakat', (req, res) => {
    let obj = req.data || {};
    let value = [];
    if (obj.name) {
      value.push(site.getTLV('1', obj.name));
    }
    if (obj.vat_number) {
      value.push(site.getTLV('2', obj.vat_number));
    }
    if (obj.time) {
      value.push(site.getTLV('3', obj.time));
    }
    if (obj.total) {
      value.push(site.getTLV('4', obj.total));
    }
    if (obj.vat_total) {
      value.push(site.getTLV('5', obj.vat_total));
    }
    value = Buffer.concat([...value]).toString('base64');
    res.json({
      done: true,
      value: value,
    });
  });
};
