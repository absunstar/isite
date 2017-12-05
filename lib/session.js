module.exports = function init(req, res, site, callback) {


    let session = function(key , value){
        if(value === undefined){
           return session.get(key)
        }else{
            session.set(key , value)
        }
    }

    session.set = function (key, value) {
        key = key.toLowerCase()
        for (var i = 0; i < session.data.length; i++) {
            var obj = session.data[i];
            if (obj.key === key) {
                session.data[i] = {
                    key: key,
                    value: value
                }
                site.trackSession(session)
                return
            }

        }

        session.data.push({
            key: key,
            value: site.copy(value)
        })


        site.trackSession(session)
    }

    session.get = function (key) {
        key = key.toLowerCase()
        for (var i = 0; i < session.data.length; i++) {
            var d = session.data[i];
            if (d.key == key) {
                return site.copy(session.data[i].value)
                break
            }
        }
    }

    session.accessToken = req.cookie('access_token')

    if (!session.accessToken) {
        session.accessToken = new Date().getTime().toString() + '_' + Math.random() * (10000 - 1000) + 1000
        req.cookie('access_token', site.md5(session.accessToken))
    }

    session.ip = req.ip
    session.modifiedTime = new Date().getTime()
    session = site.trackSession(session)
    session.save = function () {
        session = site.trackSession(session)
    }

    function getFeatures() {
        session.features = []
        session.features.push('ip.' + req.ip)
        if (req.headers['user-agent']) {
            session.userAgent = req.headers['user-agent'].toLowerCase()

            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(session.userAgent)) {
                session.features.push('os.mobile')
            } else {
                session.features.push('os.desktop')
            }

            if (session.userAgent.contains('windows')) {
                session.features.push('os.windows')
                if (session.userAgent.contains('windows nt 5.1')) {
                    session.features.push('os.windowsxp')
                } else if (session.userAgent.contains('windows nt 6.1')) {
                    session.features.push('os.windows7')
                } else if (session.userAgent.contains('windows nt 6.2') || session.userAgent.contains('windows nt 6.3')) {
                    session.features.push('os.windows8')
                } else if (session.userAgent.contains('windows nt 6.4') || session.userAgent.contains('windows nt 10')) {
                    session.features.push('os.windows10')
                }else{

                }
            } else if (session.userAgent.contains('linux')) {
                session.features.push('os.linux')
            } else if (session.userAgent.contains('macintosh')) {
                session.features.push('os.mac')
            } else if (session.userAgent.contains('android')) {
                session.features.push('os.android')
            }



            if (session.userAgent.contains('edge')) {
                session.features.push('browser.edge')
            } else if (session.userAgent.contains('firefox')) {
                session.features.push('browser.firefox')
            } else if (session.userAgent.contains('chrome')) {
                session.features.push('browser.chrome')
            } else {
                session.features.push('browser.explorer')
            }


        }
    }

    getFeatures()

    session.user_id = session.get('user_id')

    if (session.user_id) {
        site.security.getUser(session.user_id, function (err, user) {
            session.user = user
            if (session.user) {
                if (!session.user.permissions) {
                    session.user.permissions = []
                }
                session.user.permissions.push('login')
            }
            callback(session)
        })
    } else {
        callback(session)
    }


}