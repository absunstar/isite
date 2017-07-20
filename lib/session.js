module.exports = function init(req, res) {

    let session = {}
    session.guid = ()=>{
        return new Date().getTime().toString() + '_' + Math.random() * (10000 - 1000) + 1000;
    }
    
    session.token = req.cookie.get('user_token')

    if (!session.token) {
        session.token = session.guid()
        req.cookie.set('user_token', session.token)
    }

    session.ip = req.ip


    session.set = function () {

    }

    session.get = function () {

    }

    return session
}