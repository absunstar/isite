module.exports = function init(_s_) {
    const sessions = function () {}
    sessions.list = []
    let $sessions = {}

    if (_s_.options.mongodb.enabled) {
        $sessions = _s_.connectCollection({
            db: _s_.options.session.db,
            collection: _s_.options.session.collection
        })
    }

    _s_.on('[session][update]' , session =>{
        sessions.list.forEach(s => {
            if (s.accessToken == session.accessToken) {
                for (var key in session) {
                    if (session.hasOwnProperty(key) && key !== "accessToken") {
                        key = key.toLowerCase()
                        for (var i = 0; i < s.data.length; i++) {
                            var obj = s.data[i];
                            if (obj.key === key) {
                                s.data[i] = {
                                    key: key,
                                    value: _s_.copy(session[key])
                                }
                            }
                        }
                        s.data.push({
                            key: key,
                            value: _s_.copy(session[key])
                        })
                    }
                }
            }
      })
    })
    _s_.on('[session][delete]' , session =>{
        sessions.list.forEach((s , i) => {
            if (s.accessToken == session.accessToken) {
                sessions.list.splice(i , 1)
            }
      })
    })
    _s_.on('[session][user][update]' , user =>{
        sessions.list.forEach(s => {
            if (s.user && s.user.id == user.id) {
                s.user = user
            }
      })
    })

    sessions.loadAll = function (callback) {
        callback = callback || function (err, docs) {
            if (!err && docs) {
                sessions.list = docs
            }
        }
        if (_s_.options.session.storage !== 'mongodb' || _s_.options.mongodb.enabled === false) {
            callback({
                message: 'storage not monodb'
            }, null)

            return
        }
        $sessions.findMany({
                where: {},
                select: {},
                limit: 100000
            },
            function (err, docs) {
                callback(err, docs)
            }
        )
    }

    sessions.saveAll = function (callback) {

        callback = callback || function () {}

        if (_s_.options.session.timeout === 0) {
            callback({
                message: 'Timout is Zero And Sessions Will Not Saved In DB '
            })
            return
        }

        sessions.list = sessions.list.filter(s => {
            let online = new Date().getTime() - s.createdTime
            let timeout = 1000 * 60 * _s_.options.session.timeout
            return online < timeout
        }).filter(s => s.requestesCount > 1)

        if (_s_.options.session.storage !== 'mongodb' || _s_.options.mongodb.enabled === false) {
            callback({
                message: 'storage not monodb'
            }, null)

            return
        }

        if (sessions.busy === true) {
            _s_.log('sessions is busy')
            callback({
                message: 'sessions is busy'
            }, null)
            return
        }

        sessions.busy = true


        $sessions.deleteMany({
                where: {}
            },
            function (err, result) {
                sessions.busy = false
                if (sessions.list.length === 0) {
                    
                    callback({
                        message: 'sessions is empty'
                    }, null)
                    return
                }

                $sessions.insertMany(sessions.list, function (err, docs) {
                    callback(err, docs)
                    sessions.busy = false
                })
            }
        )
    }

    sessions.handle = function (session, callback) {

        callback = callback || function () {}

        if (sessions.list === undefined) {
            sessions.list = []
        }

        let session_exists = false

        sessions.list.forEach((s , i) => {
            if (s.accessToken == session.accessToken) {
                session_exists = true

                session.createdTime = s.createdTime
                session.data = session.data || s.data || []
                session.lang = session.lang || s.lang || _s_.options.lang
                session.theme = session.theme || s.theme || _s_.options.theme
                session.requestesCount = s.requestesCount + 1
                session.ip_info = session.ip_info || s.ip_info || {}
                session.busy = typeof session.busy == "undefined" ? s.busy : session.busy

                sessions.list[i] = {
                    accessToken: session.accessToken,
                    createdTime: session.createdTime,
                    modifiedTime: session.modifiedTime,
                    data: session.data,
                    lang: session.lang,
                    theme: session.theme,
                    ip: session.ip,
                    requestesCount: session.requestesCount,
                    busy: session.busy,
                    ip_info: session.ip_info
                }
                callback(session)
            }
        })

        if (!session_exists) {
            session.$new = true
            session.lang = _s_.options.lang
            session.theme = _s_.options.theme
            session.data = []
            session.ip_info = session.ip_info || {}
            session.requestesCount = 1
            session.createdTime = new Date().getTime()
            sessions.list.push({
                accessToken: session.accessToken,
                createdTime: session.createdTime,
                modifiedTime: session.modifiedTime,
                data: session.data,
                ip: session.ip,
                requestesCount: session.requestesCount,
                busy: session.busy,
                ip_info: session.ip_info
            })
            callback(session)
        }
        return session
    }

    _s_.on("[any][saving data]", function () {
        sessions.saveAll()
    })

    sessions.busy = false

    function loadAllSessions() {

        sessions.busy = true

        if (_s_.options.session.storage !== 'mongodb' || _s_.options.mongodb.enabled === false) {
            sessions.busy = false
            return
        }

        sessions.loadAll((err, docs) => {
            if (!err) {
                sessions.list = docs
                sessions.busy = false
            } else {
                console.log(err)
                setTimeout(() => {
                    loadAllSessions()
                }, 250);
            }

        })
    }

    loadAllSessions()

    _s_.get('x-api/sessions' , (req , res)=>{
        res.json({
            done : true ,
            list : sessions.list
        })
    })

    _s_.get('x-api/sessions/save' , (req , res)=>{
        sessions.saveAll()
        res.json({
            done : true
        })
    })
    _s_.get('x-api/sessions/delete' , (req , res)=>{
        sessions.list = []
        sessions.saveAll((err, docs)=>{
            res.json({
                err : err,
                docs : docs,
                done : true
            })
        })
    
    })
    return sessions
}