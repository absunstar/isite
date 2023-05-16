var app = app || angular.module('myApp', []);
window.$ = window.jQuery;

app.filter('xdate', function () {
  return function (item) {
    if (item) {
      if (item.day2) {
        return `${item.day} - ${item.month + 1} - ${item.year} -- ${item.day2} - ${item.month2 + 1} - ${item.year2}`;
      } else {
        return `${item.day} - ${item.month + 1} - ${item.year}`;
      }
    }
  };
});
app.filter('xmoney', function () {
  return function (value) {
    return site.toMoney(value, false);
  };
});
app.filter('xmoney2', function () {
  return function (value) {
    if (value) {
      let arr = value.toString().split('.');
      if (arr[1] && arr[1].length === 3 && parseInt(arr[1][2]) === 5) {
        arr[1] = arr[1][0] + arr[1][1] + 9;
        value = arr.join('.');
      }
      return parseFloat(value).toFixed(2);
    }
    return value;
  };
});
app.service('isite', [
  '$http',
  function ($http) {
    this.getValue = function (obj, property) {
      if (!obj || !property) {
        return null;
      }

      if (property == '_') {
        return obj;
      }

      let arr = property.split('.');

      if (arr.length === 1) {
        return obj[arr[0]];
      }

      if (arr.length === 2) {
        return obj[arr[0]][arr[1]];
      }

      if (arr.length === 3) {
        return obj[arr[0]][arr[1]][arr[2]];
      }

      return null;
    };

    this.uploadImage = function (files, options, callback) {
      options = Object.assign(
        {
          category: 'default',
        },
        options
      );
      callback = callback || function () {};

      var fd = new FormData();
      fd.append('fileToUpload', files[0]);
      $http
        .post('/x-api/upload/image', fd, {
          withCredentials: !0,
          headers: {
            'Content-Type': undefined,
            folder: options.folder,
          },
          uploadEventHandlers: {
            progress: function (e) {
              callback(null, null, e);
            },
          },
          transformRequest: angular.identity,
        })
        .then(
          function (res) {
            if (res.data && res.data.done) {
              callback(null, res.data.image);
            }
          },
          function (error) {
            callback(error, null, null);
          }
        );
    };

    this.uploadAudio = function (files, options, callback) {
      options = Object.assign(
        {
          category: 'default',
        },
        options
      );
      callback = callback || function () {};

      var fd = new FormData();
      fd.append('fileToUpload', files[0]);
      $http
        .post('/x-api/upload/audio', fd, {
          withCredentials: !0,
          headers: {
            'Content-Type': undefined,
            folder: options.folder,
          },
          uploadEventHandlers: {
            progress: function (e) {
              callback(null, null, e);
            },
          },
          transformRequest: angular.identity,
        })
        .then(
          function (res) {
            if (res.data && res.data.done) {
              callback(null, res.data.audio);
            }
          },
          function (error) {
            callback(error, null, null);
          }
        );
    };

    this.uploadVideo = function (files, options, callback) {
      options = Object.assign(
        {
          category: 'default',
        },
        options
      );
      callback = callback || function () {};

      var fd = new FormData();
      fd.append('fileToUpload', files[0]);
      $http
        .post('/x-api/upload/video', fd, {
          withCredentials: !0,
          headers: {
            'Content-Type': undefined,
            folder: options.folder,
          },
          uploadEventHandlers: {
            progress: function (e) {
              callback(null, null, e);
            },
          },
          transformRequest: angular.identity,
        })
        .then(
          function (res) {
            if (res.data && res.data.done) {
              callback(null, res.data.video);
            }
          },
          function (error) {
            callback(error, null, null);
          }
        );
    };

    this.uploadFile = function (files, options, callback) {
      options = Object.assign(
        {
          folder: 'default',
        },
        options
      );
      callback = callback || function () {};

      var fd = new FormData();
      fd.append('fileToUpload', files[0]);
      $http
        .post('/x-api/upload/file', fd, {
          withCredentials: !0,
          headers: {
            'Content-Type': undefined,
            folder: options.folder,
          },
          uploadEventHandlers: {
            progress: function (e) {
              callback(null, null, e);
            },
          },
          transformRequest: angular.identity,
        })
        .then(
          function (res) {
            if (res.data && res.data.done && res.data.file) {
              callback(null, res.data.file);
            }
          },
          function (error) {
            callback(error, null, null);
          }
        );
    };

    this.deleteFile = function (file, callback) {
      callback = callback || function () {};
      callback();
    };

    this.upload = function (files, options, callback) {
      options = Object.assign(
        {
          api: '/api/upload/file',
        },
        options
      );
      callback = callback || function () {};

      var fd = new FormData();
      fd.append('fileToUpload', files[0]);
      $http
        .post(options.api, fd, {
          withCredentials: !0,
          headers: {
            'Content-Type': undefined,
          },
          uploadEventHandlers: {
            progress: function (e) {
              callback(null, null, e);
            },
          },
          transformRequest: angular.identity,
        })
        .then(
          function (res) {
            if (res.data && res.data.done && res.data.file) {
              callback(null, res.data);
            }
          },
          function (error) {
            callback(error, null, null);
          }
        );
    };
  },
]);
