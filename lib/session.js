module.exports = function init(req, res, ____0, callback) {
    ____0._userAgentFeatureCache = ____0._userAgentFeatureCache || new Map();
    const uaCache = ____0._userAgentFeatureCache;
    const UA_CACHE_MAX = 512;
    const USER_CACHE_TTL = (____0.options.session && ____0.options.session.userCacheTTL) || 30000;
    ____0.getSession(req, (session) => {
        session.$save = function () {
            ____0.saveSession(session);
        };

     

        session.ip = req.ip;
        session.modifiedTime = new Date().getTime();

        function AssignFeatures() {
            ____0.options.defaults.features.forEach((f) => {
                req.features.push(f);
            });
            ____0.features.forEach((f) => {
                req.features.push(f.name);
            });
            if (____0.options.dynamic) {
                req.features.push('site.dynamic');
            }
            req.features.push('ip.' + req.ip);
            req.features.push('url.' + req.url);

            if (req.host) {
                req.features.push('host.' + req.host);
                req.hostArray = req.host.split(':')[0].split('.').reverse();
                if (req.hostArray[0] == 'localhost') {
                    req.domain = req.hostArray[0];
                    req.features.push('host.' + req.hostArray[0]);
                    if (req.hostArray.length == 2) {
                        req.domain2 = req.hostArray[1];
                        req.features.push('host.' + req.hostArray[1]);
                    } else if (req.hostArray.length == 3) {
                        req.domain2 = req.hostArray[1];
                        req.domain3 = req.hostArray[2];
                        req.features.push('host.' + req.domain2);
                        req.features.push('host.' + req.domain3);
                    }
                } else {
                    if (req.hostArray.length == 2) {
                        req.domain = req.hostArray[1] + '.' + req.hostArray[0];
                        req.features.push('host.' + req.domain);
                        req.features.push('host.' + req.hostArray[0]);
                        req.features.push('host.' + req.hostArray[1]);
                    } else if (req.hostArray.length == 3) {
                        req.domain = req.hostArray[1] + '.' + req.hostArray[0];
                        req.domain2 = req.hostArray[2];
                        req.features.push('host.' + req.domain);
                        req.features.push('host.' + req.hostArray[0]);
                        req.features.push('host.' + req.hostArray[1]);
                        req.features.push('host.' + req.hostArray[2]);
                    } else if (req.hostArray.length == 4) {
                        req.domain = req.hostArray[1] + '.' + req.hostArray[0];
                        req.domain2 = req.hostArray[2];
                        req.domain3 = req.hostArray[3];
                        req.features.push('host.' + req.domain);
                        req.features.push('host.' + req.hostArray[0]);
                        req.features.push('host.' + req.hostArray[1]);
                        req.features.push('host.' + req.hostArray[2]);
                        req.features.push('host.' + req.hostArray[3]);
                    }
                }
            }

            if (req.headers['x-browser']) {

                req.browserHeader = req.headers['x-browser'];
                req.browserName = req.browserHeader.split('.')[0];
                req.browserID = req.browserHeader.split('.').pop();
                req.browserUUID = req.browserHeader.split('_').pop();

                req.features.push('browser.social');
                req.features.push('browser.' + req.browserHeader);
                req.features.push('browser.' + req.browserName);
                req.features.push('browser.' + req.browserID);
                req.features.push('browser.' + req.browserUUID);
            }

            if (req.headers['user-agent']) {
                req.userAgent = req.headers['user-agent'].toLowerCase();
                req.features.push('user-agent.' + req.userAgent);
                let cached = uaCache.get(req.userAgent);
                if (!cached) {
                    cached = [];
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(req.userAgent)) cached.push('os.mobile');
                    else cached.push('os.desktop');
                    if (req.userAgent.includes('windows')) {
                        cached.push('os.windows');
                        if (req.userAgent.includes('windows nt 5.1')) cached.push('os.windowsxp');
                        else if (req.userAgent.includes('windows nt 6.1')) cached.push('os.windows7');
                        else if (req.userAgent.includes('windows nt 6.2') || req.userAgent.includes('windows nt 6.3')) cached.push('os.windows8');
                        else if (req.userAgent.includes('windows nt 6.4') || req.userAgent.includes('windows nt 10')) cached.push('os.windows10');
                    } else if (req.userAgent.includes('android')) cached.push('os.android');
                    else if (req.userAgent.includes('linux')) cached.push('os.linux');
                    else if (req.userAgent.includes('macintosh')) cached.push('os.mac');
                    else cached.push('os.unknown');

                    if (req.userAgent.includes('edge') || req.userAgent.includes('edg/')) cached.push('browser.edge');
                    else if (req.userAgent.includes('firefox')) cached.push('browser.firefox');
                    else if (req.userAgent.includes('opr')) cached.push('browser.opera');
                    else if (req.userAgent.includes('ucbrowser')) cached.push('browser.ucbrowser');
                    else if (req.userAgent.includes('bdbrowser') || req.userAgent.includes('baidu')) cached.push('browser.baidu');
                    else if (req.userAgent.includes('chromium')) cached.push('browser.chromium');
                    else if (req.userAgent.includes('chrome')) cached.push('browser.chrome');
                    else cached.push('browser.unknown');
                    uaCache.set(req.userAgent, cached);
                    if (uaCache.size > UA_CACHE_MAX) uaCache.delete(uaCache.keys().next().value);
                }
                req.features.push(...cached);
            }
        }

        AssignFeatures();

           if (session.$new) {
            session.$new = !1;
            res.cookie('access_token', session.accessToken);
            res.set('Access-Token', session.accessToken);
        }
        
        // Cache the authenticated user on the session to avoid a database read for every resource request.
        const now = Date.now();
        const userCacheFresh = session.user && session.$userLoadedAt && now - session.$userLoadedAt < USER_CACHE_TTL;
        if (session.user_id && userCacheFresh) {
            req.features.push('login');
            callback(session);
            session.$save();
        } else if (session.user_id) {
            ____0.security.getUser({ id: session.user_id }, function (err, user) {
                if (!err && user) {
                    req.features.push('login');
                    session.user = user;
                    session.$userLoadedAt = Date.now();
                } else {
                    session.user = null;
                    session.user_id = null;
                    session.$userLoadedAt = 0;
                }
                callback(session);
                session.$save();
            });
        } else if (session.user) {
            if (userCacheFresh) {
                req.features.push('login');
                callback(session);
                session.$save();
            } else {
                ____0.security.getUser({ email: session.user.email }, function (err, user) {
                    if (!err && user) {
                        req.features.push('login');
                        session.user_id = user.id;
                        session.user = user;
                        session.$userLoadedAt = Date.now();
                    } else {
                        session.user = null;
                        session.user_id = null;
                        session.$userLoadedAt = 0;
                    }
                    callback(session);
                    session.$save();
                });
            }
        } else {
            callback(session);
            session.$save();
        }
    });
};
