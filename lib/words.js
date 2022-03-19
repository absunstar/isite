module.exports = function init(____0) {
    const words = function () {};
    words.list = [];
    words.db_list = [];
    words.$collectoin = ____0.connectCollection('app_options');

    words.$collectoin.findAll({ app_name: 'words' }, (err, docs) => {
        if (!err && docs && docs.length > 0) {
            words.db_list = docs;
        }
    });

    words.word = function (obj) {
        if (typeof obj === 'string') {
            return words.get(obj);
        }
        if (typeof obj === 'object') {
            return words.add(obj);
        }
    };

    words.get = function (name) {
        let response = { done: !1, name: name };
        for (let i = 0; i < words.db_list.length; i++) {
            if (response.done) {
                break;
            }
            if (words.db_list[i].name == name) {
                response.done = !0;
                response.index = i;
                response.source = 'db_list';
                response = { ...response, ...words.db_list[i] };
            }
        }
        for (let i = 0; i < words.list.length; i++) {
            if (response.done) {
                break;
            }
            if (words.list[i].name == name) {
                response.done = !0;
                response.index = i;
                response.source = 'list';
                response = { ...response, ...words.list[i] };
            }
        }
        return response;
    };

    words.add = function (word) {
        word.app_name = 'words';
        let response = { done: !1, source: 'db_list', word: word };
        let w = words.get(word.name);
        if (w.done) {
            if (w.source == 'db_list') {
                response.done = !0;
                response.action = 'update';
                words.db_list[w.index] = { ...words.db_list[w.index], ...word };
                words.$collectoin.update(words.db_list[w.index]);
            } else if (w.source == 'list') {
                response.done = !0;
                response.action = 'add';
                words.$collectoin.add(word, (err, doc) => {
                    if (!err && doc) {
                        words.db_list.push(doc);
                    }
                });
            }
        } else {
            response.done = !0;
            response.action = 'add';
            words.$collectoin.add(word, (err, doc) => {
                if (!err && doc) {
                    words.db_list.push(doc);
                }
            });
        }
        return response;
    };

    words.addList = function (list, db = false) {
        if (typeof list === 'string') {
            ____0.readFile(list, (err, data) => {
                if (!err) {
                    let arr = ____0.fromJson(data);
                    for (let i = 0; i < arr.length; i++) {
                        let word = arr[i];
                        word.is_default = !0;
                        word.file_path = list;
                        if (db) {
                            words.add(word);
                        } else {
                            words.list.push(arr[i]);
                        }
                    }
                }
            });
        } else if (Array.isArray(list)) {
            for (let i = 0; i < list.length; i++) {
                words.list.push(list[i]);
            }
        } else if (typeof list === 'object') {
            words.list.push(list);
        }
    };

    words.addApp = function (app_path) {
        words.addList(app_path + '/site_files/json/words.json' , false);
    };

    ____0.on(____0.strings[9], () => {
        ____0.get({ name: '/x-api/words', require: { permissions: ['login'] } }, (req, res) => {
            res.json({ done: !0, words: [...words.db_list, ...words.list] });
        });

        ____0.post({ name: '/x-api/words', require: { permissions: ['login'] } }, (req, res) => {
            res.json(words.add(req.data.word));
        });

        ____0.get('/x-api/words/get/:name', (req, res) => {
            res.json({
                word: words.get(req.params.name),
            });
        });
    });

    return words;
};
