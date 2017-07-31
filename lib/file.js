module.exports = function init(site) {

    site.fileList = []

    site.readFile = function(path, callback) {
        for (let index = 0; index < site.fileList.length; index++) {
            let file = site.fileList[index];
            if (file.path == path) {
                callback(null, file.content);
                file.count++;
                return
            }

        }

        site.fs.readFile(path, function(err, data) {
            let encode = 'utf8';

            if (!err) {
                encode = site.getFileEncode(path);
                data = data.toString(encode);
            } else {
                data = '';
            }

            site.fileList.push({
                path: path,
                content: data,
                count: 1,
                encode: encode,
                time: Date.now()
            })
            callback(err, data);
        });
    }

    site.readFileSync = function(path) {
        for (let index = 0; index < site.fileList.length; index++) {
            let file = site.fileList[index];
            if (file.path == path) {
                file.count++;
                return file.content;
            }
        }
        let encode = 'utf8';
        encode = site.getFileEncode(path);
        let data = site.fs.readFileSync(path, encode)
        site.fileList.push({
            path: path,
            content: data,
            count: 1,
            encode: encode,
            time: Date.now()
        })
        return data;

    }

    site.readFiles = function(paths, callback) {
        var content = '';
        for (var index = 0; index < paths.length; index++) {
            let p = paths[index];
            let exists = false;
            for (let i = 0; i < site.fileList.length; i++) {
                let file = site.fileList[i];
                if (file.path == p) {
                    content += file.content;
                    file.count++;
                    exists = true;
                }
            }
            if (!exists) {
                data = site.readFileSync(p);
                content += data;
            }
        }
        callback(null, content);
    }


    site.css = function(name, callback) {
            site.readFile(site.dir + '/css/' + name + '.css', function(err, data) {
                callback(err, data);
            });

        },
        site.js = function() {
            site.readFile(site.dir + '/js/' + name + '.js', function(err, data) {
                callback(err, data);
            });
        },
        site.html = function(name, callback) {
            site.readFile(site.dir + '/html/' + name + '.html', function(err, data) {
                callback(err, data);
            });
        },
        site.json = function(name, callback) {
            site.readFile(site.dir + '/json/' + name + '.json', function(err, data) {
                callback(err, data);
            });
        }
};