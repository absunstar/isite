module.exports = function init(site) {

    site.addRoute({
        name: '/@server/vars',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.vars))
        }
    })


    site.addRoute({
        name: '/@server/routes',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.route.list))
        }
    })

    site.addRoute({
        name: '/@server/session',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(req.session))
        }
    })

    site.addRoute({
        name: '/@server/sessions',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.sessions))
        }
    })

    site.addRoute({
        name: '/@server/cookie',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(req.cookie))
        }
    })

    site.addRoute({
        name: '/@server/ips',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.ips))
        }
    })

    site.addRoute({
        name: '/@server/users',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.users))
        }
    })

    site.addRoute({
        name: '/@server/files',
        callback: function(req, res) {
            res.setHeader('x-content', 'from @server')
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(200)
            res.end(JSON.stringify(site.files))
        }
    })




}