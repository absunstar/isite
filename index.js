module.exports = function init(options) {

    var site = {};

    site.options = options || {};
    site.port = site.options.port || process.env.port || 80;
    site.dir = site.options.dir || './site_files';
    site.savingTime = site.options.savingTime || 60 * 60;
    site.sessionEnabled = typeof site.options.sessionEnabled == "undefined" ? true : site.options.sessionEnabled;
    site.mongodbEnabled = typeof site.options.mongodbEnabled == "undefined" ? false : site.options.mongodbEnabled;
    site.mongodbURL = site.options.mongodbURL || '127.0.0.1:27017';


    require(__dirname + '/lib/prototype.js')
    site.getFileEncode = function (path) {

        if (path.endsWith('.woff2') ||
            path.endsWith('.woff') ||
            path.endsWith('.ttf') ||
            path.endsWith('.svg') ||
            path.endsWith('.otf') ||
            path.endsWith('.png') ||
            path.endsWith('.jpg') ||
            path.endsWith('.jpeg') ||
            path.endsWith('.ico') ||
            path.endsWith('.bmp') ||
            path.endsWith('.eot')) {
            return 'binary';
        }
        return 'utf8'
    }

    let events = require('events');
    let eventEmitter = new events.EventEmitter();
    site.on = function (name, callback) {
        eventEmitter.on(name, callback)
    };
    site.call = function (name) {
        eventEmitter.emit(name);
    };

    // Starting Server And Handle All Routes
    let route = require(__dirname + '/lib/route.js');
    site.route = route(site);
    site.addRoute = site.route.add;
    site.get = site.route.get;
    site.post = site.route.post;
    site.put = site.route.put;
    site.delete = site.route.delete;
    site.all = site.route.all;
    site.run = site.route.run;

    let test_routes = require(__dirname + '/lib/server_routes.js');
    test_routes(site);

    //Management Files [Fast Read Write , Memory Cach]
    let files = require(__dirname + '/lib/files.js');
    site.fs = files(site);
    site.readFile = site.fs.readFile;
    site.readFileSync = site.fs.readFileSync;
    site.readFiles = site.fs.readFiles;
    site.html = site.fs.html;
    site.js = site.fs.js;
    site.css = site.fs.css;
    site.json = site.fs.json;
    site.files = site.fs.fileList;

    //DataBase Management Oprations
    if (site.mongodbEnabled) {
        let mongodb = require(__dirname + '/lib/mongodb.js');
        site.mongodb = mongodb(site);
    }


    site.cookie = require(__dirname + '/lib/cookie.js');
    site.session = require(__dirname + '/lib/session.js');
    site.parser = require(__dirname + '/lib/parser.js');

    site.md5 = require('md5');

    site.vars = []; // site variables[name , value]
    site.addVar = function (key, value) {
        site.vars.push({
            key: key,
            value: value
        });
    }
    site.ips = []; // all ip send requests [ip , requets count]
    site.users = []; // all users [token , id , name , permissions , requests count]
    site.logs = []; // all log Messages if logEnabled = true
    site.sessions = []; // all sessions info
    site.trackSession = function (session) {

        for (var i = 0; i < site.sessions.length; i++) {
            var s = site.sessions[i];
            if (s.token == session.token) {
                s.data = session.data || s.data;
                s.requestesCount++;
                s.ip = session.ip;
                return s;
            }
        }
        session.data = [];
        session.requestesCount = 1;
        session.createdTime = new Date().getTime();
        site.sessions.push(session);
        return session;
    }

    //Master Pages
    site.masterPages = [];
    site.addMasterPage = function (page) {
        site.masterPages.push({
            name: page.name,
            header: page.header,
            footer: page.footer
        })
    }

    site.reset = function () {

    }

    site.test = function () {
        console.log(' Isite Test OK !! ');
    };

    site.on('saveChanges', function () {
        console.log('Site Will Save Changes Every ' + site.savingTime + ' s ')
    })

    setInterval(function () {
        site.call('saveChanges')
    }, site.savingTime * 1000)
    return site;

}