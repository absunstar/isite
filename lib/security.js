module.exports = function init(site) {
    site.security = {}
    site.security.users = []

    site.security.loadUsers = function (callback) {

        site.mongodb.find({
            dbName: site.options.security.dbName,
            collectionName: site.options.security.userCollection,
            where: {},
            select: {}
        }, function (err, docs) {
            callback(err, docs)
        })
    }


    site.security.getUser = function (id, callback) {
        if (id && id.length == 24) {

            for (var i = 0; i < site.security.users.length; i++) {
                var user = site.security.users[i];
                if (user._id == id) {
                    var u = site.copy(user)
                    u.memory = true
                    callback(null, u)
                    return
                }
            }

            site.mongodb.findOne({
                dbName: site.options.security.dbName,
                collectionName: site.options.security.userCollection,
                where: {
                    _id: new site.mongodb.ObjectID(id)
                },
                select: {}
            }, function (err, doc) {
                callback(err, doc)
                if (doc) {
                    site.security.users.push(doc)
                }
            })

        } else {
            callback({
                message: 'Not Exists'
            })
        }


    }

    site.security.isUserExists = function (user, callback) {
        if (typeof user !== 'object' || typeof user.email !== 'string' || user.email == '') {
            callback({
                message: 'email not set'
            })
            return
        }

        for (var i = 0; i < site.security.users.length; i++) {
            var _user = site.security.users[i];
            if (_user.email == user.email && _user.password == user.password) {
                callback(null, site.copy(_user))
                return
            }
        }

        site.mongodb.findOne({
            dbName: site.options.security.dbName,
            collectionName: site.options.security.userCollection,
            where: {
                email: user.email.toLowerCase()
            },
            select: {}
        }, function (err, doc) {
            callback(err, doc)
            if (doc) {
                site.security.users.push(doc)
            }
        })
    }


    site.security.login = function (user, callback) {

        if (typeof user !== 'object' || typeof user.email !== 'string' || user.email.trim() == '') {
            callback({
                message: 'email not set'
            })
            return
        }
        if (typeof user !== 'object' || typeof user.password !== 'string' || user.password.trim() == '') {
            callback({
                message: 'password not set'
            })
            return
        }

        for (var i = 0; i < site.security.users.length; i++) {
            var _user = site.security.users[i];
            if (_user.email == user.email && _user.password == user.password) {
                callback(null, site.copy(_user))
                return
            }
        }

        site.mongodb.findOne({
            dbName: site.options.security.dbName,
            collectionName: site.options.security.userCollection,
            where: {
                email: user.email,
                password: user.password
            },
            select: {}
        }, function (err, doc) {

            if (doc) {
                site.security.users.push(doc)
                callback(null, doc)
            } else {
                callback({
                    message: 'email or password error'
                })
            }
        })


    }


    site.security.register = function (user, callback) {
        if (typeof user !== 'object' || typeof user.password !== 'string' || user.password.trim() == '') {
            callback({
                message: 'password not set'
            })
            return
        }
        site.security.isUserExists(user, function (err, u) {
            if (!err) {
                if (u) {
                    callback({
                        message: 'Register Error , User Exists'
                    })
                } else {

                    user.email = user.email.toLowerCase().trim()
                    user.password = user.password.trim()

                    site.mongodb.insertOne({
                        dbName: site.options.security.dbName,
                        collectionName: site.options.security.userCollection,
                        doc: user
                    }, function (err, doc) {
                        callback(err, doc)
                        if (doc) {
                            site.security.users.push(doc)
                        }
                    })

                }

            } else {
                callback(err)
            }
        })


    }


    site.security.addUser = function (user, callback) {

        if (typeof user !== 'object' || typeof user.password !== 'string' || user.password.trim() == '') {
            callback({
                message: 'password not set'
            })
            return
        }
        site.security.isUserExists(user, function (err, u) {
            if (!err) {
                if (u) {
                    callback({
                        message: 'Error , User Exists'
                    })
                } else {
                    user.email = user.email.toLowerCase().trim()
                    user.password = user.password.trim()

                    site.mongodb.insertOne({
                        dbName: site.options.security.dbName,
                        collectionName: site.options.security.userCollection,
                        doc: user
                    }, function (err, doc) {
                        callback(err, doc)
                        if (doc) {
                            site.security.users.push(doc)
                        }
                    })
                }

            } else {
                callback(err)
            }
        })
    }

    site.security.updateUser = function (user, callback) {
        let id = new site.mongodb.ObjectID(user._id)
        delete user._id
        site.mongodb.updateOne({
            dbName: site.options.security.dbName,
            collectionName: site.options.security.userCollection,
            where: {
                _id: id
            },
            set: user
        }, function (err, result) {
            if (err) {
                callback(err, result)
            } else {
                callback(err, result)
                site.security.loadUsers(function (err, users) {
                    site.security.users = users
                })
            }
        })
    }
    site.security.deleteUser = function (user, callback) {
        let id = new site.mongodb.ObjectID(user._id)
        site.mongodb.deleteOne({
            dbName: site.options.security.dbName,
            collectionName: site.options.security.userCollection,
            where: {
                _id: id
            }
        }, function (err, result) {
            if (err) {
                callback(err, result)
            } else {
                callback(err, result)
                site.security.loadUsers(function (err, users) {
                    site.security.users = users
                })
            }
        })
    }

    site.security.isUserLogin = function (req, res) {
        if (req.session.user) {
            return true
        }
        return false
    }

    site.security.isUserHasPermission = function (req, res, permission) {
        let user = req.session.user
        if (typeof permission == 'string') {
            let ok = true
            if (permission.startsWith('!')) {
                permission = permission.substring(1)
                ok = false
            }
            if (user && user.permissions) {
                for (var i = 0; i < user.permissions.length; i++) {
                    var p = user.permissions[i];
                    if (p == permission) {
                        return ok
                    }
                }
            }
            return !ok
        }

        return false
    }

    site.security.getUserPermissions = function (req, res) {
        let user = req.session.user
        if (user && user.permissions) {
            return user.permissions
        }
        return []
    }
    site.security.addUserPermission = function (_id, permission, callback) {

        let user = site.security.getUser(_id, function (err, user) {
            if (user) {
                user.permissions.push(permission)
                let id = new site.mongodb.ObjectID(_id)

                site.mongodb.updateOne({
                    dbName: site.options.security.dbName,
                    collectionName: site.options.security.userCollection,
                    where: {
                        _id: id
                    },
                    set: {
                        permissions: user.permissions
                    }
                }, function (err, result) {
                    if (err) {
                        callback(err, result)
                    } else {
                        callback(err, result)
                        site.security.loadUsers(function (err, users) {
                            site.security.users = users
                        })
                    }
                })

            } else {
                callback(err, null)
            }
        })

    }

    site.post('/security/user/login', function (req, res) {
        let response = {
            accessToken: req.session.accessToken
        }


        if (site.security.isUserLogin(req, res)) {
            response.error = 'Login Error , You Are Loged '
            response.done = true
            res.writeHead(200, {
                'content-type': 'application/json'
            })
            res.end(JSON.stringify(response))
            return
        }

        site.security.login({
            email: req.body.email,
            password: req.body.password
        }, function (err, user) {
            if (!err) {

                site.security.users[user._id] = site.copy(user)

                req.session.set('user_id', user._id)

                delete user.password
                response.user = user
                response.done = true

            } else {
                response.error = err.message
            }
            res.writeHead(200, {
                'content-type': 'application/json'
            })


            res.end(JSON.stringify(response))
        })
    })

    site.post('/security/user/logout', function (req, res) {
        let response = {
            accessToken: req.session.accessToken
        }

        if (site.security.isUserLogin(req, res)) {
            req.session.user = null
            req.session.set('user_id', null)

        } else {
            response.error = 'You Are Not Loged'
        }


        response.done = true
        res.writeHead(200, {
            'content-type': 'application/json'
        })
        res.end(JSON.stringify(response))


    })



    site.post('/security/user/register', function (req, res) {
        let response = {
            accessToken: req.session.accessToken
        }
        if (site.security.isUserLogin(req, res)) {
            response.error = 'Register Error , You Are Loged '
            res.writeHead(200, {
                'content-type': 'application/json'
            })
            res.end(JSON.stringify(response))
        } else {
            site.security.register({
                email: req.body.email,
                password: req.body.password,
                ip: req.ip,
                permissions: []
            }, function (err, user) {
                if (!err) {
                    site.security.users[user._id] = site.copy(user)
                    req.session.user = site.copy(user)
                    req.session.set('user_id', user._id)
                    delete user.password
                    response.user = user
                    response.done = true
                } else {
                    response.error = err.message
                }
                res.writeHead(200, {
                    'content-type': 'application/json'
                })
                res.end(JSON.stringify(response))
            })
        }



    })


    site.post('/security/user/add', function (req, res) {
        let response = {
            accessToken: req.session.accessToken
        }
        if (!site.security.isUserLogin(req, res)) {
            response.error = 'Error , You Are Not Loged '
            res.writeHead(200, {
                'content-type': 'application/json'
            })
            res.end(JSON.stringify(response))
        } else {
            site.security.addUser({
                email: req.body.email,
                password: req.body.password,
                ip: req.ip,
                permissions: []
            }, function (err, user) {
                if (!err) {
                    site.security.users[user._id] = site.copy(user)
                    delete user.password
                    response.user = user
                    response.done = true
                } else {
                    response.error = err.message
                }
                res.writeHead(200, {
                    'content-type': 'application/json'
                })
                res.end(JSON.stringify(response))
            })
        }



    })

    site.post('/security/user/get', function (req, res) {
        let response = {
            accessToken: req.session.accessToken
        }
        site.security.getUser(req.body.id, function (err, user) {

            if (err) {
                response.error = err.message
            } else {
                delete user.password
                response.user = user
            }
            res.writeHead(200, {
                'content-type': 'application/json'
            })
            res.end(JSON.stringify(response))
        })
    })

    site.post('/security/user/delete', function (req, res) {
        let response = {
            accessToken: req.session.accessToken
        }
        site.security.deleteUser({
            _id: req.body.id
        }, function (err, result) {

            if (err) {
                response.error = err.message
            } else {
                if (result.count == 1) {
                    response.done = true
                }

            }
            res.writeHead(200, {
                'content-type': 'application/json'
            })
            res.end(JSON.stringify(response))
        })
    })

    site.post('/security/user/update', function (req, res) {
        let response = {
            accessToken: req.session.accessToken
        }
        let user = {}
        user._id = req.body.id
        if (req.body.email) {
            user.email = req.body.email
        }
        site.security.updateUser(user, function (err, result) {
            if (err) {
                response.error = err.message
            } else {
                if (result.count == 1) {
                    response.done = true
                }

            }
            res.writeHead(200, {
                'content-type': 'application/json'
            })
            res.end(JSON.stringify(response))
        })
    })

    site.post('/security/user/add/permission', function (req, res) {
        res.writeHead(200, {
            'content-type': 'application/json'
        })

        let response = {
            accessToken: req.session.accessToken
        }

        if (req.body.id && req.body.permission) {
            let user = {}
            user._id = req.body.id
            user.permission = req.body.permission
            site.security.addUserPermission(user._id, user.permission, function (err, result) {
                if (err) {
                    response.error = err.message
                } else {
                    if (result.count == 1) {
                        response.done = true
                    }
                }

                res.end(JSON.stringify(response))
            })
        } else {
            response.error = 'id or permission not set'
            res.end(JSON.stringify(response))
        }


    })

    site.post('/security/session/info', function (req, res) {
        let response = {
            accessToken: req.session.accessToken
        }
        response.session = req.session
        res.writeHead(200, {
            'content-type': 'application/json'
        })
        res.end(JSON.stringify(response))
    })

    site.post('/security/user/info', function (req, res) {
        let response = {
            accessToken: req.session.accessToken
        }
        response.user = req.session.user
        if (response.user) {
            delete response.user.password
        }

        res.writeHead(200, {
            'content-type': 'application/json'
        })
        res.end(JSON.stringify(response))

    })

    site.post('/security/users/info', function (req, res) {
        res.writeHead(200, {
            'content-type': 'application/json'
        })
        res.end(JSON.stringify(site.security.users))
    })

    site.post('/security/user/fullInfo', function (req, res) {
        let response = {
            accessToken: req.session.accessToken
        }
        response.user = req.session.user
        res.writeHead(200, {
            'content-type': 'application/json'
        })
        res.end(JSON.stringify(response))

    })




}