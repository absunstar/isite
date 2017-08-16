module.exports = function init(req, res, site, callback) {



    let session = {}

    session.set = function (key, value) {
        key = key.toLowerCase()
        for (var i = 0; i < session.data.length; i++) {
            var obj = session.data[i];
            if (obj.key == key) {
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

    session.accessToken = req.cookie.get('access_token')

    if (!session.accessToken) {
        session.accessToken = new Date().getTime().toString() + '_' + Math.random() * (10000 - 1000) + 1000
        req.cookie.set('access_token', site.md5(session.accessToken))
    }

    session.ip = req.ip
    session.modifiedTime = new Date().getTime()
    session = site.trackSession(session)


    session.user_id = session.get('user_id')

    if (session.user_id) {
        site.security.getUser(session.user_id, function (err, user) {
            session.user = user
            if (session.user) {
                delete session.user.password
                if (session.user.permissions) {
                    session.user.permissions.push('login')
                }
            }
            callback(session)
        })
    } else {
        callback(session)
    }


}