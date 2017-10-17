module.exports = function init(site) {

    let dir = __dirname + '/../isite_files'

    site.get({
        name: '/@admin',
        path: dir + '/html/index.html',
        parser: 'html',
        parserDir: dir,
        hide: true
    })
    site.get({
        name: '/@images',
        path: dir + '/images',
        hide: true
    })
    site.get({
        name: '/@fonts',
        path: dir + '/fonts',
        hide: true
    })
    site.get({
        name: '/@js',
        path: dir + '/js',
        hide: true
    })
    site.get({
        name: '/@css',
        path: dir + '/css',
        compress: true,
        hide: true
    })
    site.get({
        name: '/@css/bootstrap3.css',
        path: [dir + '/css/bootstrap.css', dir + '/css/navbar.css'],
        compress: true,
        hide: true
    })
    site.get({
        name: '/@js/bootstrap3.js',
        path: dir + '/js/bootstrap.js',
        hide: true
    })

    site.get({
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
    site.get({
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


    site.all({
        name: '/@admin/api/vars',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.vars))
        }
    })


    site.all({
        name: '/@admin/api/routes',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            var arr = []
            for (var i = 0; i < site.routeList.length; i++) {
                var r = site.routeList[i];
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

    site.all({
        name: '/@admin/api/session',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(req.session))
        }
    })

    site.all({
        name: '/@admin/api/sessions',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            var arr = []
            for (var i = 0; i < site.sessions.length; i++) {
                var s = site.sessions[i];
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

    site.all({
        name: '/@admin/api/cookie',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(req.cookie))
        }
    })

    site.all({
        name: '/@admin/api/ips',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.ips))
        }
    })

    site.all({
        name: '/@admin/api/users',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.users))
        }
    })

    site.all({
        name: '/@admin/api/files',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            var arr = []
            for (var i = 0; i < site.fileList.length; i++) {
                var f = site.fileList[i];
                arr.push({
                    path: f.path,
                    count: f.count
                })
            }
            res.end(JSON.stringify(arr))
        }
    })


    site.all({
        name: '/@admin/api*',
        hide: true,
        callback: function (req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify("USING BY BUILTIN ROUTING !! "))
        }
    })

    site.post("/@Language/Change", function(req, res) {
        let name = req.body.name || "ar"
        req.session.lang = name
        req.session.save()
        res.ending(JSON.stringify({done: true}))
      })


}