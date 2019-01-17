module.exports = function init(req, res, site, callback) {


    let session = function (key, value) {
        if (value === undefined) {
            return session.get(key)
        } else {
            session.set(key, value)
        }
    }

    session.save = function () {
        session = site.sessions.handle(session)
    }


    session.set = function (key, value) {
        key = key.toLowerCase()
        for (var i = 0; i < session.data.length; i++) {
            var obj = session.data[i];
            if (obj.key === key) {
                session.data[i] = {
                    key: key,
                    value: site.copy(value)
                }
                session.save()
                return
            }
        }

        session.data.push({
            key: key,
            value: site.copy(value)
        })

        session.save()
    }

    session.get = function (key) {
        key = key.toLowerCase()
        for (var i = 0; i < session.data.length; i++) {
            var d = session.data[i];
            if(key.indexOf('.') != -1){
                if (d.key == key.split('.')[0]) {
                    return site.fromJson(site.copy(session.data[i].value))[key.split('.')[1]]
                    break
                }
            }else{
                if (d.key == key) {
                    return site.copy(session.data[i].value)
                    break
                }
            }
            
        }
        return null
    }

    session.accessToken = req.cookie('access_token')

    if (!session.accessToken) {
        session.accessToken = new Date().getTime().toString() + '_' + Math.random() * (10000 - 1000) + 1000
        session.accessToken = site.md5(session.accessToken)
        res.cookie('access_token', session.accessToken)
        
    }

    session.ip = req.ip
    session.modifiedTime = new Date().getTime()
    session.save()


    function AssignFeatures() {
        req.features = []
        req.features.push('ip.' + req.ip)
        if (req.headers['user-agent']) {
            req.userAgent = req.headers['user-agent'].toLowerCase()
            req.features.push('user-agent' + req.userAgent)
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(req.userAgent)) {
                req.features.push('os.mobile')
            } else {
                req.features.push('os.desktop')
            }

            if (req.userAgent.contains('windows')) {
                req.features.push('os.windows')
                if (req.userAgent.contains('windows nt 5.1')) {
                    req.features.push('os.windowsxp')
                } else if (req.userAgent.contains('windows nt 6.1')) {
                    req.features.push('os.windows7')
                } else if (req.userAgent.contains('windows nt 6.2') || req.userAgent.contains('windows nt 6.3')) {
                    req.features.push('os.windows8')
                } else if (req.userAgent.contains('windows nt 6.4') || req.userAgent.contains('windows nt 10')) {
                    req.features.push('os.windows10')
                } else {

                }
            } else if (req.userAgent.contains('linux')) {
                req.features.push('os.linux')
            } else if (req.userAgent.contains('macintosh')) {
                req.features.push('os.mac')
            } else if (req.userAgent.contains('android')) {
                req.features.push('os.android')
            }



            if (req.userAgent.contains('edge')) {
                req.features.push('browser.edge')
            } else if (req.userAgent.contains('firefox')) {
                req.features.push('browser.firefox')
            } else if (req.userAgent.contains('chrome')) {
                req.features.push('browser.chrome')
            } else {
                req.features.push('browser.explorer')
            }


        }
    }

    AssignFeatures()

    session.user_id = session('user_id')
    if (site.security && session.user_id !== undefined) {
        site.security.getUser({id : session.user_id}, function (err, user) {
            session.user = user
            if (session.user) {
                if (!session.user.permissions) {
                    session.user.permissions = []
                }
                req.features.push('login')
            }
            callback(session)
        })
    } else {
        callback(session)
    }


}