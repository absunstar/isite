module.exports = function init(site) {

  const $user = site.connectCollection({
    collection: site.options.security.userCollection,
    db: site.options.security.db
  })

  const security = function () {}
  security.on_error = function (result) {}
  security.after_register = function (result) {}
  security.after_login = function (result) {}
  security.after_logout = function (result) {}
  security.after_addUser = function (result) {}
  security.after_updateUser = function (result) {}
  security.after_deleteUser = function (result) {}

  security.$user = $user
  security.users = []
  security.users.push({
    _id: "000000000000000000000000",
    email: site.options.security.admin.email,
    password: site.options.security.admin.password,
    permissions: ["*"]
  })
  for (var i = 0; i < site.options.security.users.length; i++) {
    security.users.push(site.options.security.users[i])
  }
  security.busy = false

  security.removeUserFinger = function (obj) {
    delete obj.$req
    delete obj.$res

    return obj
  }
  security.getUserFinger = function (obj) {

    let req = obj.$req
    let res = obj.$res

    let userFinger = {
      _id: null,
      email: null,
      time: new Date().getTime(),
      ip: null
    }

    if (req && req.session && req.session.user) {
      userFinger._id = req.session.user._id
      userFinger.id = req.session.user.id
      userFinger.email = req.session.user.email
      userFinger.ip = req.ip
    } else {
      
    }

    return userFinger
  }

  security.loadAllUsers = function (callback) {
    callback = callback || function () {}
    $user.findMany({
        limit: 10000,
        select: {
          _id: 1,
          email: 1,
          password: 1,
          permissions: 1
        }
      },
      function (err, docs) {
        if (!docs) {
          docs = []
        }
        callback(err, docs)
      }
    )
  }

  security.getUsers = function (options, callback) {
    callback = callback || function () {}
    $user.findMany(options,
      function (err, docs) {
        callback(err, docs)
      }
    )
  }

  security.reset = function () {
    if (security.busy) {
      return
    }
    security.busy = true
    security.loadAllUsers((err, users) => {
      security.users = []
      security.users.push({
        _id: "000000000000000000000000",
        email: site.options.security.admin.email,
        password: site.options.security.admin.password,
        permissions: ["*"]
      })
      for (var i = 0; i < site.options.security.users.length; i++) {
        security.users.push(site.options.security.users[i])
      }
      if (!err) {
        for (var i = 0; i < users.length; i++) {
          security.users.push(users[i])
        }
      }
      security.busy = false
    })
  }

  security.getUser = function (_user, callback) {
    callback = callback || function () {}
    if (_user._id === undefined) {
      _user = {
        _id: _user
      }
    }

    for (var i = 0; i < security.users.length; i++) {
      var user = security.users[i]
      if (_user._id && user._id == _user._id) {
        user.$memory = true
        callback(null, user)
        return
      }
      if (_user.id && user.id && user.id == _user.id) {
        user.$memory = true
        callback(null, user)
        return
      }
      if (_user.email && user.email == _user.email) {
        user.$memory = true
        callback(null, user)
        return
      }
    }


    $user.findOne({
        where: _user,
        select: {}
      },
      function (err, doc) {
        if (doc && (_user._id || _user.id || _user.email)) {
          security.users.push(doc)
        }
        callback(err, doc)
      }
    )

  }

  security.isUserExists = function (user, callback) {
    callback = callback || function () {}
    if (typeof user !== "object" || typeof user.email !== "string" || user.email == "") {
      callback({
        message: "email not set"
      })
      return
    }

    for (var i = 0; i < security.users.length; i++) {
      var _user = security.users[i]
      if (_user.email == user.email && _user.password == user.password) {
        callback(null, site.copy(_user))
        return
      }
    }

    $user.findOne({
        where: {
          email: user.email.toLowerCase()
        }
      },
      function (err, doc) {
        callback(err, doc)
        if (doc) {
          security.users.push(doc)
        }
      }
    )
  }

  security.login = function (user, callback) {
    callback = callback || function () {}
    let $req = user.$req
    let $res = user.$res

    delete user.$req
    delete user.$res


    if (typeof user !== "object" || typeof user.email !== "string" || user.email.trim() == "") {
      callback({
        message: "email not set"
      })
      return
    }
    if (typeof user !== "object" || typeof user.password !== "string" || user.password.trim() == "") {
      callback({
        message: "password not set"
      })
      return
    }

    if (security.users) {
      for (var i = 0; i < security.users.length; i++) {
        var _user = security.users[i]
        if (_user.email == user.email && _user.password == user.password) {
          callback(null, _user)
          if ($req) {
            $req.session.user = _user
            $req.session.set('user_id', _user._id)
          }
          security.after_login({
            db: $user.db,
            collection: $user.collection,
            doc: _user,
            $res: $res,
            $req: $req
          })
          return
        }
      }
    }

    $user.findOne({
        where: {
          email: user.email,
          password: user.password
        }
      },
      function (err, doc) {
        if (doc) {
          security.users.push(doc)
          callback(null, doc)
          if ($req) {
            $req.session.user = doc
            $req.session.set('user_id', doc._id)
          }
          security.after_login({
            db: $user.db,
            collection: $user.collection,
            doc: doc,
            $res: $res,
            $req: $req
          })
        } else {
          callback({
            message: "email or password error"
          })
          security.on_error({
            message: "email or password error"
          })
        }
      }
    )
  }

  security.register = function (user, callback) {
    callback = callback || function () {}
    let $req = user.$req
    let $res = user.$res

    delete user.$req
    delete user.$res

    if (typeof user !== "object" || typeof user.password !== "string" || user.password.trim() == "") {
      callback({
        message: "password not set"
      })
      security.on_error({
        message: "password not set"
      })
      return
    }

    if (typeof user.email !== "string" || user.email.trim() == "") {
      callback({
        message: "email not set"
      })
      security.on_error({
        message: "email not set"
      })
      return
    }


    security.isUserExists(user, function (err, u) {
      if (!err) {
        if (u) {
          callback({
            message: "Register Error , User Exists"
          })
          security.on_error({
            message: "Register Error , User Exists"
          })
        } else {
          user.email = user.email.toLowerCase().trim()
          user.password = user.password.trim()

          $user.insertOne(user,
            function (err, doc) {
              if (doc) {
                security.users.push(doc)
                if ($req) {
                  $req.session.user = doc
                  $req.session.set('user_id', doc._id)
                }
                security.after_register({
                  db: $user.db,
                  collection: $user.collection,
                  doc: doc,
                  $res: $res,
                  $req: $req
                })
              }
              callback(err, doc)
              if (err) {
                security.on_error(err)
              }
            }
          )
        }
      } else {
        callback(err)
        security.on_error(err)
      }
    })
  }

  security.logout = function (req, res, callback) {
    callback = callback || function () {}
    if (security.isUserLogin(req, res)) {
      let _user = site.copy(req.session.user)
      req.session.user = null
      req.session("user_id", null)

      security.after_logout({
        db: $user.db,
        collection: $user.collection,
        doc: _user,
        $res: res,
        $req: req
      })
    }

    callback(null, true)
  }


  security.addUser = function (user, callback) {

    callback = callback || function () {}

    let $req = user.$req
    let $res = user.$res

    delete user.$req
    delete user.$res

    if (typeof user !== "object" || typeof user.password !== "string" || user.password.trim() == "") {
      callback({
        message: "password not set"
      })
      security.on_error({
        message: "password not set"
      })
      return
    }

    if (typeof user.email !== "string" || user.email.trim() == "") {
      callback({
        message: "email not set"
      })
      security.on_error({
        message: "email not set"
      })
      return
    }


    security.isUserExists(user, function (err, u) {
      if (!err) {
        if (u) {
          callback({
            message: "Error , User Exists"
          })
          security.on_error({
            message: "Error , User Exists"
          })
        } else {
          user.email = user.email.toLowerCase().trim()
          user.password = user.password.trim()

          if (user.permissions === undefined) {
            user.permissions = []
          }
          if (user.profile === undefined) {
            user.profile = {}
          }

          $user.insertOne(user,
            function (err, doc) {
              if (doc) {
                security.users.push(doc)
                security.after_addUser({
                  db: $user.db,
                  collection: $user.collection,
                  doc: doc,
                  $req: $req,
                  $res: $res
                })
              }
              callback(err, doc)
              if (err) {
                security.on_error(err)
              }
            }
          )
        }
      } else {
        callback(err)
        security.on_error(err)
      }
    })
  }

  security.updateUser = function (user, callback) {
    callback = callback || function () {}
    let $req = user.$req
    let $res = user.$res

    delete user.$req
    delete user.$res
    if (user._id === undefined) {
      callback({
        message: '_id not set'
      })
      return
    }

    let _id = user._id
    $user.updateOne({
        where: {
          _id: user._id
        },
        set: user,
        $req: $req,
        $res: $res
      },
      function (err, result) {
        if (err) {
          callback(err, result)
        } else {

          for (let i = 0; i < security.users.length; i++) {
            let element = security.users[i];
            if (element._id == _id || element._id == _id.toString()) {
              element = Object.assign(element, user)
              security.users[i] = element
            }
          }
          callback(err, result)
          security.after_updateUser(result)
        }
      }
    )
  }
  security.deleteUser = function (user, callback) {
    callback = callback || function () {}
    $user.deleteOne(user._id,
      function (err, result) {
        if (err) {
          callback(err, result)
        } else {
          for (let i = 0; i < security.users.length; i++) {
            let element = security.users[i];
            if (element._id == user._id || element._id.toString() == user._id.toString()) {
              security.users.splice(i, 1)
              break
            }
          }
          callback(err, result)
          if (!err && result) {
            security.after_deleteUser(result)
          }

        }
      }
    )
  }

  security.isUserLogin = function (req, res) {
    if (req.session.user) {
      return true
    }
    return false
  }

  security.isUserHasPermission = function (req, res, permission) {
    let user = req.session.user
    if (typeof permission == "string") {
      let ok = true
      if (permission.startsWith("!")) {
        permission = permission.substring(1)
        ok = false
      }
      if (user && user.permissions) {
        for (var i = 0; i < user.permissions.length; i++) {
          var p = user.permissions[i]
          if (permission == p) {
            return ok
          }
          if (p == "*") {
            return ok
          }
        }
      }
      return !ok
    }

    return false
  }

  security.getUserPermissions = function (req, res) {
    let user = req.session.user
    if (user && user.permissions) {
      return user.permissions
    }
    return []
  }
  security.addUserPermission = function (_id, permission, callback) {
    callback = callback || function () {}
    let user = security.getUser(_id, function (err, user) {
      if (user) {
        user.permissions.push(permission)
        $user.updateOne({
            where: {
              _id: $user.ObjectID(_id)
            },
            set: {
              permissions: user.permissions
            }
          },
          function (err, result) {
            if (err) {
              callback(err, result)
            } else {
              callback(err, result)
            }
          }
        )
      } else {
        callback(err, null)
      }
    })
  }

  // Security Routes

  site.post("/@security/api/user/login", function (req, res) {
    let response = {
      accessToken: req.session.accessToken
    }

    if (req.body.$encript) {
      if (req.body.$encript === "64") {
        req.body.email = site.fromBase64(req.body.email)
        req.body.password = site.fromBase64(req.body.password)
      } else if (req.body.$encript === "123") {
        req.body.email = site.from123(req.body.email)
        req.body.password = site.from123(req.body.password)
      }
    }

    if (security.isUserLogin(req, res)) {
      response.error = "Login Error , You Are Loged "
      response.done = true
      res.json(response)
      return
    }

    security.login({
        email: req.body.email,
        password: req.body.password,
        $req: req,
        $res: res
      },
      function (err, user) {
        if (!err) {
          response.user = user
          response.done = true
        } else {
          response.error = err.message
        }

        res.json(response)
      }
    )
  })

  site.post("/@security/api/user/logout", function (req, res) {
    let response = {
      accessToken: req.session.accessToken
    }

    site.security.logout(req, res, () => {
      response.done = true
      res.json(response)
    })

  })

  site.post("/@security/api/user/register", function (req, res) {
    let response = {
      accessToken: req.session.accessToken
    }
    if (req.body.$encript) {
      if (req.body.$encript === "64") {
        req.body.email = site.fromBase64(req.body.email)
        req.body.password = site.fromBase64(req.body.password)
      } else if (req.body.$encript === "123") {
        req.body.email = site.from123(req.body.email)
        req.body.password = site.from123(req.body.password)
      }
    }

    if (security.isUserLogin(req, res)) {
      response.error = "Register Error , You Are Loged "
      res.json(response)
    } else {
      security.register({
          email: req.body.email,
          password: req.body.password,
          ip: req.ip,
          permissions: [],
          $req: req,
          $res: res
        },
        function (err, user) {
          if (!err) {
            response.user = user
            response.done = true
          } else {
            response.error = err.message
          }
          res.json(response)
        }
      )
    }
  })

  site.post("/@security/api/user/add", function (req, res) {
    let response = {
      accessToken: req.session.accessToken
    }
    if (!security.isUserLogin(req, res)) {
      response.error = "Error , You Are Not Loged "
      res.json(response)
    } else {
      security.addUser({
          email: req.body.email,
          password: req.body.password,
          ip: req.ip,
          permissions: [],
          $req: req,
          $res: res
        },
        function (err, user) {
          if (!err) {
            response.user = user
            response.done = true
          } else {
            response.error = err.message
          }
          res.json(response)
        }
      )
    }
  })

  site.post("/@security/api/user/get", function (req, res) {
    let response = {
      accessToken: req.session.accessToken
    }
    security.getUser(req.body.id, function (err, user) {
      if (err) {
        response.error = err.message
      } else {
        response.user = user
      }
      res.json(response)
    })
  })

  site.post("/@security/api/user/delete", function (req, res) {
    let response = {
      accessToken: req.session.accessToken
    }
    security.deleteUser({
        _id: req.body.id
      },
      function (err, result) {
        if (err) {
          response.error = err.message
        } else {
          if (result.count == 1) {
            response.done = true
          }
        }
        res.json(response)
      }
    )
  })

  site.post("/@security/api/user/update", function (req, res) {
    let response = {
      accessToken: req.session.accessToken
    }
    let user = {}
    user._id = req.body.id
    if (req.body.email) {
      user.email = req.body.email
    }
    user.$req = req
    user.$res = res
    security.updateUser(user, function (err, result) {
      if (err) {
        response.error = err.message
      } else {
        if (result.count == 1) {
          response.done = true
        }
      }
      res.json(response)
    })
  })

  site.post("/@security/api/user/add/permission", function (req, res) {

    let response = {
      accessToken: req.session.accessToken
    }

    if (req.body.id && req.body.permission) {
      let user = {}
      user._id = req.body.id
      user.permission = req.body.permission
      security.addUserPermission(user._id, user.permission, function (err, result) {
        if (err) {
          response.error = err.message
        } else {
          if (result.count == 1) {
            response.done = true
          }
        }

        res.json(response)
      })
    } else {
      response.error = "id or permission not set"
      res.json(response)
    }
  })

  site.post("/@security/api/user/info", function (req, res) {
    let response = {
      accessToken: req.session.accessToken
    }
    response.user = req.session.user
    res.json(response)
  })

  site.post("/@security/api/users/info", function (req, res) {
    res.json(security.users)
  })

  return security
}