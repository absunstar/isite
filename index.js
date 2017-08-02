module.exports = function init(options) {

    const site = {}

    // Javascript Prototype Function
    require(__dirname + '/lib/prototype.js')

    //core functions
    site.core = require(__dirname + '/lib/core.js')
    site.core(site)

    //site event
    site.event = require(__dirname + '/lib/event.js')
    site.event(site)

    //site option
    site.option = require(__dirname + '/lib/option.js')
    site.option(site, options)

    //Management Files [Fast Read Write , Memory Cach]
    site.file = require(__dirname + '/lib/file.js');
    site.file(site);


    // Starting Server And Handle All Routes
    site.route = require(__dirname + '/lib/route.js');
    site.route(site);


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
    site.addVar = function(key, value) {
        site.vars.push({
            key: key,
            value: value
        });
    }
    site.ips = []; // all ip send requests [ip , requets count]
    site.users = []; // all users [token , id , name , permissions , requests count]
    site.logs = []; // all log Messages if logEnabled = true
    site.sessions = []; // all sessions info
    site.trackSession = function(session) {

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
    site.addMasterPage = function(page) {
        site.masterPages.push({
            name: page.name,
            header: page.header,
            footer: page.footer
        })
    }

    site.reset = function() {

    }

    site.test = function() {
        console.log(' Isite Test OK !! ');
    };

    site.on('saveChanges', function() {
        console.log('Site Will Save Changes Every ' + site.savingTime + ' s ')
    })

    setInterval(function() {
        site.call('saveChanges')
    }, site.savingTime * 1000 * 60)

    // developer tools
    site.developer_routes = require(__dirname + '/lib/developer_routes.js');
    site.developer_routes(site);


    return site;

}