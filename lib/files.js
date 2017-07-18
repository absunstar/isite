module.exports = function init(site) {
    let fs = require('fs')
    let fileList = []

    function readFile(path, callback) {
        for (let index = 0; index < fileList.length; index++) {
            let file = fileList[index];
            if (file.path == path) {
                callback(null, file.content);
                return
            }

        }

        fs.readFile(path, function (err, data) {
            if (!err) {
                data = data.toString('utf8');
            } else {
                console.log(err);
                data = '';
            }
            fileList.push({
                path: path,
                content: data,
                time : Date.now()
            })
            callback(err, data);
        });
    }

    return {
        fileList : fileList,
        readFile:readFile,
        css: function (name, callback) {
            readFile(site.dir + '/css/' + name + '.css', function (err, data) {
                callback(err, data);
            });

        },
        js: function () {
            readFile(site.dir + '/js/' + name + '.js', function (err, data) {
                callback(err, data);
            });
        },
        html: function (name, callback) {
            readFile(site.dir + '/html/' + name + '.html', function (err, data) {
                callback(err, data);
            });
        },
        json: function (name, callback) {
            readFile(site.dir + '/json/' + name + '.json', function (err, data) {
                callback(err, data);
            });
        }
    };
}