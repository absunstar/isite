module.exports = function init(site) {
    let http = require("http");
    let url = require("url");
    let qs = require("querystring");

    let routeList = [];


    function endResponse(req, res) {
        let route = req.route;

        res.setHeader("x-count", route.count);

        if (route.empty) {
            res.writeHeader(res.code);
            res.end();
            return;
        }

        req.content = route.content;

        if (route.parser == "html" && route.content && route.content.length > 0) {
            req.content = site.parser(req, res, site).html(route.content);
        }

        if (route.path.endsWith(".css")) {
            res.setHeader("Content-Type", "text/css");
            res.writeHeader(res.code);
            res.end(req.content);
        } else if (route.path.endsWith(".js")) {
            res.setHeader("Content-Type", "text/javascript");
            res.writeHeader(res.code);
            res.end(req.content);
        } else if (route.path.endsWith(".html")) {
            res.setHeader("Content-Type", "text/html");
            res.writeHeader(res.code);
            res.end(req.content);
        } else if (route.path.endsWith(".json")) {
            res.setHeader("Content-Type", "application/json");
            res.writeHeader(res.code);
            res.end(req.content);
        }else if (route.path.endsWith(".woff2")) {
            res.setHeader("Content-Type", "application/font-woff2");
            res.writeHeader(res.code);
            res.end(req.content , 'binary');
        }else if (route.path.endsWith(".woff")) {
            res.setHeader("Content-Type", "application/font-woff");
            res.writeHeader(res.code);
            res.end(req.content , 'binary');
        }else if (route.path.endsWith(".ttf")) {
            res.setHeader("Content-Type", "application/font-ttf");
            res.writeHeader(res.code);
            res.end(req.content , 'binary');
        }else if (route.path.endsWith(".svg")) {
            res.setHeader("Content-Type", "application/font-svg");
            res.writeHeader(res.code);
            res.end(req.content , 'binary');
        }else if (route.path.endsWith(".otf")) {
            res.setHeader("Content-Type", "application/font-otf");
            res.writeHeader(res.code);
            res.end(req.content , 'binary');
        }else if (route.path.endsWith(".eot")) {
            res.setHeader("Content-Type", "application/font-eot");
            res.writeHeader(res.code);
            res.end(req.content , 'binary');
        }else if (route.path.endsWith(".png")) {
            res.setHeader("Content-Type", "image/png");
            res.writeHeader(res.code);
            res.end(req.content , 'binary');
        }else if (route.path.endsWith(".jpg")) {
            res.setHeader("Content-Type", "image/jpg");
            res.writeHeader(res.code);
            res.end(req.content , 'binary');
        }else if (route.path.endsWith(".jpeg")) {
            res.setHeader("Content-Type", "image/jpeg");
            res.writeHeader(res.code);
            res.end(req.content , 'binary');
        }else if (route.path.endsWith(".ico")) {
            res.setHeader("Content-Type", "image/ico");
            res.writeHeader(res.code);
            res.end(req.content , 'binary');
        }else if (route.path.endsWith(".bmp")) {
            res.setHeader("Content-Type", "image/bmp");
            res.writeHeader(res.code);
            res.end(req.content , 'binary');
        } else {
            res.writeHeader(res.code);
            res.end(req.content);
        }
    }

    function defaultCallback(req, res) {
        let route = req.route;

        if (route.cache && route.content) {
            res.setHeader("x-content", "Route memory");
            res.code = 200;
            endResponse(req, res);
            return;
        }

        if (route.empty) {
            res.setHeader("x-content", "Route Empty");
            res.code = 404;
            endResponse(req, res);
            return;
        }

        if (!route.path) {
            res.setHeader("x-content", "Route Not Set File Path");
            res.code = 200;
            endResponse(req, res);
            return;
        }

        if (typeof route.path == "string") {
            site.readFile(route.path, function(err, data) {
                if (!err) {
                    route.content = data.toString("utf8");
                    if (route.masterPage) {
                        for (var i = 0; i < site.masterPages.length; i++) {
                            if (route.masterPage == site.masterPages[i].name) {
                                route.content =
                                    site.readFileSync(site.masterPages[i].header) +
                                    route.content +
                                    site.readFileSync(site.masterPages[i].footer);
                                break;
                            }
                        }
                    }
                    res.setHeader("x-content", "Route Read File");
                    res.code = 200;
                    endResponse(req, res);
                } else {
                    res.setHeader("x-error", "Route Error Read File");
                    res.code = 404;
                    route.empty = true;
                    endResponse(req, res);
                    return;
                }
            });
        } else if (typeof route.path == "object") {
            site.readFiles(route.path, function(err, data) {
                if (!err) {
                    res.setHeader("x-content", "Route Read Files");
                    route.content = data.toString("utf8");
                    res.code = 200;
                    route.path = route.path.join("&&");
                    endResponse(req, res);
                } else {
                    res.setHeader("x-error", "Route Error Read Files");
                    res.code = 404;
                    route.empty = true;
                    endResponse(req, res);
                    return;
                }
            });
        }
    }

    function add(r, callback) {
        let route =
            typeof r == "string" ? {
                name: r.toLowerCase(),
                method: "GET",
                path: null,
                parser: "static",
                cache: true,
                map: [],
                callback: callback || defaultCallback
            } : {
                name: r.name.toLowerCase(),
                method: r.method || "GET",
                path: r.path || null,
                content: r.content,
                parser: r.parser || "static",
                masterPage: r.masterPage || null,
                cache: typeof r.cache == "undefined" ? true : r.cache,
                map: r.map || [],
                callback: r.callback || defaultCallback
            };
        let arr = route.name.split("/");
        for (var i = 0; i < arr.length; i++) {
            var s = arr[i];
            if (s.startsWith(":")) {
                arr[i] = "*";
                route.map.push({
                    index: i,
                    name: s.replace(":", "").toLowerCase()
                });
            }
        }
        route.name = arr.join("/");
        routeList.push(route);
    }

    return {
        list: routeList,
        add: add,
        get: function(r, callback) {
            let route =
                typeof r == "string" ? {
                    name: r.toLowerCase(),
                    method: "GET",
                    callback: callback || defaultCallback
                } :
                r;
            route.method = "GET";
            add(route);
        },
        post: function(r, callback) {
            let route =
                typeof r == "string" ? {
                    name: r.toLowerCase(),
                    method: "POST",
                    callback: callback || defaultCallback
                } :
                r;
            route.method = "POST";
            add(route);
        },
        put: function(r, callback) {
            let route =
                typeof r == "string" ? {
                    name: r.toLowerCase(),
                    method: "PUT",
                    callback: callback || defaultCallback
                } :
                r;
            route.method = "PUT";
            add(route);
        },
        delete: function(r, callback) {
            let route =
                typeof r == "string" ? {
                    name: r.toLowerCase(),
                    method: "Delete",
                    callback: callback || defaultCallback
                } :
                r;
            route.method = "Delete";
            add(route);
        },
        all: function(r, callback) {
            let route =
                typeof r == "string" ? {
                    name: r.toLowerCase(),
                    method: "*",
                    callback: callback || defaultCallback
                } :
                r;
            route.method = "*";
            add(route);
        },
        sendGet: function() {
            let req = http.get("http://www.google.co.za/", function(res) {
                res.setEncoding();
                res.on("data", function(chunk) {
                    console.log(chunk.length);
                    res.destroy();
                });
            });
        },
        run: function() {
            //First Function Will Run With Every Request
            let app = http.createServer(function(req, res) {
                res.setHeader("CharSet", "UTF-8");
                res.setHeader("Access-Control-Allow-Origin", req.headers.host);

                req.ip = req.connection.remoteAddress.replace("::ffff:", "");
                req.cookie = site.cookie(req, res);
                if(site.sessionEnabled){
                    req.session = site.session(req, res, site);
                }

                let url_route = url.parse(req.url.toLowerCase(), true);

                for (let i = 0; i < routeList.length; i++) {
                    let r = routeList[i];
                    if (
                        req.method.toLowerCase().like(r.method.toLowerCase()) &&
                        url_route.pathname.like(r.name)
                    ) {
                        if (!r.count) {
                            r.count = 0;
                        }
                        r.count++;
                        req.route = r;
                        req.url = url_route;
                        req.url.arr = req.url.pathname.split('/');
                        for (let i = 0; i < req.route.map.length; i++) {
                            let map = req.route.map[i];
                            req.url.query[map.name] = req.url.arr[map.index];
                        }

                        if (!req.method.toLowerCase().like("get")) {
                            req.body = "";
                            req.on("data", function(data) {
                                req.body += data;
                                if (req.body.length > 1e6) req.connection.destroy();
                            });
                            req.on("end", function() {
                                req.body = qs.parse(req.body);
                                r.callback(req, res);
                            });
                        } else {
                            r.callback(req, res);
                        }

                        return;
                    }
                }

                if (url_route.pathname == "/") {
                    res.setHeader("x-message", "unhandled route");
                    res.writeHeader(200);
                    res.end("you not handle your route / yet !!");
                    return;
                }

                res.setHeader("x-message", "unhandled route");
                res.writeHeader(404);
                res.end();
            });

            app.listen(site.port, function() {
                console.log("");
                console.log("-----------------------------------------");
                console.log(" Isite Running on Port : " + site.port);
                console.log("-----------------------------------------");
                console.log("");
            });
        }
    };
};