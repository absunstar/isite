module.exports = function init(_w_) {
  const words = function () {};
  words.list = [];
  words.db_list = [];
  words.$collectoin = _w_.connectCollection('config_words');
  words.$collectoin.createUnique({
    name: 1,
  });
  words.$collectoin.findAll({}, (err, docs) => {
    if (!err && docs && docs.length > 0) {
      words.db_list = docs;
    }
  });

  words.get = function (name) {
    let response = { done: false, name: name };
    for (let i = 0; i < words.db_list.length; i++) {
      if (response.done) {
        break;
      }
      if (words.db_list[i].name == name) {
        response.done = true;
        response.index = i;
        response.source = 'db_list';
        response.word = words.db_list[i];
      }
    }
    for (let i = 0; i < words.list.length; i++) {
      if (response.done) {
        break;
      }
      if (words.list[i].name == name) {
        response.done = true;
        response.index = i;
        response.source = 'list';
        response.word = words.list[i];
      }
    }
    return response;
  };

  words.add = function (word) {
    let response = { done: false, source: 'db_list', word: word };
    let w = words.get(word.name);
    if (w.done) {
      if (w.source == 'db_list') {
        response.done = true;
        response.action = 'update';
        words.db_list[w.index] = Object.assign(words.db_list[w.index], word);
        words.$collectoin.update(words.db_list[w.index]);
      } else if (w.source == 'list') {
        response.done = true;
        response.action = 'add';
        words.$collectoin.add(word, (err, doc) => {
            if(!err && doc){
                words.db_list.push(doc);
              }
        });
      }
    } else {
      response.done = true;
      response.action = 'add';
      words.$collectoin.add(word, (err, doc) => {
          if(!err && doc){
            words.db_list.push(doc);
          }
       
      });
    }
    return response;
  };

  words.addList = function (list) {
    if (typeof list === 'string') {
      _w_.readFile(list, (err, data) => {
        if (!err) {
          let arr = _w_.fromJson(data);
          for (let i = 0; i < arr.length; i++) {
            let word = arr[i];
            word.is_default = true;
            word.file_path = list;
            words.list.push(arr[i]);
          }
        }
      });
    } else if (typeof list === 'object') {
      for (let i = 0; i < list.length; i++) {
        words.list.push(list[i]);
      }
    }
  };

  words.addApp = function (app_path) {
    words.addList(app_path + '/site_files/json/words.json');
  };

  _w_.on('site-started', () => {
    _w_.get({ name: '/x-api/words', require: { permissions: ['login'] } }, (req, res) => {
      res.json({done : true , words : [...words.db_list , ...words.list]});
    });

    _w_.post({ name: '/x-api/words', require: { permissions: ['login'] } }, (req, res) => {
      res.json(words.add(req.data.word));
    });

    _w_.get('/x-api/words/get/:name', (req, res) => {
      res.json({
        word: words.get(req.params.name),
      });
    });
  });

  return words;
};
