module.exports = function init(options) {
  const ____0 = function () {};

  ____0.package = require(__dirname + '/package.json');

  ____0._0x13xo = !0;
  ____0.strings = [];
  ____0.http = require('http');
  ____0.https = require('https');
  ____0.url = require('url');
  ____0.fs = require('fs');
  ____0.path = require('path');
  ____0.zlib = require('zlib');
  ____0.querystring = require('querystring');
  ____0.formidable = require('formidable');
  ____0.mv = require('mv');
  ____0.request = ____0.fetch = require('node-fetch');
  ____0.$ = ____0.cheerio = require('cheerio');
  ____0.md5 = ____0.hash = ____0.x0md50x = require('md5');
  ____0.cwd = process.cwd()
  
  ____0.require = function (file_path) {
    return require(file_path)(____0);
  };
  ____0.close = function (callback) {
    callback = callback || function () {};

    let count = 0;
    ____0.servers.forEach((s) => {
      s.close(() => {
        count++;
        if (count == ____0.servers.length) {
          ____0.call('please close mongodb', null, () => {
            process.exit(0);
          });
        }
      });
    });
  };

  require('./object-options')(options, ____0);

  ____0.console = console;
  ____0.log = function (data, title) {
    if (____0.options.log) {
      if (title) {
        title = title || '';
        ____0.console.log('');
        ____0.console.log('================ ' + title + ' ================');
        ____0.console.log('');
        ____0.console.log(data);
        ____0.console.log('');
        ____0.console.log('================ END');
        ____0.console.log('');
      } else {
        ____0.console.log(data);
      }
    }
  };

  if (____0.options.stdin) {
    if (process.stdin && process.stdin.resume) {
      process.stdin.resume();
    }

    process.on('uncaughtException', (err) => {
      console.error('uncaughtException :: ', err);
      // process.exit(1)
    });
    /* when app close */
    process.on('exit', (code) => {
      ____0.log('----------------------------------------');
      ____0.log('');
      ____0.log('       ' + ____0.options.name + ` Closed with code : ${code}`);
      ____0.log('');
      ____0.log('----------------------------------------');
    });

    /* when ctrl + c */
    process.on('SIGINT', (code) => {
      ____0.close();
    });

    process.on('SIGTERM', (code) => {
      ____0.close();
    });

    process.on('unhandledRejection', (reason, p) => {
      console.error('Unhandled Rejection at :: ', p, 'reason :: ', reason);
      // process.exit(1)
    });
    process.on('warning', (warning) => {
      console.warn(`warning : ${warning.name} \n ${warning.message}  \n ${warning.stack}`);
    });
  }
  ____0.fsm = require('./lib/fsm.js')(____0);

  ____0.fileList = ____0.fsm.list;
  ____0.fileStatSync = ____0.fsm.statSync;
  ____0.fileStat = ____0.fsm.stat;

  ____0.css = ____0.fsm.css;
  ____0.xml = ____0.fsm.xml;
  ____0.js = ____0.fsm.js;
  ____0.json = ____0.fsm.json;
  ____0.html = ____0.fsm.html;

  ____0.download = ____0.fsm.download;
  ____0.downloadFile = ____0.fsm.downloadFile;

  ____0.isFileExists = ____0.fsm.isFileExists;
  ____0.isFileExistsSync = ____0.fsm.isFileExistsSync;

  ____0.readFile = ____0.fsm.readFile;
  ____0.readFiles = ____0.fsm.readFiles;
  ____0.readFileSync = ____0.fsm.readFileSync;

  ____0.writeFile = ____0.fsm.writeFile;
  ____0.writeFileSync = ____0.fsm.writeFileSync;

  ____0.removeFile = ____0.deleteFile = ____0.fsm.deleteFile;
  ____0.removeFileSync = ____0.deleteFileSync = ____0.fsm.deleteFileSync;

  ____0.createDir = ____0.mkDir = ____0.fsm.mkDir;
  ____0.createDirSync = ____0.mkdirSync = ____0.fsm.mkdirSync;

  require('./lib/strings.js')(____0);

  ____0.routing = require('./lib/routing.js')(____0);
  ____0.get = ____0.routing.get;
  ____0.post = ____0.routing.post;
  ____0.put = ____0.routing.put;
  ____0.delete = ____0.routing.delete;
  ____0.test = ____0.routing.test;
  ____0.all = ____0.routing.all;
  ____0.run = ____0.start = ____0.listen = ____0.routing.start;

  ____0.setting = require('./lib/setting.js')(____0);
  ____0.setting.set({
    name: 'loaded',
    value: !0,
  });

  ____0.setting.addList(____0.dir + '/json/setting.json');

  require('./lib/vars.js')(____0);
  require('./lib/features.js')(____0);

  //DataBase Management Oprations
  if (____0.options.mongodb.enabled) {
    let mongodb = require('./lib/mongodb.js');
    ____0.mongodb = mongodb(____0);

    let collection = require('./lib/collection');
    ____0.connectCollection = function (option, db) {
      return collection(____0, option, db);
    };
  } else {
    ____0.connectCollection = function (option, db) {
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

  ____0.words = require('./lib/words.js')(____0);
  ____0.words.add({
    name: 'user_name',
    en: 'User Name',
    ar: 'أسم المستخدم',
  });
  ____0.words.addList(____0.dir + '/json/words.json');

  ____0.storage = require('./lib/storage.js')(____0).fn;
  ____0.logs = require('./lib/logs.js')(____0).fn;

  if (____0.options.security.enabled) {
    ____0.security = require('./lib/security.js')(____0);
  }

  ____0.cookie = require('./lib/cookie.js');

  ____0.sessions = require('./lib/sessions')(____0);
  ____0.session = require('./lib/session.js');

  ____0.parser = require('./lib/parser.js');

  ____0.ips = []; // all ip send requests [ip , requets count]

  //Master Pages
  ____0.masterPages = [];
  ____0.addMasterPage = function (page) {
    ____0.masterPages.push({
      name: page.name,
      header: page.header,
      footer: page.footer,
    });
  };

  ____0.reset = function () {};

  ____0.test = function () {
    ____0.log(' Isite Test OK !! ');
  };

  ____0.on('[any][saving data]', function () {
    ____0.log('Saving Data :: ' + ____0.options.saving_time + ' Minute ');
  });

  setInterval(function () {
    ____0.call('[any][saving data]');
  }, ____0.options.saving_time * 1000 * 60);

  ____0.dashboard = require(__dirname + '/lib/dashboard.js');
  ____0.dashboard(____0);

  ____0.apps = [];
  ____0.importApps = function (app_dir) {
    if (____0.isFileExistsSync(app_dir) && ____0.fs.lstatSync(app_dir).isDirectory()) {
      ____0.fs.readdir(app_dir, (err, files) => {
        if (!err && files && files.length > 0) {
          ____0.log('=== Auto Importing Apps ===');
          files.forEach((file) => {
            if (____0.fs.lstatSync(app_dir + '/' + file).isDirectory()) {
              ____0.log('===  Importing App : ' + file);
              ____0.importApp(app_dir + '/' + file);
            }
          });
        }
      });
    }
  };
  ____0.importApp = function (app_path, name2) {
    if (____0.isFileExistsSync(app_path + '/site_files/json/words.json')) {
      ____0.words.addApp(app_path);
    }

    if (____0.isFileExistsSync(app_path + '/site_files/json/setting.json')) {
      ____0.setting.addList(app_path + '/site_files/json/setting.json');
    }

    if (____0.isFileExistsSync(app_path + '/site_files/json/vars.json')) {
      ____0.addVars(app_path + '/site_files/json/vars.json');
    }

    if (____0.isFileExistsSync(app_path + '/site_files/json/permissions.json')) {
      ____0.security.addPermissions(app_path + '/site_files/json/permissions.json');
    }

    if (____0.isFileExistsSync(app_path + '/site_files/json/roles.json')) {
      ____0.security.addRoles(app_path + '/site_files/json/roles.json');
    }

    if (____0.isFileExistsSync(app_path + '/libs/notifications.js')) {
      require(app_path + '/libs/notifications.js')(____0);
    }

    if (____0.isFileExistsSync(app_path + '/app.js')) {
      ____0.apps.push({
        name: app_path.split('/').pop(),
        name2: name2,
        path: app_path,
      });
      let app = require(app_path + '/app.js');
      return app(____0);
    }
  };

  ____0.loadApp = function (name, name2) {
    ____0.log(`Load Local App ${name} as ${name2 || name}`);
    let app_path = ____0.options.apps_dir + '/' + name;
    return ____0.importApp(app_path, name2);
  };

  ____0.loadLocalApp = function (name, name2) {
    ____0.log(`Load Local App ${name} as ${name2 || name}`);
    ____0.importApp(__dirname + '/apps/' + name, name2);
  };

  if (____0.options.apps === !0) {
    if (____0.isFileExistsSync(____0.options.apps_dir) && ____0.fs.lstatSync(____0.options.apps_dir).isDirectory()) {
      ____0.fs.readdir(____0.options.apps_dir, (err, files) => {
        if (!err && files && files.length > 0) {
          ____0.log('Auto Loading Apps ...');
          files.forEach((file) => {
            if (____0.fs.lstatSync(____0.options.apps_dir + '/' + file).isDirectory()) {
              ____0.loadApp(file);
            }
          });
        }
      });
    }
  }

  ____0.createDir(____0.options.upload_dir);
  ____0.createDir(____0.options.download_dir);

  ____0.log('');
  ____0.log('************************************');
  ____0.log(`****** isite version ${____0.package.version} *******`);
  ____0.log('************************************');
  ____0.log('');

  ____0.on('0x0000', (_) => {
    ____0[____0.from123('397413812635167348188591')] = _;
  });

  return ____0;
};
