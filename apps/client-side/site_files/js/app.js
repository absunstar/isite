var app = angular.module('myApp', []);
app.config(function ($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist(['self', 'https://www.youtube.com/**']);
});

app.config(function ($sceProvider) {
  $sceProvider.enabled(false);
});

site.connectScope = app.connectScope = function (_scope, callback) {
  if (!_scope) {
    _scope = {};
  }
  if (!_scope.name) {
    if ((elem = document.querySelector('[ng-controller]'))) {
      _scope.name = elem.getAttribute('ng-controller');
    } else {
      _scope.name = 'mainController';
    }
  }
  if (!_scope.app) {
    _scope.app = _scope.name;
  }
  if (typeof _scope.app === 'string') {
    _scope.apps = [{ name: _scope.app, as: _scope.app, modal: '#' + _scope.app + 'Modal' }];
  }
  if (typeof _scope.app === 'object') {
    _scope.apps = [{ ..._scope.app }];
  }
  if (Array.isArray(_scope.app)) {
    _scope.apps = [..._scope.app];
  }

  app.controller(_scope.name, function ($scope, $http, $timeout, $interval) {
    $scope.onError = function () {};
    if (Array.isArray(_scope.apps)) {
      _scope.apps.forEach((_app, index) => {
        $scope[_app.as + 'DefaultItem'] = {};
        $scope[_app.as + 'Item'] = {};
        $scope[_app.as + 'List'] = [];

        $scope[_app.as + 'Display'] = function () {
          $scope.error = '';
          $scope[_app.as + 'Item'] = { ...$scope[_app.as + 'DefaultItem'] };
          site.showModal(_app.modal);
        };

        $scope[_app.as + 'Add'] = function () {
          $scope.error = '';
          const v = site.validated(_app.modal);
          if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
          }
          $scope.busy = true;
          $http({
            method: 'POST',
            url: `/api/${_app.name}/add`,
            data: $scope[_app.as + 'Item'],
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {
                $scope[_app.as + 'List'].push(response.data.doc);
                $scope[_app.as + 'Item'] = { ...$scope[_app.as + 'DefaultItem'] };
              } else {
                $scope.error = 'Please Login First';
              }
            },
            function (err) {
              $scope.onError({ error: err, func: _app.as + 'Add' });
            }
          );
        };
        $scope[_app.as + 'Update'] = function (selectedItem) {
          $scope.error = '';
          const v = site.validated(_app.modal);
          if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
          }
          $scope.busy = true;
          $http({
            method: 'POST',
            url: `/api/${_app.name}/update`,
            data: selectedItem,
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {
                let index = $scope[_app.as + 'List'].findIndex((ss) => ss.id === selectedItem.id);
                if (index > -1) {
                  $scope[_app.as + 'List'][index] = response.data.doc;
                }
                $scope[_app.as + 'Item'] = { ...$scope[_app.as + 'DefaultItem'] };
              } else {
                $scope.error = 'Please Login First';
              }
            },
            function (err) {
              $scope.onError({ error: err, func: _app.as + 'Update' });
            }
          );
        };
        $scope[_app.as + 'Delete'] = function (selectedItem) {
          $scope.error = '';
          const v = site.validated(_app.modal);
          if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
          }
          $scope.busy = true;
          $http({
            method: 'POST',
            url: `/api/${_app.name}/delete`,
            data: selectedItem,
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {
                let index = $scope[_app.as + 'List'].findIndex((ss) => ss.id === selectedItem.id);
                if (index > -1) {
                  $scope[_app.as + 'List'].splice(index, 1);
                }
              } else {
                $scope.error = 'Please Login First';
              }
            },
            function (err) {
              $scope.onError({ error: err, func: _app.as + 'Delete' });
            }
          );
        };
        $scope[_app.as + 'LoadAll'] = function () {
          $scope.busy = true;
          $http({
            method: 'POST',
            url: `/api/${_app.name}/all`,
            data: {
              where: {},
              select: {},
            },
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done && response.data.list.length > 0) {
                $scope[_app.as + 'List'] = response.data.list;
              }
            },
            function (err) {
              $scope.busy = false;
              $scope.onError({ error: err, func: _app.as + 'LoadAll' });
            }
          );
        };

        if (index === 0) {
          $scope.display = $scope[_app.as + 'Display'];
          $scope.add = $scope[_app.as + 'Add'];
          $scope.update = $scope[_app.as + 'Update'];
          $scope.delete = $scope[_app.as + 'Delete'];
          $scope.loadAll = $scope[_app.as + 'LoadAll'];
        }
      });
    }
    if (callback) {
      callback($scope, $http, $timeout, $interval);
    }
  });
};
