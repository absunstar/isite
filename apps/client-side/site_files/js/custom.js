  $(function () {
      $('[data-toggle="tooltip"]').tooltip()
  })

  var app = angular.module('html', []);
  app.controller('body', function ($scope, $http) {
        
                    $scope.isLoged = false;
                    $scope.error = '';


                    $scope.register = function () {
                        $('#registerBtn').button('loading')
                        var email = $scope.register_userEmail
                        var password = $scope.register_userPassword
        
                        $http({
                            method: 'POST',
                            url: '/@security/api/user/register',
                            transformRequest: function (obj) {
                                var str = [];
                                for (var p in obj)
                                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                                return str.join("&");
                            },
                            data: {
                                email: email,
                                password: password
                            },
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }).then(function (response) {
                            $('#registerBtn').button('reset')
                            if (response.data.error) {
                                $scope.error = response.data.error;
                            }
                            if (response.data.user) {
                                $scope.user = response.data.user
                                $scope.isLoged = true
                                $('#registerModal').modal('hide')
                                window.location.href = '/@admin'
                            }
                        });
                    }

                    $scope.login = function () {
                        $('#loginBtn').button('loading')
                        var email = $scope.userEmail
                        var password = $scope.userPassword
        
                        $http({
                            method: 'POST',
                            url: '/@security/api/user/login',
                            transformRequest: function (obj) {
                                var str = [];
                                for (var p in obj)
                                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                                return str.join("&");
                            },
                            data: {
                                email: email,
                                password: password
                            },
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }).then(function (response) {
                            $('#loginBtn').button('reset')
                            if (response.data.error) {
                                $scope.error = response.data.error;
                            }
                            if (response.data.user) {
                                $scope.user = response.data.user
                                $scope.isLoged = true
                                $('#loginModal').modal('hide')
                                window.location.href = '/@admin'
                            }
                        });
                    }
        
                    $scope.logout = function () {
        
                        $http({
                            method: 'POST',
                            url: '/@security/api/user/logout',
                            transformRequest: function (obj) {
                                var str = [];
                                for (var p in obj)
                                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                                return str.join("&");
                            },
                            data: {},
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }).then(function (response) {
        
                            if (response.data.done) {
                                window.location.href = '/@admin'
                            }
                        });
                    }
                
      $scope.hideALL = function () {
          $scope.sessionsDisplay = false;
          $scope.routesDisplay = false;
          $scope.filesDisplay = false;
          $scope.varsDisplay = false;
          $scope.installingDisplay = false;
      }

      $scope.showInstalling = function () {
          $scope.hideALL();
          $scope.installingDisplay = true;
      }

      $scope.showSessions = function () {
          $scope.hideALL();
          $http.get('/@admin/api/sessions').then(function (response) {
              $scope.sessionsDisplay = true;
              $scope.sessions = response.data;
          })
      }

      $scope.showRoutes = function () {
          $scope.hideALL();
          $http.get('/@admin/api/routes').then(function (response) {
              $scope.routesDisplay = true;
              $scope.routes = response.data;
          })
      }

      $scope.showFiles = function () {
          $scope.hideALL();
          $http.get('/@admin/api/files').then(function (response) {
              $scope.filesDisplay = true;
              $scope.files = response.data;
          })
      }

      $scope.showVars = function () {
          $scope.hideALL();
          $http.get('/@admin/api/vars').then(function (response) {
              $scope.varsDisplay = true;
              $scope.vars = response.data;
          })
      }

  });