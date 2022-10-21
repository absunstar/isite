var app = angular.module('myApp', []);
app.config(function ($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist(['self', 'https://www.youtube.com/**']);
});
