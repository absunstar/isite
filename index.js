module.exports = function init(options) {

    var site = {};

    site.options = options || {};
    site.port = site.options.port || process.env.port || 80;
    site.dir = site.options.dir || './site_files';


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
    site.run = site.route.run;

    let test_routes = require(__dirname + '/lib/test_routes.js');
    test_routes(site);

    //Management Files [Fast Read Write , Memory Cach]
    let files = require(__dirname + '/lib/files.js');
    site.fs = files(site);
    site.readFile = site.fs.readFile;
    site.html = site.fs.html;
    site.js = site.fs.js;
    site.css = site.fs.css;
    site.json = site.fs.json;
    site.files = site.fs.fileList;

    //DataBase Management Oprations
    let mongo = require(__dirname + '/lib/mongo.js');
    site.mongo = mongo(site);

    site.cookie = require(__dirname + '/lib/cookie.js');
    site.session = require(__dirname + '/lib/session.js');
    site.parser = require(__dirname + '/lib/parser.js');

    site.md5 = require('md5');

    site.vars = []; // site variables[name , value]
    site.ips = []; // all ip send requests [ip , requets count]
    site.users = []; // all users [token , id , name , permissions , requests count]
    site.logs = []; // all log Messages if logEnabled = true


    site.reset = function () {

    }

    site.test = function () {
        console.log('Isite Test OK');
    };



    return site;

}