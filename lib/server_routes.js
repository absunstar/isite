module.exports = function init(site) {

    site.all({
        name: '/@server/vars',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.vars))
        }
    })


    site.all({
        name: '/@server/routes',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.route.list))
        }
    })

    site.all({
        name: '/@server/session',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(req.session))
        }
    })

    site.all({
        name: '/@server/sessions',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.sessions))
        }
    })

    site.all({
        name: '/@server/cookie',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(req.cookie))
        }
    })

    site.all({
        name: '/@server/ips',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.ips))
        }
    })

    site.all({
        name: '/@server/users',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.users))
        }
    })

    site.all({
        name: '/@server/files',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.files))
        }
    })


 site.all({
        name: '/@server*',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify("USING BY BUILTIN ROUTING !! "))
        }
    })


}