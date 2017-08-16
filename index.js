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
    if (site.options.mongodb.enabled) {
        let mongodb = require(__dirname + '/lib/mongodb.js');
        site.mongodb = mongodb(site);
    }

    if (site.options.security.enabled) {
        let security = require(__dirname + '/lib/security.js');
        security(site);
        site.security.loadUsers(function (err, users) {
            site.security.users = users
        })
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
    site.logs = []; // all log Messages if logEnabled = true

    site.sessions = []; // all sessions info
    site.loadSessions = function (callback) {
        site.mongodb.find({
            dbName: site.options.session.dbName,
            collectionName: site.options.session.userSessionCollection,
            where: {},
            select: {}
        }, function (err, sessions) {
            callback(err, sessions)
        })
    }
    site.loadSessions(function (err, sessions) {
        if (!err) {
            site.sessions = sessions
        }
    })
    site.saveSessions = function (callback) {
        site.mongodb.delete({
            dbName: site.options.session.dbName,
            collectionName: site.options.session.userSessionCollection,
            where: {}
        }, function (err, result) {
            site.mongodb.insert({
                dbName: site.options.session.dbName,
                collectionName: site.options.session.userSessionCollection,
                docs: site.sessions
            }, function (err, docs) {
                callback(err, docs)
            })
        })
    }
    site.on('saveChanges', function () {
        site.saveSessions(function (err, sessions) {
            if (err) {
                console.log(err)
            } else {
                //console.log(sessions)
            }
        })
    })


    site.trackSession = function (session) {

        for (var i = 0; i < site.sessions.length; i++) {
            var s = site.sessions[i]
            if (s.accessToken == session.accessToken) {

                session.createdTime = s.createdTime
                session.data = session.data || s.data
                session.requestesCount = s.requestesCount + 1

                site.sessions[i] = {
                    accessToken: session.accessToken,
                    createdTime: session.createdTime,
                    modifiedTime: session.modifiedTime,
                    data: session.data,
                    ip: session.ip,
                    requestesCount: session.requestesCount
                }
                return session;
            }
        }

        session.data = [];
        session.requestesCount = 1;
        session.createdTime = new Date().getTime();
        site.sessions.push({
            accessToken: session.accessToken,
            createdTime: session.createdTime,
            modifiedTime: session.modifiedTime,
            data: session.data,
            ip: session.ip,
            requestesCount: session.requestesCount
        });
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
        console.log('Site Will Save Changes Every ' + site.options.savingTime + ' minute ')
    })

    setInterval(function () {
        site.call('saveChanges')
    }, site.options.savingTime * 1000 * 60)

    // developer tools
    site.dashboard = require(__dirname + '/lib/dashboard.js');
    site.dashboard(site);


    return site;

}