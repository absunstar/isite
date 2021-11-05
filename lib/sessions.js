module.exports = function init(____0) {
    const sessions = function () {};
    sessions.list = [];
    let $sessions = {};

    if (____0.options.mongodb.enabled) {
        $sessions = ____0.connectCollection({
            db: ____0.options.session.db,
            collection: ____0.options.session.collection,
        });
    }

    ____0.on('[session][update]', (session) => {
        sessions.list.forEach((s) => {
            if (s.accessToken == session.accessToken) {
                for (let key in session) {
                    if (session.hasOwnProperty(key) && key !== 'accessToken') {
                        key = key.toLowerCase();
                        for (let i = 0; i < s.data.length; i++) {
                            let obj = s.data[i];
                            if (obj.key === key) {
                                s.data[i] = {
                                    key: key,
                                    value: session[key],
                                };
                            }
                        }
                        s.data.push({
                            key: key,
                            value: session[key],
                        });
                    }
                }
            }
        });
    });
    ____0.on('[session][delete]', (session) => {
        sessions.list.forEach((s, i) => {
            if (s.accessToken == session.accessToken) {
                sessions.list.splice(i, 1);
            }
        });
    });
    ____0.on('[session][user][update]', (user) => {
        sessions.list.forEach((s) => {
            if (s.user && s.user.id == user.id) {
                s.user = user;
            }
        });
    });

    sessions.loadAll = function (callback) {
        callback =
            callback ||
            function (err, docs) {
                if (!err && docs) {
                    sessions.list = docs;
                }
            };

        if (____0.options.session.storage !== 'mongodb' || ____0.options.mongodb.enabled === !1) {
            callback(
                {
                    message: 'storage not monodb',
                },
                null,
            );

            return;
        }

        $sessions.findMany(
            {
                where: {},
                select: {},
                limit: 100000,
            },
            function (err, docs) {
                callback(err, docs);
            },
        );
    };

    sessions.attach = function (session, callback) {
        callback = callback || function () {};
        session.$exists = !1;

        sessions.list.forEach((s, i) => {
            if (s.accessToken && s.accessToken == session.accessToken) {
                session.$exists = !0;
                session.lang = s.lang;
                session.theme = s.theme;
                session.data = s.data;
                session.ip_info = s.ip_info;
                session.requestesCount = s.requestesCount + 1;
                session.createdTime = s.createdTime;
                session.$busy = s.$busy;
                session.$index = i;
                callback(session);
            }
        });

        if (!session.$exists) {
            session.$new = !0;
            session.lang = ____0.options.lang;
            session.theme = ____0.options.theme;
            session.data = [];
            session.ip_info = session.ip_info || {};
            session.requestesCount = 1;
            session.createdTime = new Date().getTime();
            session.$index = sessions.list.length;
            sessions.list.push(session);

            callback(session);
        }
        return session;
    };

    sessions.save = function (session, callback) {
        callback = callback || function () {};
        session.$exists = !1;

        if (session.$index && sessions.list[session.$index] && sessions.list[session.$index].accessToken == session.accessToken) {
            sessions.list[session.$index].lang = session.lang;
            sessions.list[session.$index].theme = session.theme;
            sessions.list[session.$index].data = session.data;
            sessions.list[session.$index].ip_info = session.ip_info;
            sessions.list[session.$index].requestesCount = session.requestesCount;
            sessions.list[session.$index].createdTime = session.createdTime;
            sessions.list[session.$index].$busy = session.$busy;
            callback(session);
        } else {
            sessions.list.forEach((s, i) => {
                if (session.$exists) {
                    return;
                }
                if (s.accessToken == session.accessToken) {
                    session.$exists = !0;
                    s.lang = session.lang;
                    s.theme = session.theme;
                    s.data = session.data;
                    s.ip_info = session.ip_info;
                    s.requestesCount = session.requestesCount;
                    s.createdTime = session.createdTime;
                    s.$busy = session.$busy;
                    callback(session);
                }
            });
        }
        return session;
    };

    ____0.on('[any][saving data]', function () {
        // sessions.saveAll();
    });

    sessions.busy = !1;

    function loadAllSessions() {
        sessions.busy = !0;

        if (____0.options.session.storage !== 'mongodb' || !____0.options.mongodb.enabled) {
            sessions.busy = !1;
            return;
        }

        sessions.loadAll((err, docs) => {
            sessions.busy = !1;
            if (!err) {
                sessions.list = docs;
            } else {
                console.log(err);
                setTimeout(() => {
                    loadAllSessions();
                }, 250);
            }
        });
    }

    sessions.saveAll = function (callback) {
        callback =
            callback ||
            function (err) {
                if (err) {
                    console.log(err.message);
                }
            };

        if (____0.options.session.timeout === 0) {
            callback({
                message: 'Timout is Zero And Sessions Will Not Saved In DB ',
            });
            return;
        }

        sessions.list.forEach((s, i) => {
            let online = new Date().getTime() - s.createdTime;
            let timeout = 1000 * 60 * ____0.options.session.timeout;
            if (online > timeout) {
                sessions.list.splice(i, 1);
            }
        });

        if (____0.options.session.storage !== 'mongodb' || ____0.options.mongodb.enabled === !1) {
            callback(
                {
                    message: 'Storage Not MongoDB || Not Enabled',
                },
                null,
            );

            return;
        }

        if (sessions.busy === !0) {
            ____0.log('Sessions is Busy');
            callback(
                {
                    message: 'Sessions is Busy',
                },
                null,
            );
            return;
        }

        sessions.busy = !0;

        $sessions.deleteMany(
            {
                where: {},
            },
            function (err, result) {
                sessions.busy = !1;
                if (sessions.list.length === 0) {
                    callback(
                        {
                            message: 'sessions is empty',
                        },
                        null,
                    );
                    return;
                }

                $sessions.insertMany(sessions.list, function (err, docs) {
                    callback(err, docs);
                    sessions.busy = !1;
                });
            },
        );
    };

    loadAllSessions();

    ____0.get('x-api/sessions', (req, res) => {
        res.json({
            done: !0,
            list: sessions.list,
        });
    });

    ____0.get('x-api/sessions/save', (req, res) => {
        sessions.saveAll();
        res.json({
            done: !0,
        });
    });
    ____0.get('x-api/sessions/delete', (req, res) => {
        sessions.list = [];
        sessions.saveAll((err, docs) => {
            res.json({
                err: err,
                docs: docs,
                done: !0,
            });
        });
    });
    return sessions;
};
