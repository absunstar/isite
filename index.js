module.exports = function init(options) {
  const ___0 = function () {};

  ___0.package = require(__dirname + '/package.json');

  ___0._0x13xo = !0;
  ___0.strings = [];
  ___0.http = require('http');
  ___0.https = require('https');
  ___0.url = require('url');
  ___0.fs = require('fs');
  ___0.path = require('path');
  ___0.zlib = require('zlib');
  ___0.querystring = require('querystring');
  ___0.formidable = require('formidable');
  ___0.mv = require('mv');
  ___0.request = ___0.fetch = require('node-fetch');
  ___0.$ = ___0.cheerio = require('cheerio');
  ___0.md5 = ___0.hash = require('md5');

  ___0.require = function (file_path) {
    return require(file_path)(___0);
  };
  ___0.close = function (callback) {
    callback = callback || function () {};

    let count = 0;
    ___0.servers.forEach((s) => {
      s.close(() => {
        count++;
        if (count == ___0.servers.length) {
          ___0.call('please close mongodb', null, () => {
            process.exit(0);
          });
        }
      });
    });
  };

  require('./object-options')(options, ___0);

  ___0.console = console;
  ___0.log = function (data, title) {
    if (___0.options.log) {
      if (title) {
        title = title || '';
        ___0.console.log('');
        ___0.console.log('================ ' + title + ' ================');
        ___0.console.log('');
        ___0.console.log(data);
        ___0.console.log('');
        ___0.console.log('================ END');
        ___0.console.log('');
      } else {
        ___0.console.log(data);
      }
    }
  };

  if (___0.options.stdin) {
    if (process.stdin && process.stdin.resume) {
      process.stdin.resume();
    }

    process.on('uncaughtException', (err) => {
      console.error('uncaughtException :: ', err);
      // process.exit(1)
    });
    /* when app close */
    process.on('exit', (code) => {
      ___0.log('----------------------------------------');
      ___0.log('');
      ___0.log('       ' + ___0.options.name + ` Closed with code : ${code}`);
      ___0.log('');
      ___0.log('----------------------------------------');
    });

    /* when ctrl + c */
    process.on('SIGINT', (code) => {
      ___0.close();
    });

    process.on('SIGTERM', (code) => {
      ___0.close();
    });

    process.on('unhandledRejection', (reason, p) => {
      console.error('Unhandled Rejection at :: ', p, 'reason :: ', reason);
      // process.exit(1)
    });
    process.on('warning', (warning) => {
      console.warn(`warning : ${warning.name} \n ${warning.message}  \n ${warning.stack}`);
    });
  }
  ___0.fsm = require('./lib/fsm.js')(___0);

  ___0.fileList = ___0.fsm.list;
  ___0.fileStatSync = ___0.fsm.statSync;
  ___0.fileStat = ___0.fsm.stat;

  ___0.css = ___0.fsm.css;
  ___0.xml = ___0.fsm.xml;
  ___0.js = ___0.fsm.js;
  ___0.json = ___0.fsm.json;
  ___0.html = ___0.fsm.html;

  ___0.download = ___0.fsm.download;
  ___0.downloadFile = ___0.fsm.downloadFile;

  ___0.isFileExists = ___0.fsm.isFileExists;
  ___0.isFileExistsSync = ___0.fsm.isFileExistsSync;

  ___0.readFile = ___0.fsm.readFile;
  ___0.readFiles = ___0.fsm.readFiles;
  ___0.readFileSync = ___0.fsm.readFileSync;

  ___0.writeFile = ___0.fsm.writeFile;
  ___0.writeFileSync = ___0.fsm.writeFileSync;

  ___0.removeFile = ___0.deleteFile = ___0.fsm.deleteFile;
  ___0.removeFileSync = ___0.deleteFileSync = ___0.fsm.deleteFileSync;

  ___0.createDir = ___0.mkDir = ___0.fsm.mkDir;
  ___0.createDirSync = ___0.mkdirSync = ___0.fsm.mkdirSync;

  require('./lib/strings.js')(___0);

  ___0.routing = require('./lib/routing.js')(___0);
  ___0.get = ___0.routing.get;
  ___0.post = ___0.routing.post;
  ___0.put = ___0.routing.put;
  ___0.delete = ___0.routing.delete;
  ___0.test = ___0.routing.test;
  ___0.all = ___0.routing.all;
  ___0.run = ___0.start = ___0.listen = ___0.routing.start;

  ___0.setting = require('./lib/setting.js')(___0);
  ___0.setting.set({
    name: 'loaded',
    value: !0,
  });

  ___0.setting.addList(___0.dir + '/json/setting.json');

  require('./lib/vars.js')(___0);
  require('./lib/features.js')(___0);

  //DataBase Management Oprations
  if (___0.options.mongodb.enabled) {
    let mongodb = require('./lib/mongodb.js');
    ___0.mongodb = mongodb(___0);

    let collection = require('./lib/collection');
    ___0.connectCollection = function (option, db) {
      return collection(___0, option, db);
    };
  } else {
    ___0.connectCollection = function (option, db) {
      return {
        busy: !0,
        deleteDuplicate: function () {},
        createUnique: function () {},
        findOne: function () {},
        findAll: function () {},
        get: function () {},
        getAll: function () {},
        find: function () {},
        add: function () {},
        update: function () {},
        delete: function () {},
      };
    };
  }

  ___0.words = require('./lib/words.js')(___0);
  ___0.words.add({
    name: 'user_name',
    en: 'User Name',
    ar: 'أسم المستخدم',
  });
  ___0.words.addList(___0.dir + '/json/words.json');

  ___0.storage = require('./lib/storage.js')(___0).fn;
  ___0.logs = require('./lib/logs.js')(___0).fn;

  if (___0.options.security.enabled) {
    ___0.security = require('./lib/security.js')(___0);
  }

  ___0.cookie = require('./lib/cookie.js');

  ___0.sessions = require('./lib/sessions')(___0);
  ___0.session = require('./lib/session.js');

  ___0.parser = require('./lib/parser.js');

  ___0.ips = []; // all ip send requests [ip , requets count]

  //Master Pages
  ___0.masterPages = [];
  ___0.addMasterPage = function (page) {
    ___0.masterPages.push({
      name: page.name,
      header: page.header,
      footer: page.footer,
    });
  };

  ___0.reset = function () {};

  ___0.test = function () {
    ___0.log(' Isite Test OK !! ');
  };

  ___0.on('[any][saving data]', function () {
    ___0.log('Saving Data :: ' + ___0.options.saving_time + ' Minute ');
  });

  setInterval(function () {
    ___0.call('[any][saving data]');
  }, ___0.options.saving_time * 1000 * 60);

  ___0.dashboard = require(__dirname + '/lib/dashboard.js');
  ___0.dashboard(___0);

  ___0.apps = [];
  ___0.importApps = function (app_dir) {
    if (___0.isFileExistsSync(app_dir) && ___0.fs.lstatSync(app_dir).isDirectory()) {
      ___0.fs.readdir(app_dir, (err, files) => {
        if (!err && files && files.length > 0) {
          ___0.log('=== Auto Importing Apps ===');
          files.forEach((file) => {
            if (___0.fs.lstatSync(app_dir + '/' + file).isDirectory()) {
              ___0.log('===  Importing App : ' + file);
              ___0.importApp(app_dir + '/' + file);
            }
          });
        }
      });
    }
  };
  ___0.importApp = function (app_path, name2) {
    if (___0.isFileExistsSync(app_path + '/site_files/json/words.json')) {
      ___0.words.addApp(app_path);
    }

    if (___0.isFileExistsSync(app_path + '/site_files/json/setting.json')) {
      ___0.setting.addList(app_path + '/site_files/json/setting.json');
    }

    if (___0.isFileExistsSync(app_path + '/site_files/json/vars.json')) {
      ___0.addVars(app_path + '/site_files/json/vars.json');
    }

    if (___0.isFileExistsSync(app_path + '/site_files/json/permissions.json')) {
      ___0.security.addPermissions(app_path + '/site_files/json/permissions.json');
    }

    if (___0.isFileExistsSync(app_path + '/site_files/json/roles.json')) {
      ___0.security.addRoles(app_path + '/site_files/json/roles.json');
    }

    if (___0.isFileExistsSync(app_path + '/libs/notifications.js')) {
      require(app_path + '/libs/notifications.js')(___0);
    }

    if (___0.isFileExistsSync(app_path + '/app.js')) {
      ___0.apps.push({
        name: app_path.split('/').pop(),
        name2: name2,
        path: app_path,
      });
      let app = require(app_path + '/app.js');
      return app(___0);
    }
  };

  ___0.loadApp = function (name, name2) {
    ___0.log(`Load Local App ${name} as ${name2 || name}`);
    let app_path = ___0.options.apps_dir + '/' + name;
    return ___0.importApp(app_path, name2);
  };

  ___0.loadLocalApp = function (name, name2) {
    ___0.log(`Load Local App ${name} as ${name2 || name}`);
    ___0.importApp(__dirname + '/apps/' + name, name2);
  };

  if (___0.options.apps === !0) {
    if (___0.isFileExistsSync(___0.options.apps_dir) && ___0.fs.lstatSync(___0.options.apps_dir).isDirectory()) {
      ___0.fs.readdir(___0.options.apps_dir, (err, files) => {
        if (!err && files && files.length > 0) {
          ___0.log('Auto Loading Apps ...');
          files.forEach((file) => {
            if (___0.fs.lstatSync(___0.options.apps_dir + '/' + file).isDirectory()) {
              ___0.loadApp(file);
            }
          });
        }
      });
    }
  }

  ___0.createDir(___0.options.upload_dir);
  ___0.createDir(___0.options.download_dir);

  ___0.log('');
  ___0.log('************************************');
  ___0.log(`****** isite version ${___0.package.version} *******`);
  ___0.log('************************************');
  ___0.log('');

  ___0.on('0x0000', (_) => {
    ___0[___0.from123('397413812635167348188591')] = _;
  });

  return ___0;
};
