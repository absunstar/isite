module.exports = function init(____0) {
  ____0.$users = ____0.connectCollection({
    collection: ____0.options.security.users_collection,
    db: ____0.options.security.db,
  });

  ____0.$roles = ____0.connectCollection({
    collection: ____0.options.security.roles_collection,
    db: ____0.options.security.db,
  });

  /** Email Must Not Duplicate but can be null */

  ____0.$users.dropIndexes(() => {
    ____0.$users.createIndex({ email: 1 }, { unique: true, partialFilterExpression: { email: { $exists: true } } }, () => {});
    ____0.$users.createIndex({ username: 1 }, { unique: true, partialFilterExpression: { username: { $exists: true } } }, () => {});
    ____0.$users.createIndex({ mobile: 1 }, { unique: true, partialFilterExpression: { mobile: { $exists: true } } }, () => {});
  });

  ____0.$roles.deleteDuplicate(
    {
      name: 1,
    },
    (err, result) => {
      ____0.$roles.createUnique(
        {
          name: 1,
        },
        () => {}
      );
    }
  );

  const security = function () {};

  ____0.on(['please add user', '[user][save]'], (u, callback) => {
    callback = callback || function () {};

    if (u.email === undefined || u.password === undefined) {
      callback(
        {
          message: 'Email or Password not set',
        },
        null
      );
      return;
    }
    u.email = u.email.trim().toLowerCase();
    security.getUser(
      {
        email: u.email,
      },
      (err, u2) => {
        if (u2) {
          u.id = u2.id;
          if (u.role) {
            u.roles = [u.role];
            delete u.role;
          }
          security.updateUser(u);
          callback(null, u);
        } else {
          if (u.role) {
            u.roles = [u.role];
            delete u.role;
          }
          security.addUser(u);
          callback(null, u);
        }
      }
    );
  });
  ____0.on(['[user][add]'], (u, callback) => {
    callback = callback || function () {};

    security.addUser(u, (err, doc) => {
      callback(err, doc);
    });
  });
  ____0.on(['[user][update]'], (u, callback) => {
    callback = callback || function () {};

    security.updateUser(u, (err, result) => {
      callback(err, result);
    });
  });
  ____0.on(['[user][delete]'], (u, callback) => {
    callback = callback || function () {};

    security.deleteUser(u, (err, result) => {
      callback(err, result);
    });
  });
  security.$users = ____0.$users;
  security.roles = [];
  security.permissions = [];
  security.users = [];

  security.addKey = function (key) {
    security.users.push({
      id: key,
      key: key,
      isAdmin: !0,
      email: key,
      password: key,
      $psermissions: ['*'],
      roles: ['*'],
      permissions: [
        {
          name: '*',
        },
      ],
      branchList: [
        {
          company: {
            id: 1000000,
          },
          branch: {
            id: 1000000,
          },
        },
      ],
    });
  };

  ____0.options.security.keys.forEach((key) => {
    if (!key) {
      return;
    }
    security.addKey(key);
  });

  ____0.options.security.users.forEach((user, i) => {
    if (!user.id) {
      user.id = security.users.length + 1;
    }
    security.users.push({
      is_admin: !0,
      $psermissions: ['*'],
      roles: ['*'],
      permissions: [
        {
          name: '*',
        },
      ],
      branch_list: [
        {
          company: {
            id: 1000000,
            name_ar: ____0._x0f1xo('3758577347381765211627694539135245595691'),
            name_en: ____0._x0f1xo('3758577347381765211627694539135245595691'),
            users_count: 100,
            branch_count: 100,
          },
          branch: {
            id: 1000000,
            name_ar: ____0._x0f1xo('3758577347381765211623734138825443129191'),
            name_en: ____0._x0f1xo('3758577347381765211623734138825443129191'),
          },
        },
      ],
      profile: {
        name: user.email,
      },
      ref_info: {
        _id: '',
      },
      ...user,
    });
  });

  security.addPermissions = function (list, callback) {
    callback = callback || function () {};
    if (typeof list === 'string') {
      ____0.readFile(list, (err, file) => {
        if (!err) {
          let arr = ____0.fromJson(file.content);
          for (let i = 0; i < arr.length; i++) {
            security.permissions.push(arr[i]);
          }
        }
        callback(security.permissions);
      });
    } else if (typeof list === 'object') {
      for (let i = 0; i < list.length; i++) {
        security.permissions.push(list[i]);
      }
      callback(security.permissions);
    }
  };

  security.addRole = function (role, callback) {
    callback = callback || function () {};
    ____0.$roles.add(role, (err, doc) => {
      if (!err && doc) {
        doc.module_name = 'custom';
        security.addRoles([doc]);
      }
      callback(err, doc);
    });
  };

  security.updateRole = security.editeRole = function (role, callback) {
    callback = callback || function () {};
    ____0.$roles.update(role, (err, result) => {
      if (!err) {
        security.roles.forEach((r) => {
          if (r.id == role.id) {
            r = role;
          }
        });
      }
      callback(err, result);
    });
  };

  security.deleteRole = security.removeRole = function (role, callback) {
    callback = callback || function () {};
    ____0.$roles.delete(
      {
        where: {
          id: role.id,
        },
      },
      (err, result) => {
        if (!err) {
          security.roles.forEach((r, i) => {
            if (r.name == role.name) {
              security.roles.splice(i, 1);
            }
          });
        }
        callback(err, result);
      }
    );
  };

  security.addRoles = function (list, callback) {
    callback = callback || function () {};
    if (typeof list === 'string') {
      let arr = ____0.readFileSync(list);
      if (arr) {
        arr = ____0.fromJson(arr);
        for (let i = 0; i < arr.length; i++) {
          security.roles.push(arr[i]);
        }
      }
      callback(security.roles);
    } else if (Array.isArray(list)) {
      for (let i = 0; i < list.length; i++) {
        security.roles.push(list[i]);
      }
      callback(security.roles);
    }
    return security.roles;
  };

  security.busy = !1;

  security.removeUserFinger = function (obj) {
    delete obj.$req;
    delete obj.$res;

    return obj;
  };
  security.getUserFinger = function (obj) {
    let req = obj.$req;
    let res = obj.$res;

    let userFinger = {
      id: null,
      email: null,
      date: ____0.getDate(),
      ip: null,
    };

    if (req && req.session && req.session.user) {
      req.session.user.profile = req.session.user.profile || {};
      userFinger.id = req.session.user.id;
      userFinger.email = req.session.user.email;
      userFinger.name = req.session.user.profile.name || userFinger.email;
      userFinger.name_ar = req.session.user.profile.name_ar || userFinger.email;
      userFinger.name_en = req.session.user.profile.name_en || userFinger.email;
      userFinger.ip = req.ip;
    } else {
    }

    return userFinger;
  };

  security.handleUser = function (_user) {
    _user.roles = _user.roles || [];
    _user.permissions = _user.permissions || [];
    _user.$permissions = [];
    _user.$permissions_info = [];

    _user.permissions.forEach((p) => {
      if (p.name && !_user.$permissions.some((_p) => _p == p.name)) {
        _user.$permissions.push(p.name);
      }
    });

    if (_user.role) {
      security.roles
        .filter((r) => r.name == _user.role.name)
        .map((r) => r.permissions)
        .forEach((ps) => {
          ps.forEach((p) => {
            if (!_user.$permissions.some((_p) => _p == p)) {
              _user.$permissions.push(p);
            }

            security.permissions.forEach((p2) => {
              if (p2.name == p) {
                _user.$permissions_info.push(p2);
              }
            });
          });
        });
    }

    _user.roles.forEach((role) => {
      if (role === '*') {
        _user.$permissions.push('*');
      }
      delete role.permissions;

      security.roles
        .filter((r) => r.name == role.name)
        .map((r) => r.permissions)
        .forEach((ps) => {
          ps.forEach((p) => {
            if (_user.$permissions.filter((_p) => _p == p).length === 0) _user.$permissions.push(p);
            security.permissions.forEach((p2) => {
              if (p2.name == '*') {
              }
              if (p2.name == p) {
                _user.$permissions_info.push(p2);
              }
            });
          });
        });
    });

    return _user;
  };

  security.loadAllUsers = function (callback) {
    callback = callback || function () {};
    ____0.$users.findMany(
      {
        limit: 10000,
        select: {},
      },
      function (err, docs) {
        if (!docs) {
          docs = [];
        }
        callback(err, docs);
      }
    );
  };

  security.loadAllRoles = function (callback) {
    callback = callback || function () {};
    ____0.$roles.findMany(
      {
        limit: 10000,
        select: {},
      },
      function (err, docs) {
        if (!docs) {
          docs = [];
        }
        callback(err, docs);
      }
    );
  };

  security.getUsers = function (options, callback) {
    callback = callback || function () {};
    ____0.$users.findMany(options, function (err, docs, count) {
      if (!err && docs) {
        docs.forEach((doc) => {
          doc = Object.assign(doc, security.handleUser(doc));
        });
      }
      callback(err, docs, count);
    });
  };

  security.getUser = function (_user, callback) {
    callback = callback || function () {};
    let index = security.users.findIndex(
      (user) =>
        (_user.id && user.id === _user.id) ||
        (!user.key && _user.email && user.email === _user.email.trim().toLowerCase()) ||
        (!user.key && _user.username && user.username === _user.username.trim().toLowerCase()) ||
        (!user.key && _user.mobile && user.mobile === _user.mobile.trim().toLowerCase()) ||
        (user.key && _user.key && user.key === _user.key) ||
        (user.key && _user.email && user.key === ____0.x0md50x(_user.email.trim().toLowerCase()))
    );
    if (index !== -1) {
      security.users[index].$memory = !0;
      security.users[index] = security.handleUser(security.users[index]);
      callback(null, security.users[index]);
      return;
    } else {
      ____0.$users.findOne(
        {
          where: _user,
          select: {},
        },
        function (err, doc) {
          if (!err && doc) {
            doc = security.handleUser(doc);
            security.users.push(doc);
          }
          callback(err, doc);
        }
      );
    }
  };

  security.isUserExists = function (user, callback) {
    callback = callback || function () {};
    if (typeof user !== 'object' || typeof user.email !== 'string' || user.email == '') {
      callback({
        message: 'email not set',
      });
      return;
    }

    for (var i = 0; i < security.users.length; i++) {
      var _user = security.users[i];
      if (_user.email == user.email.trim().toLowerCase() && _user.password == user.password) {
        callback(null, { ..._user });
        return;
      }
    }

    ____0.$users.findOne(
      {
        where: {
          email: user.email.toLowerCase(),
        },
      },
      function (err, doc) {
        if (doc) {
          doc = security.handleUser(doc);
          callback(err, doc);
          security.users.push(doc);
        } else {
          callback(
            {
              message: 'User Not Exists',
            },
            null
          );
        }
      }
    );
  };

  security.login = function (user, callback) {
    callback = callback || function () {};
    let $req = user.$req;
    let $res = user.$res;

    delete user.$req;
    delete user.$res;

    if (user && user.email && user.password) {
      user.email = user.email.trim().toLowerCase();
    } else if (user && user.mobile && user.password) {
      user.mobile = user.mobile.trim().toLowerCase();
    } else if (user && user.username && user.password) {
      user.username = user.username.trim().toLowerCase();
    }

    for (var i = 0; i < security.users.length; i++) {
      var _user = security.users[i];
      if (
        (!_user.key && user.email && _user.email === user.email && _user.password === user.password) ||
        (!_user.key && user.mobile && _user.mobile === user.mobile && _user.password === user.password) ||
        (!_user.key && user.username && _user.username === user.username && _user.password === user.password) ||
        (_user.key && user.key && _user.key === user.key) ||
        (_user.key && user.email && user.password && _user.key === ____0.x0md50x(user.email + user.password))
      ) {
        if ($req) {
          $req.session.user = _user;
          $req.session.user_id = _user.id;
          $req.session.$save();
         
        }
        callback(null, _user);
        ____0.call('user login', {
          db: ____0.$users.db,
          collection: ____0.$users.collection,
          doc: _user,
          $res: $res,
          $req: $req,
        });

        return;
      }
    }

    ____0.$users.findOne(
      {
        where: user,
      },
      function (err, doc) {
        if (doc) {
          doc = security.handleUser(doc);

          security.users.push(doc);

          if ($req) {
            $req.session.user = doc;
            $req.session.user_id = doc.id;
            $req.session.$save();
          
          }

          callback(null, doc);

          ____0.call('user login', {
            db: ____0.$users.db,
            collection: ____0.$users.collection,
            doc: doc,
            $res: $res,
            $req: $req,
          });
        } else {
          if (err) {
            callback(err);
          } else {
            callback({
              message: 'User Credential Not Correct ',
            });
          }

          ____0.call('security error', {
            message: 'User Credential Not Correct ',
          });
        }
      }
    );
  };

  security.register = function (user, callback) {
    callback = callback || function () {};
    let $req = user.$req;
    let $res = user.$res;

    delete user.$req;
    delete user.$res;

    if (user && user.email && user.password) {
      user.email = user.email.trim().toLowerCase();
    } else if (user && user.mobile && user.password) {
      user.mobile = user.mobile.trim().toLowerCase();
    } else if (user && user.username && user.password) {
      user.username = user.username.trim().toLowerCase();
    }

    security.isUserExists(user, function (err, u) {
      if (u) {
        callback({
          message: 'Register Error , User Exists',
        });
      } else {
        user.profile = user.profile || {
          name: user.email,
        };
        user.permissions = user.permissions || [];
        user.roles = user.roles || [];

        ____0.$users.insertOne(user, function (err, doc) {
          if (doc) {
            doc = security.handleUser(doc);

            security.users.push(doc);
            if ($req) {
              $req.session.user = doc;
              $req.session.user_id = doc.id;
              $req.session.$save();
              
            }
            ____0.call('user register', {
              db: ____0.$users.db,
              collection: ____0.$users.collection,
              doc: doc,
              $res: $res,
              $req: $req,
            });
          }
          callback(err, doc);
          if (err) {
            ____0.call('security error', err);
          }
        });
      }
    });
  };

  security.logout = function (req, res, callback) {
    callback = callback || function () {};

    if (security.isUserLogin(req, res)) {
      let _user = req.session.user;
      

      ____0.call('user logout', {
        db: ____0.$users.db,
        collection: ____0.$users.collection,
        doc: _user,
        $res: res,
        $req: req,
      });
    }

    delete req.session.user;
    req.session.accessToken = req.host + new Date().getTime().toString() + '_' + Math.random();
    req.session.accessToken = ____0.x0md50x(req.session.accessToken);
    res.set('Access-Token', req.session.accessToken);
    res.cookie('access_token', req.session.accessToken);
    callback(null, !0);
  };

  security.addUser = function (user, callback) {
    callback = callback || function () {};

    let $req = user.$req;
    let $res = user.$res;

    delete user.$req;
    delete user.$res;

    if (user && user.email && user.password) {
      user.email = user.email.trim().toLowerCase();
    } else if (user && user.mobile && user.password) {
      user.mobile = user.mobile.trim().toLowerCase();
    } else if (user && user.username && user.password) {
      user.username = user.username.trim().toLowerCase();
    }

    if (!user.email) {
      user.email = user.username || user.mobile || 'Not Set';
    }

    security.isUserExists(user, function (err, u) {
      if (u) {
        callback({
          message: 'Error , User Exists',
        });

        return;
      } else {
        user.profile = user.profile || {};
        user.permissions = user.permissions || [];
        user.roles = user.roles || [];
        user.added_user_info = security.getUserFinger({
          $req: $req,
          $res: $res,
        });

        ____0.$users.insertOne(user, function (err, doc) {
          if (doc) {
            doc = Object.assign(doc, security.handleUser(doc));

            security.users.push(doc);

            ____0.call('user add', {
              db: ____0.$users.db,
              collection: ____0.$users.collection,
              doc: doc,
              $req: $req,
              $res: $res,
            });
          }

          callback(err, doc);

          if (err) {
            ____0.call('security error', err);
          }
        });
      }
    });
  };

  security.updateUser = function (user, callback) {
    callback = callback || function () {};
    let $req = user.$req;
    let $res = user.$res;

    delete user.$req;
    delete user.$res;

    let where = {};
    if (user.id) {
      where.id = user.id;
    } else if (user.email) {
      where.email = user.email.trim().toLowerCase();
    } else if (user.mobile) {
      where.mobile = user.mobile.trim().toLowerCase();
    } else if (user.username) {
      where.username = user.username.trim().toLowerCase();
    }
    ____0.$users.update(
      {
        where: where,
        set: user,
        $req: $req,
        $res: $res,
      },
      function (err, result) {
        callback(err, result);
        if (!err && result && result.doc) {
          let index = security.users.findIndex((u) => u.id == result.doc.id);
          if (index >= 0) {
            security.users[index] = { ...security.users[index], ...result.doc };
          }
        }
      }
    );
  };
  security.deleteUser = function (user, callback) {
    callback = callback || function () {};
    ____0.$users.deleteOne(
      {
        id: user.id,
      },
      function (err, result) {
        if (err) {
          callback(err, result);
        } else {
          for (let i = 0; i < security.users.length; i++) {
            let element = security.users[i];
            if (element.id == user.id) {
              security.users.splice(i, 1);
              break;
            }
          }
          callback(err, result);
          if (!err && result) {
            ____0.call('user delete', result);
          }
        }
      }
    );
  };

  security.isUserLogin = function (req, res) {
    if (req.session.user) {
      return !0;
    }
    return !1;
  };

  security.isUserHasPermission = function (req, res, permission) {
    let user = req.session.user;

    if (typeof permission == 'string') {
      let ok = !0;

      if (permission == '*') {
        return ok;
      }

      if (permission.startsWith('!')) {
        permission = permission.substring(1);
        ok = !1;
      }

      if (permission == 'login') {
        if (security.isUserLogin(req, res)) {
          return ok;
        } else {
          return !ok;
        }
      }

      if (user && user.$permissions) {
        for (var i = 0; i < user.$permissions.length; i++) {
          var p = user.$permissions[i];
          if (permission == p) {
            return ok;
          }
          if (p == '*') {
            return ok;
          }
        }
      }

      return !ok;
    }

    return !1;
  };

  security.isUserHasPermissions = function (req, res, permissions) {
    let user = req.session.user;
    let arr = [];
    let any = !0;
    if (typeof permissions === 'string') {
      if (permissions.like('*&&*')) {
        any = !1;
      }
      permissions = permissions.split('&&').join(',').split('||').join(',').split(',');
    }

    permissions.forEach((p) => {
      if (p) {
        arr.push(security.isUserHasPermission(req, res, p.trim()));
      }
    });

    let out = !1;

    if (any) {
      arr.forEach((p) => {
        if (p) {
          out = !0;
        }
      });

      return out || !1;
    } else {
      arr.forEach((p) => {
        if (!p) {
          out = !1;
        }
      });
      return out && !0;
    }

    return !1;
  };

  security.isUserHasRole = function (req, res, role) {
    let user = req.session.user;

    if (typeof role == 'string') {
      let ok = !0;
      if (role.startsWith('!')) {
        role = role.substring(1);
        ok = !1;
      }

      if (user && user.role) {
        if (role == user.role.name) {
          return ok;
        }
        if (user.role == '*') {
          return ok;
        }
      }
      if (user && user.roles) {
        for (var i = 0; i < user.roles.length; i++) {
          var p = user.roles[i];
          if (role == p.name) {
            return ok;
          }
          if (p == '*') {
            return ok;
          }
        }
      }
      return !ok;
    }

    return !1;
  };

  security.isUserHasRoles = function (req, res, roles) {
    let user = req.session.user;
    let arr = [];
    let any = !0;

    if (typeof roles === 'string') {
      if (roles.like('*&&*')) {
        any = !1;
      }
      roles = roles.split('&&').join(',').split('||').join(',').split(',');
    }

    roles.forEach((p) => {
      arr.push(security.isUserHasRole(req, res, p.trim()));
    });

    let out = !1;

    if (any) {
      arr.forEach((p) => {
        if (p) {
          out = !0;
        }
      });
      return out || !1;
    } else {
      arr.forEach((p) => {
        if (!p) {
          out = !1;
        }
      });
      return out && !0;
    }

    return !1;
  };

  security.getUserPermissions = function (req, res) {
    let user = req.session.user;
    if (user && user.permissions) {
      return user.permissions;
    }
    return [];
  };

  security.getUserRoles = function (req, res) {
    let user = req.session.user;
    if (user && user.roles) {
      return user.roles;
    }
    return [];
  };

  security.addUserPermission = function (id, permission, callback) {
    callback = callback || function () {};
    let user = security.getUser(
      {
        id: id,
      },
      function (err, user) {
        if (user) {
          if (typeof permission == 'string') {
            permission = {
              name: permission,
            };
          }
          user.permissions.push(permission);
          ____0.$users.updateOne(
            {
              where: {
                id: id,
              },
              set: {
                permissions: user.permissions,
              },
            },
            function (err, result) {
              if (err) {
                callback(err, result);
              } else {
                callback(err, result);
              }
            }
          );
        } else {
          callback(err, null);
        }
      }
    );
  };

  ____0.post('/x-security/api/user/login', function (req, res) {
    let response = {
      accessToken: req.session.accessToken,
    };

    if (req.body.$encript) {
      if (req.body.$encript === '64') {
        req.body.email = ____0.fromBase64(req.body.email);
        req.body.password = ____0.fromBase64(req.body.password);
      } else if (req.body.$encript === '123') {
        req.body.email = ____0.from123(req.body.email);
        req.body.password = ____0.from123(req.body.password);
      }
    }

    if (security.isUserLogin(req, res)) {
      response.error = 'Login Error , You Are Loged ';
      response.done = !0;
      res.json(response);
      return;
    }

    security.login(
      {
        ...req.body,
        $req: req,
        $res: res,
      },
      function (err, user) {
        if (!err) {
          response.user = user;
          response.done = !0;
        } else {
          response.error = err.message;
        }

        res.json(response);
      }
    );
  });

  ____0.post('/x-security/api/user/logout', function (req, res) {
    let response = {};

    ____0.security.logout(req, res, () => {
      response.done = !0;
      response.accessToken = req.session.accessToken;
      res.json(response);
    });
  });

  ____0.post('/x-security/api/user/register', function (req, res) {
    let response = {
      accessToken: req.session.accessToken,
    };
    if (req.body.$encript) {
      if (req.body.$encript === '64') {
        req.body.email = ____0.fromBase64(req.body.email);
        req.body.password = ____0.fromBase64(req.body.password);
      } else if (req.body.$encript === '123') {
        req.body.email = ____0.from123(req.body.email);
        req.body.password = ____0.from123(req.body.password);
      }
    }

    if (security.isUserLogin(req, res)) {
      response.error = 'Register Error , You Are Loged ';
      res.json(response);
    } else {
      security.register(
        {
          permissions: [],
          ...req.body,
          ip: req.ip,
          $req: req,
          $res: res,
        },
        function (err, user) {
          if (!err) {
            response.user = user;
            response.done = !0;
          } else {
            response.error = err.message;
          }
          res.json(response);
        }
      );
    }
  });

  ____0.post('/x-security/api/user/add', function (req, res) {
    let response = {
      accessToken: req.session.accessToken,
    };
    if (!security.isUserLogin(req, res)) {
      response.error = 'Error , You Are Not Loged ';
      res.json(response);
    } else {
      security.addUser(
        {
          permissions: [],
          ...req.body,
          ip: req.ip,
          $req: req,
          $res: res,
        },
        function (err, user) {
          if (!err) {
            response.user = user;
            response.done = !0;
          } else {
            response.error = err.message;
          }
          res.json(response);
        }
      );
    }
  });

  ____0.post('/x-security/api/user/get', function (req, res) {
    let response = {
      accessToken: req.session.accessToken,
    };
    security.getUser(req.body.id, function (err, user) {
      if (err) {
        response.error = err.message;
      } else {
        response.user = user;
      }
      res.json(response);
    });
  });

  ____0.post('/x-security/api/user/delete', function (req, res) {
    let response = {
      accessToken: req.session.accessToken,
    };
    security.deleteUser(
      {
        id: req.body.id,
      },
      function (err, result) {
        if (err) {
          response.error = err.message;
        } else {
          if (result.count == 1) {
            response.done = !0;
          }
        }
        res.json(response);
      }
    );
  });

  ____0.post('/x-security/api/user/update', function (req, res) {
    let response = {
      accessToken: req.session.accessToken,
    };
    let user = {};
    user.id = req.body.id;
    if (req.body.email) {
      user.email = req.body.email;
    }
    user.$req = req;
    user.$res = res;
    security.updateUser(user, function (err, result) {
      if (err) {
        response.error = err.message;
      } else {
        if (result.count == 1) {
          response.done = !0;
        }
      }
      res.json(response);
    });
  });

  ____0.post('/x-security/api/user/add/permission', function (req, res) {
    let response = {
      accessToken: req.session.accessToken,
    };

    if (req.body.id && req.body.permission) {
      let user = {};
      user.id = req.body.id;
      user.permission = req.body.permission;
      security.addUserPermission(user.id, user.permission, function (err, result) {
        if (err) {
          response.error = err.message;
        } else {
          if (result.count == 1) {
            response.done = !0;
          }
        }

        res.json(response);
      });
    } else {
      response.error = 'id or permission not set';
      res.json(response);
    }
  });

  ____0.all('/x-security/api/user/info', function (req, res) {
    let response = {
      accessToken: req.session.accessToken,
    };
    response.user = req.session.user;
    res.json(response);
  });

  ____0.all('/x-security/api/users/info', function (req, res) {
    res.json(security.users);
  });

  if (____0.isFileExistsSync(____0.dir + '/json/permissions.json')) {
    security.addPermissions(____0.dir + '/json/permissions.json');
  }
  if (____0.isFileExistsSync(____0.dir + '/json/roles.json')) {
    security.addRoles(____0.dir + '/json/roles.json');
  }

  security.loadAllRoles((err, docs) => {
    docs.forEach((doc) => {
      doc.module_name = 'custom';
    });
    security.addRoles(docs);
  });

  return security;
};
