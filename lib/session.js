module.exports = function init(req, res, site) {

    let session = {}

    session.token = req.cookie.get('user_token')

    if (!session.token) {
        session.token = new Date().getTime().toString() + '_' + Math.random() * (10000 - 1000) + 1000
        req.cookie.set('user_token', session.token)
    }

    session.ip = req.ip
    session = site.trackSession(session)
    session.modifiedTime = new Date().getTime()


    session.set = function(key, value) {
        session.data[key] = value
        site.trackSession(session)
    }

    session.get = function(key) {
        return session.data[key]
    }

    return session
}