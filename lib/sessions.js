module.exports = function init(site) {
    const sessions = function () {}
    sessions.list = []

    const $sessions = site.connectCollection({
        db: site.options.session.db,
        collection: site.options.session.userSessionCollection
    })

    sessions.loadAll = function (callback) {
        callback = callback || function (err, docs) {
            if (!err && docs) {
                sessions.list = docs
            }
        }
        if (site.options.session.storage !== 'mongodb') {
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
        if (site.options.session.storage !== 'mongodb') {
            callback({
                message: 'storage not monodb'
            }, null)

            return
        }

        if (sessions.busy === true) {
            console.log('session save stoped')
            return
        }

        sessions.busy = true

        $sessions.deleteMany({
                where: {}
            },
            function (err, result) {
                $sessions.insertMany(sessions.list,
                    function (err, docs) {
                        callback(err, docs)
                        sessions.busy = false
                    }
                )
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
                session.data = session.data || s.data
                session.lang = session.lang || s.lang || "ar"
                session.theme = session.theme || s.theme || "default"
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

        session.lang = "ar"
        session.theme = "default"
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

    site.on("saveChanges", function () {
        sessions.saveAll()
    })

    sessions.busy = false

    function loadAllSessions() {

        sessions.busy = true

        if (site.options.session.storage !== 'mongodb') {
            sessions.busy = false
            return
        }

        sessions.loadAll((err, docs) => {
            if (!err && docs) {
                
                sessions.list = docs
                sessions.busy = false
                
                // for (let i = 0; i < docs.length; i++) {
                //     sessions.list.push(docs[i]);
                // }
            } else {
                setTimeout(() => {
                    loadAllSessions()
                }, 5000);
            }
            
        })
    }

    loadAllSessions()


    return sessions
}