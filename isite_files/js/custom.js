  $(function () {
      $('[data-toggle="tooltip"]').tooltip()
  })

  var app = angular.module('html', []);
  app.controller('body', function ($scope, $http) {
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