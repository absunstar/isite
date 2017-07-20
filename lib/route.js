module.exports = function init(site) {
    let http = require('http')
    let url = require('url')

    let routeList = []


    function endResponse(req, res) {

        let route = req.route

        res.setHeader('x-count', route.count)

        if (route.empty) {
            res.writeHeader(res.code)
            res.end()
            return
        }

        req.content = route.content

        if (route.parser == 'html' && route.content && route.content.length > 0) {
            req.content = site.parser(req, res).html(route.content)
        }

        if (route.path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css')
            res.writeHeader(res.code)
            res.end(req.content)
        } else if (route.path.endsWith('.js')) {
            res.setHeader('Content-Type', 'text/javascript')
            res.writeHeader(res.code)
            res.end(req.content)
        } else if (route.path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html')
            res.writeHeader(res.code)
            res.end(req.content)
        } else if (route.path.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json')
            res.writeHeader(res.code)
            res.end(req.content)
        } else {
            res.writeHeader(res.code)
            res.end(req.content)
        }

    }

    function defaultCallback(req, res) {

        let route = req.route

        if (route.cache && route.content) {
            res.setHeader('x-content', 'from memory')
            res.code = 200
            endResponse(req, res)
            return
        }

        if (route.empty) {
            res.setHeader('x-content', 'empty from memory')
            res.code = 404
            endResponse(req, res)
            return
        }

        if (route.path == '') {
            res.setHeader('x-content', 'no path')
            res.code = 200
            endResponse(req, res)
            return
        }

        site.readFile(route.path, function(err, data) {

            if (!err) {
                route.content = data.toString('utf8')

                res.setHeader('x-content', 'from file')
                res.code = 200
                endResponse(req, res)
            } else {
                res.setHeader('x-error', 'can not read file')
                res.code = 404
                route.empty = true;
                endResponse(req, res)
                return
            }



        })
    }


    function add(r, callback) {
        let route = typeof r == 'string' ? {
            name: r.toLowerCase(),
            method: 'GET',
            path: '',
            parser: 'static',
            cache: true,
            callback: callback || defaultCallback
        } : {
            name: r.name.toLowerCase(),
            method: r.method || 'GET',
            path: r.path || '',
            content: r.content,
            parser: r.parser || 'static',
            cache: typeof r.cache == 'undefined' ? true : r.cache,
            callback: r.callback || defaultCallback
        }
        routeList.push(route)
    }

    return {
        list: routeList,
        add: add,
        get: function(r, callback) {
            let route = typeof r == 'string' ? {
                name: r.toLowerCase(),
                method: 'GET',
                callback: callback || defaultCallback
            } : r;
            route.method = 'GET'
            add(route)
        },
        post: function(r, callback) {
            let route = typeof r == 'string' ? {
                name: r.toLowerCase(),
                method: 'POST',
                callback: callback || defaultCallback
            } : r;
            route.method = 'POST'
            add(route)
        },
        sendGet: function() {
            let req = http.get("http://www.google.co.za/", function(res) {
                res.setEncoding()
                res.on('data', function(chunk) {
                    console.log(chunk.length)
                    res.destroy()
                })
            })
        },
        run: function() { //First Function Will Run With Every Request
            let app = http.createServer(function(req, res) {

                res.setHeader('CharSet', 'UTF-8')
                res.setHeader('Access-Control-Allow-Origin', req.headers.host)

                req.ip = req.connection.remoteAddress.replace('::ffff:', '')
                req.cookie = site.cookie(req, res)
                req.session = site.session(req, res, site)


                let route = url.parse(req.url.toLowerCase(), true)
                for (let index = 0; index < routeList.length; index++) {
                    let r = routeList[index]
                    if (r.method.toLowerCase() == req.method.toLowerCase() && r.name == route.pathname) {
                        if (!r.count) {
                            r.count = 0
                        }
                        r.count++;
                        req.route = r
                        r.callback(req, res)
                        return
                    }
                }


                if (route.pathname == '/') {
                    res.setHeader('x-message', 'unhandled route')
                    res.writeHeader(200)
                    res.end('you not handle your route / yet !!')
                    return
                }
                res.setHeader('x-message', 'unhandled route')
                res.writeHeader(404)
                res.end()

            })

            app.listen(site.port, function() {
                console.log('')
                console.log('-----------------------------------------')
                console.log(' Isite Running on Port : ' + site.port)
                console.log('-----------------------------------------')
                console.log('')
            })
        }
    }
}