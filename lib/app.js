module.exports = function init(____0) {
  ____0.connectApp = function (_app) {
    if (typeof _app === 'string') {
      _app = {
        name: _app,
      };
    }
    let app = {
      name: _app.name,
      dir: _app.dir,
      page: _app.page,
      collectionName: _app.collectionName || _app.name,
      title: _app.title || _app.name,
      images: _app.images ?? false,
      allowMemory: _app.allowMemory ?? false,
      memoryList: [],
      allowCache: false,
      cacheList: [],
      allowRoute: true,
      allowRouteGet: true,
      allowRouteAdd: true,
      allowRouteUpdate: true,
      allowRouteDelete: true,
      allowRouteView: true,
      allowRouteAll: true,
    };
    if (!app.page && app.dir) {
      app.page = _app.dir + '/site_files/html/index.html';
    }

    app.$collection = ____0.connectCollection(app.collectionName);

    app.init = function () {
      if (app.allowMemory) {
        app.$collection.findMany({}, (err, docs) => {
          if (!err) {
            if (docs.length == 0) {
              app.cacheList.forEach((_item, i) => {
                app.$collection.add(_item, (err, doc) => {
                  if (!err && doc) {
                    app.memoryList.push(doc);
                  }
                });
              });
            } else {
              docs.forEach((doc) => {
                app.memoryList.push(doc);
              });
            }
          }
        });
      }
    };
    app.add = function (_item, callback) {
      app.$collection.add(_item, (err, doc) => {
        if (callback) {
          callback(err, doc);
        }
        if (app.allowMemory && !err && doc) {
          app.memoryList.push(doc);
        }
      });
    };
    app.update = function (_item, callback) {
      app.$collection.edit(
        {
          where: {
            id: _item.id,
          },
          set: _item,
        },
        (err, result) => {
          if (callback) {
            callback(err, result);
          }
          if (app.allowMemory && !err && result) {
            let index = app.memoryList.findIndex((itm) => itm && itm.id === result.doc.id);
            if (index !== -1) {
              app.memoryList[index] = result.doc;
            } else {
              app.memoryList.push(result.doc);
            }
          } else if (app.allowCache && !err && result) {
            let index = app.cacheList.findIndex((itm) => itm.id === result.doc.id);
            if (index !== -1) {
              app.cacheList[index] = result.doc;
            } else {
              app.cacheList.push(result.doc);
            }
          }
        }
      );
    };
    app.delete = function (_item, callback) {
      app.$collection.delete(
        {
          id: _item.id,
        },
        (err, result) => {
          if (callback) {
            callback(err, result);
          }
          if (app.allowMemory && !err && result.count === 1) {
            let index = app.memoryList.findIndex((a) => a.id === _item.id);
            if (index !== -1) {
              app.memoryList.splice(index, 1);
            }
          } else if (app.allowCache && !err && result.count === 1) {
            let index = app.cacheList.findIndex((a) => a.id === _item.id);
            if (index !== -1) {
              app.cacheList.splice(index, 1);
            }
          }
        }
      );
    };
    app.view = function (_item, callback) {
      if (callback) {
        if (app.allowMemory) {
          if ((item = app.memoryList.find((itm) => itm.id == _item.id))) {
            callback(null, item);
            return;
          }
        } else if (app.allowCache) {
          if ((item = app.cacheList.find((itm) => itm.id == _item.id))) {
            callback(null, item);
            return;
          }
        }

        app.$collection.find({ id: _item.id }, (err, doc) => {
          callback(err, doc);

          if (!err && doc) {
            if (app.allowMemory) {
              app.memoryList.push(doc);
            } else if (app.allowCache) {
              app.cacheList.push(doc);
            }
          }
        });
      }
    };
    app.all = function (_options, callback) {
      if (callback) {
        if (app.allowMemory) {
          callback(null, app.memoryList);
        } else {
          app.$collection.findMany(_options, callback);
        }
      }
    };

    app.handleRequest = function (req, res, callback) {
      if (callback) {
        callback({
          data: {
            appName: req.word(app.title),
          },
        });
      }
    };

    app.api = function (_api, callback) {
      _api.name = _api.name || 'test';
      _api.url = _api.url || `/api/${app.name}/${_api.name}`;
      _api.type = (_api.type || 'POST').toLowerCase();
      _api.permissions = _api.permissions || ['login'];

      _api.callback =
        _api.callback ||
        callback ||
        function (req, res) {
          res.json({
            done: true,
            data: {
              ...req.data,
              UserInfo: req.getUserFinger(),
            },
          });
        };
      if (_api.type == 'post') {
        if (_api.path) {
          ____0.onPOST({ name: _api.url, path: _api.path, overwrite: true, require: { permissions: _api.permissions } });
        } else {
          ____0.onPOST({ name: _api.url, overwrite: true, require: { permissions: _api.permissions } }, _api.callback);
        }
      } else {
        if (_api.path) {
          ____0.onGET({ name: _api.url, path: _api.path, overwrite: true, require: { permissions: _api.permissions } });
        } else {
          ____0.onGET({ name: _api.url, overwrite: true, require: { permissions: _api.permissions } }, _api.callback);
        }
      }
    };

    if (app.allowRoute) {
      if (app.allowRouteGet) {
        if (app.dir && app.images) {
          app.api({
            type: 'get',
            url: 'images',
            path: app.dir + '/site_files/images',
          });
        }
        if (app.page) {
          app.api(
            {
              type: 'get',
              url: app.name,
            },
            (req, res) => {
              app.handleRequest(req, res, (handle) => {
                res.render(app.page, handle.data, handle.options || { parser: 'html', compres: true });
              });
            }
          );
        }
      }

      if (app.allowRouteAdd) {
        app.api(
          {
            name: 'add',
          },
          (req, res) => {
            let response = {
              done: false,
            };

            let _data = req.data;

            _data.addUserInfo = req.getUserFinger();

            app.add(_data, (err, doc) => {
              if (!err && doc) {
                response.done = true;
                response.doc = doc;
              } else {
                response.error = err.mesage;
              }
              res.json(response);
            });
          }
        );
      }

      if (app.allowRouteUpdate) {
        ____0.post({ name: `/api/${app.name}/update`, require: { permissions: ['login'] } }, (req, res) => {
          let response = {
            done: false,
          };

          let _data = req.data;
          _data.editUserInfo = req.getUserFinger();

          app.update(_data, (err, result) => {
            if (!err) {
              response.done = true;
              response.doc = result?.doc;
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        });
      }

      if (app.allowRouteDelete) {
        ____0.post({ name: `/api/${app.name}/delete`, require: { permissions: ['login'] } }, (req, res) => {
          let response = {
            done: false,
          };
          let _data = req.data;

          app.delete(_data, (err, result) => {
            if (!err && result.count === 1) {
              response.done = true;
              response.result = result;
            } else {
              response.error = err?.message || 'Deleted Not Exists';
            }
            res.json(response);
          });
        });
      }

      if (app.allowRouteView) {
        ____0.post({ name: `/api/${app.name}/view`, public: true }, (req, res) => {
          let response = {
            done: false,
          };

          let _data = req.data;
          app.view(_data, (err, doc) => {
            if (!err && doc) {
              response.done = true;
              response.doc = doc;
            } else {
              response.error = err?.message || 'Not Exists';
            }
            res.json(response);
          });
        });
      }

      if (app.allowRouteAll) {
        ____0.post({ name: `/api/${app.name}/all`, public: true }, (req, res) => {
          let where = req.body.where || {};
          let search = req.body.search || '';
          let limit = req.body.limit || 50;
          let select = req.body.select || {};

          if (search) {
            where.$or = [];

            where.$or.push({
              id: ____0.get_RegExp(search, 'i'),
            });

            where.$or.push({
              code: ____0.get_RegExp(search, 'i'),
            });

            where.$or.push({
              nameAr: ____0.get_RegExp(search, 'i'),
            });

            where.$or.push({
              nameEn: ____0.get_RegExp(search, 'i'),
            });
          }

          if (app.allowMemory) {
            if (!search) {
              search = 'id';
            }
            let docs = [];
            let list = app.memoryList.filter((g) => JSON.stringify(g).contains(search)).slice(0, limit);
            list.forEach((doc) => {
              if (doc) {
                let obj = {
                  ...doc,
                  $memory: true,
                };
                if (Object.keys(select).length > 0) {
                  for (const p in obj) {
                    if (!Object.hasOwnProperty.call(select, p)) {
                      delete obj[p];
                    }
                  }
                }

                docs.push(obj);
              }
            });
            res.json({
              done: true,
              list: docs,
              count: docs.length,
            });
          } else {
            app.all({ where, select, limit }, (err, docs) => {
              res.json({
                done: true,
                list: docs,
              });
            });
          }
        });
      }
    }

    app.init();
    ____0.addApp(app);
    return app;
  };
};
