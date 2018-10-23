module.exports = function init(site) {
    const sessions = function () {}
    sessions.list = []
    let $sessions = {}

    if (site.options.mongodb.enabled) {
         $sessions = site.connectCollection({
            db: site.options.session.db,
            collection: site.options.session.collection
        })
    }
   

    sessions.loadAll = function (callback) {
        callback = callback || function (err, docs) {
            if (!err && docs) {
                sessions.list = docs
            }
        }
        if (site.options.session.storage !== 'mongodb' || site.options.mongodb.enabled === false) {
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

        callback = callback || function(){}

        if(site.options.session.timeout === 0){
            callback({message : 'Timout is Zero And Sessions Will Not Saved In DB '})
            return
        }

        sessions.list = sessions.list.filter(s => {
            let online = new Date().getTime() - s.createdTime
            let timeout = 1000 * 60 * site.options.session.timeout
            return online < timeout
        }).filter(s => s.requestesCount > 1)

        if (site.options.session.storage !== 'mongodb' || site.options.mongodb.enabled === false) {
            callback({
                message: 'storage not monodb'
            }, null)

            return
        }

        if (sessions.busy === true) {
            site.log('sessions is busy')
            return
        }

        sessions.busy = true
        

        $sessions.deleteMany({
                where: {}
            },
            function (err, result) {

                if (sessions.list.length === 0) {
                    sessions.busy = false
                    return
                }
                $sessions.insertMany(sessions.list, function (err, docs) {
                    callback(err, docs)
                    sessions.busy = false
                })
            }
        )
    }


    sessions.handle = function (session) {
        if (sessions.list === undefined) {
            sessions.list = []
        }

        for (var i = 0; i < sessions.list.length; i++) {
            var s = sessions.list[i]
            if (s.accessToken == session.accessToken) {
                session.createdTime = s.createdTime
                session.data = session.data || s.data || []
                session.lang = session.lang || s.lang || site.options.lang
                session.theme = session.theme || s.theme || site.options.theme
                session.requestesCount = s.requestesCount + 1

                sessions.list[i] = {
                    accessToken: session.accessToken,
                    createdTime: session.createdTime,
                    modifiedTime: session.modifiedTime,
                    data: session.data,
                    lang: session.lang,
                    theme: session.theme,
                    ip: session.ip,
                    requestesCount: session.requestesCount
                }
                return session
            }
        }

        session.lang = site.options.lang
        session.theme = site.options.theme
        session.data = []
        session.requestesCount = 1
        session.createdTime = new Date().getTime()
        sessions.list.push({
            accessToken: session.accessToken,
            createdTime: session.createdTime,
            modifiedTime: session.modifiedTime,
            data: session.data,
            ip: session.ip,
            requestesCount: session.requestesCount
        })
        return session
    }

    site.on("[any] [saving data]", function () {
        sessions.saveAll()
    })

    sessions.busy = false

    function loadAllSessions() {

        sessions.busy = true

        if (site.options.session.storage !== 'mongodb' || site.options.mongodb.enabled === false) {
            sessions.busy = false
            return
        }

        sessions.loadAll((err, docs) => {
            if (!err) {
                sessions.list = docs
                sessions.busy = false
            } else {
                setTimeout(() => {
                    loadAllSessions()
                }, 250);
            }

        })
    }

    loadAllSessions()


    return sessions
}