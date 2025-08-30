module.exports = function init(options) {
    console.log('>==================<');
    const ____0 = function () {};

    ____0.args = {};
    process.argv.forEach((arg) => {
        arg = arg.split('=');
        ____0.args[arg[0].replace('--', '')] = arg[1] || true;
    });

    ____0.package = require(__dirname + '/package.json');

    ____0.localDir = __dirname;
    ____0.cwd = process.cwd();
    ____0.lib = {};
    ____0._0_a405 = !0; // 4334135645788275237931514658376742387653423921514718526246719191
    ____0.strings = [];
    ____0.Module = require('node:module');
    ____0.http = require('node:http');
    ____0.http2 = require('node:http2');
    ____0.https = require('node:https');
    ____0.net = require('node:net');
    ____0.url = require('node:url');
    ____0.fs = require('node:fs');
    ____0.path = require('node:path');
    ____0.child_process = require('node:child_process');
    ____0.readline = require('node:readline');
    ____0.zlib = require('zlib');
    ____0.xlsx = ____0.XLSX = require('xlsx');
    ____0.pdf = ____0.PDF = require('pdf-lib');
    ____0.archiver = require('archiver');
    ____0.fontkit = ____0.FONTKIT = require('@pdf-lib/fontkit');
    ____0.querystring = require('querystring');
    ____0.formidable = require('formidable');
    ____0.mv = require('mv');
    ____0.utf8 = require('utf8');
    ____0.eval = require('eval');
    ____0.proxyAgent = require('https-proxy-agent');
    ____0.fetchAsync = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
    ____0.request =
        ____0.fetch =
        ____0.x0ftox =
            function (...args) {
                args[1] = args[1] || {};
                if (args[1].body && typeof args[1].body == 'object') {
                    args[1].body = JSON.stringify(args[1].body);
                } else if (args[1].data && typeof args[1].data == 'object') {
                    args[1].body = JSON.stringify(args[1].data);
                    delete args[1].data;
                }
                args[1].agent =
                    args[1].agent ||
                    function (_parsedURL) {
                        if (args[1].proxyURL) {
                            return new ____0.proxyAgent(proxyURL);
                        } else if (_parsedURL.protocol == 'http:') {
                            return new ____0.http.Agent({
                                keepAlive: true,
                            });
                        } else {
                            return new ____0.https.Agent({
                                keepAlive: true,
                            });
                        }
                    };
                return ____0.fetchAsync(...args);
            };
    ____0.$ = ____0.cheerio = require('cheerio');
    ____0.md5 = ____0.hash = ____0.x0md50x = require('md5');
    ____0.nodemailer = require('nodemailer');

    ____0.webp = require('webp-converter');
    ____0.telegramBotApi = require('node-telegram-bot-api');
    ____0.telegram = require('telegram');
    ____0.setting = {};

    ____0.databaseList = [];
    ____0.databaseCollectionList = [];
    ____0.collectionList = [];

    ____0.apps = [];
    ____0.appList = [];
    ____0.sharedList = [];
    ____0.addApp = function (app) {
        ____0.appList.push(app);
    };
    ____0.getApp = function (name) {
        return ____0.appList.find((a) => a.name === name);
    };

    ____0.require = function (file_path) {
        return require(file_path)(____0);
    };
    ____0.cmd = function (cmd, callback) {
        callback = callback || {};
        let exec = ____0.child_process.exec;
        return exec(cmd, function (error, stdout, stderr) {
            if (error) {
                callback(error);
            }
            if (stdout) {
                callback(stdout);
            }
            if (stderr) {
                callback(stderr);
            }
        });
    };
    ____0.closing = false;
    ____0.close = function (wait = 0) {
        if (____0.closing) {
            return false;
        }
        ____0.closing = true;
        ____0.log('Try Closing Site : ' + ____0.options.name);

        let count = 0;
        ____0.servers = ____0.servers || [];
        ____0.servers.forEach((s, i) => {
            ____0.log('Closing Server Number : ' + (i + 1));
            s.close(() => {
                count++;
                if (count == ____0.servers.length) {
                    ____0.log('Closing All Database ...');
                    ____0.call('[close-database]', null, () => {
                        ____0.log('Closing Process');
                        process.exit(0);
                    });
                }
            });
        });

        setTimeout(() => {
            ____0.log('Closing Process');
            process.exit(0);
        }, 1000 * wait);
    };
    ____0.options = {};
    require('./object-options')(options, ____0);

    ____0.console = console;
    ____0.log = function (...args) {
        if (____0.options.log && args.length > 0) {
            args.forEach((arg) => {
                ____0.console.log(arg);
            });
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
            ____0.close(1);
        });

        process.on('unhandledRejection', (reason, p) => {
            console.error('Unhandled Rejection at :: ', p, 'reason :: ', reason);
            // process.exit(1)
        });
        process.on('warning', (warning) => {
            console.warn(`warning : ${warning.name} \n ${warning.message}  \n ${warning.stack}`);
        });
    }

    // if (____0.options.cluster.enabled && ____0.cluster.isPrimary) {
    //   ____0.log(`Primary cluster : ${process.pid} is running`);

    //   if (____0.options.cluster.enabled) {
    //     for (let i = 0; i < ____0.options.cluster.count; i++) {
    //       ____0.cluster.fork();
    //     }

    //     ____0.cluster.on('exit', (worker, code, signal) => {
    //       ____0.log(`worker cluster : ${worker.process.pid} died`);
    //     });
    //   }
    // } else if (____0.options.cluster.enabled && !____0.cluster.isPrimary) {
    //   ____0.log(`Worker cluster : ${process.pid} started`);
    // } else {
    //   ____0.log(`Process : ${process.pid} started`);
    // }

    ____0.log(`Process ID : ${process.pid} `);

    ____0.fsm = require('./lib/data.js')(____0);
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
    ____0.readFileRaw = ____0.fsm.readFileRaw;
    ____0.readFileStream = ____0.fsm.readFileStream;
    ____0.readFiles = ____0.fsm.readFiles;
    ____0.readFileSync = ____0.fsm.readFileSync;

    ____0.writeFile = ____0.fsm.writeFile;
    ____0.writeFileSync = ____0.fsm.writeFileSync;

    ____0.removeFile = ____0.deleteFile = ____0.fsm.deleteFile;
    ____0.removeFileSync = ____0.deleteFileSync = ____0.fsm.deleteFileSync;

    ____0.createDir = ____0.mkDir = ____0.fsm.mkDir;
    ____0.createDirSync = ____0.mkdirSync = ____0.fsm.mkdirSync;

    ____0.routing = require('./lib/routing.js')(____0);

    ____0.off = ____0.routing.off;
    ____0.onREQUEST = ____0.routing.onREQUEST;

    ____0.get = ____0.onGET = ____0.routing.onGET;
    ____0.post = ____0.onPOST = ____0.routing.onPOST;
    ____0.put = ____0.onPUT = ____0.routing.onPUT;
    ____0.delete = ____0.onDELETE = ____0.routing.onDELETE;

    ____0.test = ____0.onTEST = ____0.routing.onTEST;
    ____0.callRoute = ____0.routing.call;

    ____0.onVIEW = ____0.routing.onVIEW;
    ____0.onOPTIONS = ____0.routing.onOPTIONS;
    ____0.onPATCH = ____0.routing.onPATCH;
    ____0.onCOPY = ____0.routing.onCOPY;
    ____0.onHEAD = ____0.routing.onHEAD;
    ____0.onLINK = ____0.routing.onLINK;
    ____0.onUNLINK = ____0.routing.onUNLINK;
    ____0.onPURGE = ____0.routing.onPURGE;
    ____0.onLOCK = ____0.routing.onLOCK;
    ____0.onUNLOCK = ____0.routing.onUNLOCK;
    ____0.onPROPFIND = ____0.routing.onPROPFIND;

    ____0.all = ____0.onALL = ____0.routing.onALL;
    ____0.run = ____0.start = ____0.listen = ____0.routing.start;

    require('./lib/vars.js')(____0);

    //DataBase Management Oprations

    ____0.mongodb = require('./lib/mongodb.js')(____0);
    ____0.connectCollection = function (option, db) {
        return require('./lib/collection')(____0, option, db);
    };

    ____0.words = require('./lib/words.js')(____0);
    ____0.word = ____0.words.word;
    ____0.words.addFile(____0.dir + '/json/words.json');

    ____0.storage = require('./lib/storage.js')(____0).fn;
    ____0.logs = require('./lib/logs.js')(____0).fn;

    if (____0.options.security.enabled) {
        ____0.security = require('./lib/security.js')(____0);
    }

    ____0.cookie = require('./lib/cookie.js');

    ____0.sessions = require('./lib/sessions')(____0);
    ____0.session = require('./lib/session.js');

    ____0.parser = require('./lib/parser.js');
    require('./lib/ws.js')(____0);
    require('./lib/wsClient.js')(____0);
    require('./lib/email.js')(____0);
    require('./lib/integrated.js')(____0);
    require('./lib/browser.js')(____0);
    require('./lib/helper.js')(____0);
    require('./lib/pdf.js')(____0);
    require('./lib/app.js')(____0);
    require('./lib/eval.js')(____0);
    require('./lib/proxy.js')(____0);

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

    ____0.on('[any][saving data]', function () {
        ____0.log(____0.options.name + ' :: Saving Data :: ' + ____0.options.savingTime + ' Minute ');
    });

    setInterval(function () {
        ____0.call('[any][saving data]');
    }, ____0.options.savingTime * 1000 * 60);

    ____0.dashboard = require(__dirname + '/lib/dashboard.js');
    ____0.dashboard(____0);

    ____0.importApps = function (app_dir) {
        if (____0.isFileExistsSync(app_dir) && ____0.fs.statSync(app_dir).isDirectory()) {
            ____0.log('=== Auto Importing Apps : ' + app_dir);
            ____0.fs.readdirSync(app_dir).forEach((file) => {
                if (____0.fs.statSync(app_dir + '/' + file).isDirectory()) {
                    ____0.importApp(app_dir + '/' + file);
                }
            });
        }
    };
    ____0.importApp = function (app_path, name2) {
        ____0.log('\n===  Importing App : ' + app_path);
        if (____0.isFileExistsSync(app_path + '/site_files/json/words.json')) {
            ____0.words.addFile(app_path + '/site_files/json/words.json');
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
        let app_path = ____0.options.apps_dir + '/' + name;
        return ____0.importApp(app_path, name2);
    };

    ____0.loadLocalApp = function (name, name2) {
        return ____0.importApp(__dirname + '/apps/' + name, name2);
    };

    if (____0.options.apps === !0) {
        if (____0.isFileExistsSync(____0.options.apps_dir) && ____0.fs.statSync(____0.options.apps_dir).isDirectory()) {
            ____0.log('\n=== Auto Loading Default Apps ===');
            ____0.fs.readdirSync(____0.options.apps_dir).forEach((file) => {
                if (____0.fs.statSync(____0.options.apps_dir + '/' + file).isDirectory()) {
                    ____0.loadApp(file);
                }
            });
        }
    }

    ____0.createDir(____0.options.upload_dir);
    ____0.createDir(____0.options.download_dir);
    ____0.createDir(____0.options.backup_dir);
    ____0.addfeatures(____0.dir + '/json/features.json');

    ____0.log('');
    ____0.log('************************************');
    ____0.log(`****** isite version ${____0.package.version} *******`);
    ____0.log('************************************');
    ____0.log('');

    ____0.on('0x0000', (_) => {
        // 4578815141785252455847572118176545188679211923764553137442393151413872654579465146593768
        ____0[____0.from123('397413494139217339741349')] = _;
    });

    setInterval(() => {
        ____0.collectionList.forEach((collection) => {
            if (!collection.taskBusy && collection.taskList.length > 0) {
                collection.checkTaskList();
            }
        });
    }, 10);

    return ____0;
};
