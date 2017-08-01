module.exports = function init(site) {

    let dir = __dirname + '/../isite_files'

    site.get({ name: '/@developer', path: dir + '/html/index.html' })
    site.get({ name: '/ximages', path: dir + '/images' })
    site.get({ name: '/xfonts', path: dir + '/fonts' })
    site.get({ name: '/xjs', path: dir + '/js' })
    site.get({ name: '/xcss', path: dir + '/css' })
    site.get({
        name: '/xjs/script.js',
        path: [
            dir + '/js/jquery.js',
            dir + '/js/bootstrap.js',
            dir + '/js/angular.js',
            dir + '/js/prism.js'
        ]
    })
    site.get({
        name: '/xcss/style.css',
        path: [
            dir + '/css/bootstrap.css',
            dir + '/css/font-awesome.css',
            dir + '/css/navbar.css',
            dir + '/css/custom.css',
            dir + '/css/prism.css'
        ]
    })


    site.all({
        name: '/@developer/api/vars',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.vars))
        }
    })


    site.all({
        name: '/@developer/api/routes',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.routeList))
        }
    })

    site.all({
        name: '/@developer/api/session',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(req.session))
        }
    })

    site.all({
        name: '/@developer/api/sessions',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.sessions))
        }
    })

    site.all({
        name: '/@developer/api/cookie',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(req.cookie))
        }
    })

    site.all({
        name: '/@developer/api/ips',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.ips))
        }
    })

    site.all({
        name: '/@developer/api/users',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.users))
        }
    })

    site.all({
        name: '/@developer/api/files',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.fileList))
        }
    })


    site.all({
        name: '/@developer/api*',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify("USING BY BUILTIN ROUTING !! "))
        }
    })


}