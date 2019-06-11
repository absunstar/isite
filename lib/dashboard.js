module.exports = function init(_d_) {

    let dir = __dirname + '/../isite_files'

    _d_.get({
        name: '/@admin',
        path: dir + '/html/index.html',
        parser: 'html',
        parserDir: dir,
        hide: true
    })
    _d_.get({
        name: '/@images',
        path: dir + '/images',
        hide: true
    })
    _d_.get({
        name: '/@fonts',
        path: dir + '/fonts',
        hide: true
    })
    _d_.get({
        name: '/@js',
        path: dir + '/js',
        hide: true
    })
    _d_.get({
        name: '/@css',
        path: dir + '/css',
        compress: true,
        hide: true
    })
    _d_.get({
        name: '/@css/bootstrap3.css',
        path: [dir + '/css/bootstrap.css', dir + '/css/navbar.css'],
        compress: true,
        hide: true
    })
    _d_.get({
        name: '/@js/bootstrap3.js',
        path: dir + '/js/bootstrap.js',
        hide: true
    })

    _d_.get({
        name: '/@js/script.js',
        hide: true,
        compress: true,
        path: [
            dir + '/js/jquery.js',
            dir + '/js/bootstrap.js',
            dir + '/js/angular.js',
            dir + '/js/prism.js',
            dir + '/js/client.js',
        ]
    })
    _d_.get({
        name: '/@css/style.css',
        hide: true,
        compress: true,
        path: [
            dir + '/css/bootstrap.css',
            dir + '/css/font-awesome.css',
            dir + '/css/navbar.css',
            dir + '/css/custom.css',
            dir + '/css/prism.css'
        ]
    })


    _d_.all({
        name: '/@admin/api/vars',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(_d_.vars))
        }
    })


    _d_.all({
        name: '/@admin/api/routes',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            var arr = []
            for (var i = 0; i < _d_.routeList.length; i++) {
                var r = _d_.routeList[i];
                if (!r.hide) {
                    arr.push({
                        name: r.name,
                        path: r.path,
                        method: r.method,
                        count: r.count
                    })
                }

            }
            res.end(JSON.stringify(arr))
        }
    })

    _d_.all({
        name: '/@admin/api/session',
        hide: true,
        callback: function (req, res) {

            res.htmlContent(_d_.toHtmlTable(req.session))
        }
    })

    _d_.all({
        name: '/@admin/api/sessions',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            var arr = []
            for (var i = 0; i < _d_.sessions.length; i++) {
                var s = _d_.sessions[i];
                arr.push({
                    ip: s.ip,
                    user_id: s.user_id,
                    modifiedTime: s.modifiedTime,
                    accessToken: s.accessToken,
                    createdTime: s.createdTime,
                    requestesCount: s.requestesCount
                })
            }
            res.end(JSON.stringify(arr))
        }
    })

    _d_.all({
        name: '/@admin/api/cookie',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(req.cookie))
        }
    })

    _d_.all({
        name: '/@admin/api/ips',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(_d_.ips))
        }
    })

    _d_.all({
        name: '/@admin/api/users',
        hide: true,
        callback: function (req, res) {
            res.set('x-content', 'from @server')
            res.set('Content-Type', 'application/json')
            res.json(_d_.security.users)
        }
    })

    _d_.all({
        name: '/@admin/api/user',
        hide: true,
        callback: function (req, res) {
            res.set('x-content', 'from @server')
            res.set('Content-Type', 'application/json')
            res.json(req.session.user)
        }
    })

    _d_.all({
        name: '/@admin/api/files',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            var arr = []
            for (var i = 0; i < _d_.fsm.list.length; i++) {
                var f = _d_.fsm.list[i];
                arr.push({
                    path: f.path,
                    count: f.count
                })
            }
            res.end(JSON.stringify(arr))
        }
    })


    _d_.all({
        name: '/@admin/api*',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify("USING BY BUILTIN ROUTING !! "))
        }
    })

    _d_.post("/@Language/Change", function(req, res) {
        let name = req.body.name || "ar"
        req.session.lang = name
        req.session.save()
        res.ending(JSON.stringify({done: true}))
      })


}