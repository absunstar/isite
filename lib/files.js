module.exports = function init(site) {
    let fs = require('fs')
    let fileList = []


    function readFile(path, callback) {
        for (let index = 0; index < fileList.length; index++) {
            let file = fileList[index];
            if (file.path == path) {
                callback(null, file.content);
                file.count++;
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
                count : 1,
                time: Date.now()
            })
            callback(err, data);
        });
    }

    function readFileSync(path) {
        for (let index = 0; index < fileList.length; index++) {
            let file = fileList[index];
            if (file.path == path) {
                file.count++;
                return file.content;
            }
        }

        let data = fs.readFileSync(path, 'utf8')
        fileList.push({
            path: path,
            content: data,
            count:1,
            time: Date.now()
        })
        return data;

    }

    function readFiles(paths, callback) {
        var content = '';
        for (var index = 0; index < paths.length; index++) {
            let p = paths[index];
            let exists = false;
            for (let i = 0; i < fileList.length; i++) {
                let file = fileList[i];
                if (file.path == p) {
                    content += file.content;
                    file.count ++;
                    exists = true;
                }
            }
            if (!exists) {
                data = fs.readFileSync(p, 'utf8');
                fileList.push({
                    path: p,
                    content: data,
                    count : 1,
                    time: Date.now()
                })
                content += data;
            }
        }
        callback(null, content);

    }

    return {
        fileList: fileList,
        readFile: readFile,
        readFileSync:readFileSync,
        readFiles: readFiles,
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