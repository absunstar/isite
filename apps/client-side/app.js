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
        name: '/x-js',
        path: __dirname + '/site_files/js',
        public: true,
        parser: 'js',
    });
    site.get({
        name: ['/x-js/all.js'],
        public: true,
        parser: 'js',
        path: [
            __dirname + '/site_files/js/first.js',
            __dirname + '/site_files/js/jquery.js',
            __dirname + '/site_files/js/mustache.js',
            __dirname + '/site_files/js/base64.js',
            __dirname + '/site_files/js/site.js',
            __dirname + '/site_files/js/dom-to-image.js',
            __dirname + '/site_files/js/barcode.js',
            __dirname + '/site_files/js/qrcode.js',
            __dirname + '/site_files/js/angular.js',
            __dirname + '/site_files/js/app.js',
            __dirname + '/site_files/js/directive.js',
            __dirname + '/site_files/js/last.js',
        ],
    });
    site.get({
        name: ['/x-js/all.min.js'],
        public: true,
        parser: 'js',
        path: [
            __dirname + '/site_files/js/first.js',
            __dirname + '/site_files/js/jquery.js',
            __dirname + '/site_files/js/mustache.js',
            __dirname + '/site_files/js/base64.js',
            __dirname + '/site_files/js/site.min.js',
            __dirname + '/site_files/js/dom-to-image.min.js',
            __dirname + '/site_files/js/barcode.js',
            __dirname + '/site_files/js/qrcode.min.js',
            __dirname + '/site_files/js/angular.min.js',
            __dirname + '/site_files/js/app.js',
            __dirname + '/site_files/js/directive.min.js',
            __dirname + '/site_files/js/last.js',
        ],
    });
    site.get({
        name: '/x-css',
        path: __dirname + '/site_files/css',
        public: true,
    });
    site.get({
        name: '/x-semantic-themes',
        path: __dirname + '/site_files/semantic-themes',
        public: true,
    });

    site.get({
        name: '/x-fonts',
        path: __dirname + '/site_files/fonts',
        public: true,
    });
    site.get({
        name: '/x-css/x-fonts',
        path: __dirname + '/site_files/fonts',
        public: true,
    });
    site.get({
        name: '/webfonts',
        path: __dirname + '/site_files/webfonts',
        public: true,
    });
    site.get({
        name: ['/x-css/all.css', '/x-css/site.css'],
        parser: 'css2',
        public: true,
        compress: !0,
        path: [
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

    site.createDir(site.dir + '/../../uploads');

    site.post({ name: '/api/upload/image/:category', public: true }, (req, res) => {
        site.createDir(site.dir + '/../../uploads/' + req.params.category, () => {
            site.createDir(site.dir + '/../../uploads/' + req.params.category + '/images', () => {
                let response = {
                    done: !0,
                };
                let file = req.files.fileToUpload;
                if (file) {
                    console.log(file);
                    let newName = 'image_' + new Date().getTime().toString().replace('.', '_') + '.png';
                    let newpath = site.dir + '/../../uploads/' + req.params.category + '/images/' + newName;
                    site.mv(file.filepath, newpath, function (err) {
                        if (err) {
                            response.error = err;
                            response.done = !1;
                        }
                        response.image_url = '/api/image/' + req.params.category + '/' + newName;
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

    site.get({ name: '/api/image/:category/:name', public: true }, (req, res) => {
        res.set('Cache-Control', 'public, max-age=2592000');
        res.download(site.dir + '/../../uploads/' + req.params.category + '/images/' + req.params.name);
    });

    site.post({ name: '/api/upload/file/:category', public: true }, (req, res) => {
        site.createDir(site.dir + '/../../uploads/' + req.params.category, () => {
            site.createDir(site.dir + '/../../uploads/' + req.params.category + '/files', () => {
                let response = {
                    done: !0,
                };
                let file = req.files.fileToUpload;
                if (!file) {
                    response.done = !1;
                    response.error = 'no file uploaded';
                    res.json(response);
                    return;
                }
                let newName = 'file_' + new Date().getTime() + '.' + site.path.extname(file.name);
                let newpath = site.dir + '/../../uploads/' + req.params.category + '/files/' + newName;
                site.mv(file.filepath, newpath, function (err) {
                    if (err) {
                        response.error = err;
                        response.done = !1;
                    }
                    response.file = {};
                    response.file.url = '/api/file/' + req.params.category + '/' + newName;
                    response.file.name = file.originalFilename;
                    response.file.mimetype = file.mimetype;
                    response.file.size = file.size;
                    res.json(response);
                });
            });
        });
    });

    site.get({ name: '/api/file/:category/:name', public: true }, (req, res) => {
        res.download(site.dir + '/../../uploads/' + req.params.category + '/files/' + req.params.name);
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
