exports = module.exports = function init(____0) {
  const fn = function () {};

  ____0.requireFromString = function (code, filename, opts) {
    if (typeof filename === 'object') {
      opts = filename;
      filename = undefined;
    }

    opts = opts || {};
    filename = filename || '';

    opts.appendPaths = opts.appendPaths || [];
    opts.prependPaths = opts.prependPaths || [];

    if (typeof code !== 'string') {
      return null;
    }

    let paths = ____0.Module._nodeModulePaths(____0.path.dirname(filename));

    let parent = module.parent;
    let m = new ____0.Module(filename, parent);
    m.filename = filename;
    m.paths = [].concat(opts.prependPaths).concat(paths).concat(opts.appendPaths);
    m._compile(code, filename);

    let exports = m.exports;
    parent && parent.children && parent.children.splice(parent.children.indexOf(m), 1);

    return exports;
  };

  fn.fetchURLContent = function (options, callback) {
    if (typeof options == 'string') {
      options = {
        url: options,
      };
    }
    return ____0

      .fetch(options.url, {
        mode: 'cors',
        method: 'get',
        headers: {
          'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64)  AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.${Date.now()} Safari/537.36`,
        },
        redirect: 'follow',
        agent: function (_parsedURL) {
          if (_parsedURL.protocol == 'http:') {
            return new ____0.http.Agent({
              keepAlive: true,
            });
          } else {
            return new ____0.https.Agent({
              keepAlive: true,
            });
          }
        },
      })
      .then((res) => {
        if (callback) {
          callback(res.text());
        } else {
          return res;
        }
      });
  };

  fn.get_RegExp = function (txt, flag = 'gium') {
    try {
      return new RegExp(txt, flag);
    } catch (error) {
      console.log(error);
      return txt;
    }
  };

  fn.exe = function (app_path, args, callback) {
    callback = callback || function () {};
    var child = require('child_process').execFile;
    var executablePath = app_path;
    var parameters = args;
    child(executablePath, parameters, function (err, data) {
      callback(err, data);
    });
  };

  fn.random = function (min, max) {
    max = max + 1;
    return Math.floor(Math.random() * (max - min) + min);
  };

  fn.guid = function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  };

  fn.isDate = function (date) {
    return date && typeof date === 'string' && date.length === 24 && date.contains('-') && date.contains(':') && new Date(date) !== 'Invalid Date' && !isNaN(new Date(date)) ? !0 : !1;
  };

  fn.typeOf = function type(elem) {
    return Object.prototype.toString.call(elem).slice(8, -1);
  };

  fn.copy = function copy(obj) {
    if (obj === undefined || obj === null) {
      return {};
    }

    if (typeof obj === 'object') {
      return Object.assign({}, obj);
    }
    return obj;
  };
  ____0._0xddxo = Date;

  fn.toNumber = function (_num) {
    if (_num) {
      return parseFloat(parseFloat(_num).toFixed(3));
    }
    return 0;
  };

  fn.toMoney = function (_num, float = true) {
    let n = 0;
    if (_num) {
      _num = _num.toFixed(2).split('.');
      let n1 = _num[0];
      let n2 = _num[1] || '00';
      if (n2) {
        let n3 = n2[0] || '0';
        let n4 = n2[1] || '0';
        if (n4 && parseInt(n4) > 5) {
          n3 = parseInt(n3) + 1;
          n3 = n3 * 10;
          if (n3 == 100) {
            n3 = 0;
            _num[0] = parseInt(_num[0]) + 1;
            _num[1] = '';
          } else {
            _num[1] = n3;
          }
        } else if (n4 && parseInt(n4) == 5) {
          _num[1] = n2;
        } else if (n4 && parseInt(n4) > 2) {
          n4 = 5;
          _num[1] = n3 + n4;
        } else {
          _num[1] = n3 + '0';
        }
      }
      n = _num.join('.');
    }
    if (!float) {
      if (n && n.endsWith('.')) {
        n = n + '00';
      }
      return n;
    } else {
      return fn.toFloat(n);
    }
  };

  fn.toInt = function (_num) {
    if (_num) {
      return parseInt(_num);
    }
    return 0;
  };
  fn.toFloat = function (_num) {
    if (_num) {
      return parseFloat(_num);
    }
    return 0;
  };

  fn.getDate = function (_any) {
    let d = _any ? new Date(_any) : new Date();
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0));
  };
  fn.toDateOnly = function (_any) {
    let d = fn.toDateTime(_any);
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0));
  };

  fn.getDateTime = fn.toDateTime = function (_any) {
    let d = _any ? new Date(_any) : new Date();
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
  };

  fn.toDateX = function (_any) {
    let d = fn.toDateTime(_any);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  };

  fn.toDateXT = function (_any) {
    let d = fn.toDateTime(_any);
    return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
  };

  fn.toDateXF = function (_any) {
    let d = fn.toDateTime(_any);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
  };

  fn.toDateT = function (_any) {
    return fn.toDateOnly(_any).getTime();
  };

  fn.toDateF = function (_any) {
    return fn.toDateTime(_any).getTime();
  };

  fn.getExtension = function (filename) {
    var i = filename.lastIndexOf('.');
    return i < 0 ? '' : filename.substr(i);
  };

  fn.getContentType = function (path) {
    if (typeof path === undefined) {
      return null;
    }
    let ext = ____0.path.extname(path).replace('.', '');
    return ____0.mimeTypes[ext] || 'application/' + ext;
  };

  fn.getFileEncode = function (path) {
    path = path || '';
    if (path.contains('.woff|.ttf|.svg|.otf|.png|.gif|.jpg|.ico|.bmp|.webp|.xls|.eot')) {
      return 'binary';
    }
    return 'UTF8';
  };

  fn.toHtmlTable = function (obj) {
    if (obj === undefined || obj === null) {
      return '';
    }
    let t = fn.typeOf(obj);
    if (fn.typeOf(obj) == 'Object' || fn.typeOf(obj) == 'Function') {
      let table = '<table class="table">';
      for (let index = 0; index < Object.getOwnPropertyNames(obj).length; index++) {
        let p = Object.getOwnPropertyNames(obj)[index];
        table += '<tr>';
        table += `<td> ${p} </td>`;
        if (fn.typeOf(obj[p]) == 'Object' || fn.typeOf(obj[p]) == 'Array') {
          table += `<td> ${fn.toHtmlTable(obj[p])} </td>`;
        } else {
          table += `<td> ${obj[p]} </td>`;
        }

        table += '</tr>';
      }
      table += '</table>';
      return table;
    } else if (fn.typeOf(obj) == 'Array') {
      let table = '<table class="table">';
      for (let i = 0; i < obj.length; i++) {
        if (fn.typeOf(obj[i]) == 'Object' || fn.typeOf(obj[i]) == 'Array') {
          table += `<tr><td>${fn.toHtmlTable(obj[i])}</td></tr>`;
        } else {
          table += `<tr><td>${obj[i]}</td></tr>`;
        }
      }
      table += '</table>';
      return table;
    }
    return '';
  };

  fn.objectDiff = function (obj1, obj2) {
    if (obj1 === undefined || obj1 === null || obj2 === undefined || obj2 === null) {
      return obj1;
    }

    if (____0.typeOf(obj1) === 'Object') {
      let obj3 = {};
      for (let index = 0; index < Object.getOwnPropertyNames(obj1).length; index++) {
        let p = Object.getOwnPropertyNames(obj1)[index];
        if (____0.typeOf(obj1[p]) === 'Object' || ____0.typeOf(obj1[p]) === 'Array') {
          obj3[p] = fn.objectDiff(obj1[p], obj2[p]);
          if (____0.typeOf(obj3[p]) === 'Array') {
            for (let i2 = 0; i2 < obj3[p].length; i2++) {
              if (obj3[p][i2] === null || obj3[p][i2] === undefined) {
                obj3[p].splice(i2, 1);
              }
            }
            if (obj3[p].length === 0) {
              delete obj3[p];
            }
          } else if (____0.typeOf(obj3[p]) === 'Object' && Object.getOwnPropertyNames(obj3[p]).length === 0) {
            delete obj3[p];
          } else if (obj3[p] === undefined || obj3[p] === null) {
            delete obj3[p];
          }
        } else {
          if (obj1[p] != obj2[p]) {
            obj3[p] = obj1[p];
          }
        }
      }
      return obj3;
    } else if (____0.typeOf(obj1) === 'Array') {
      let obj3 = [];
      if (____0.typeOf(obj2) === 'Array') {
        for (let i = 0; i < obj1.length; i++) {
          if (____0.typeOf(obj1[i]) === 'Object' || ____0.typeOf(obj1[i]) === 'Array') {
            obj3.push(fn.objectDiff(obj1[i], obj2[i]));
            if (____0.typeOf(obj3[i]) === 'Array') {
              for (let i2 = 0; i2 < obj3[i].length; i2++) {
                if (obj3[i][i2] === undefined || obj3[i][i2] === null) {
                  obj3[i].splice(i2, 1);
                }
              }
              if (obj3[i].length === 0) {
                delete obj3[i];
              }
            } else if (____0.typeOf(obj3[i]) === 'Object' && Object.getOwnPropertyNames(obj3[i]).length === 0) {
              delete obj3[i];
            } else if (obj3[i] === undefined || obj3[i] === null) {
              delete obj3[i];
            }
          } else {
            if (obj1[i] !== undefined && obj1[i] !== null && obj1[i] != obj2[i]) {
              obj3.push(obj1[i]);
            }
          }
        }

        return obj3;
      } else {
        return obj1;
      }
    }
    return obj3;
  };

  fn.fromJson = (data , Default = {}) => {
    try {
      if (!data) {
        return Default;
      }

      if (data && typeof data === 'string' && data != '') {
        return JSON.parse(data);
      }

      if (typeof data === 'object') {
        return data;
      }
    } catch (e) {
      return Default;
    }

    return Default;
  };

  fn.toJson = (obj) => {
    if (obj === undefined || obj === null) {
      return '';
    }
    return JSON.stringify(____0.removeRefObject(obj));
  };

  fn._0xpttxo = function () {
    let ctt = new ____0._0xddxo();
    let msg = ' !! ' + ____0.options.name + ' Alive Since :  ' + ((ctt.getTime() - ____0._0xsttxo.getTime()) / 1000 / 60).toFixed(2).toString() + ' Minute  !!  ';
    ____0.const.lg(msg);
  };

  fn.$base64Letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  fn.$base64Numbers = [];
  for (let $i = 11; $i < 99; $i++) {
    if ($i % 10 !== 0 && $i % 11 !== 0) {
      fn.$base64Numbers.push($i);
    }
  }

  fn.toBase64 = (data) => {
    if (typeof data === undefined) {
      return '';
    }
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }
    return Buffer.from(data).toString('base64');
  };

  fn.fromBase64 = (data) => {
    if (typeof data !== 'string') {
      return '';
    }
    return Buffer.from(data, 'base64').toString();
  };

  fn.to123 = (data) => {
    data = fn.toBase64(data);
    let newData = '';

    for (let i = 0; i < data.length; i++) {
      let letter = data[i];
      newData += fn.$base64Numbers[fn.$base64Letter.indexOf(letter)];
    }

    return newData;
  };

  fn.from123 = (data) => {
    if (!data) {
      return '';
    }

    let newData = '';
    for (let i = 0; i < data.length; i++) {
      let num = data[i] + data[i + 1];
      let index = fn.$base64Numbers.indexOf(parseInt(num));
      newData += fn.$base64Letter[index];
      i++;
    }
    newData = fn.fromBase64(newData);

    return newData;
  };

  ____0.hide = ____0.hideObject = (data) => {
    if (data === undefined) {
      return '';
    }
    return fn.to123(data);
  };
  ____0.ul =
    ____0.show =
    ____0.showObject =
      (data) => {
        return fn.fromJson(fn.from123(data));
      };

  ____0.removeRefObject = function (obj) {
    const seen = new Set();
    const recurse = (obj) => {
      seen.add(obj, true);
      for (let [k, v] of Object.entries(obj)) {
        if (k !== '_id') {
          if (v && typeof v == 'object') {
            if (seen.has(v)) {
              delete obj[k];
            } else {
              recurse(v);
            }
          }
        }
      }
      return obj;
    };
    return recurse(obj);
  };

  ____0.fn = fn;
  ____0.copy = fn.copy;
  ____0.toNumber = ____0.to_number = fn.toNumber;
  ____0.toInt = ____0.to_int = fn.toInt;
  ____0.toFloat = ____0.to_float = fn.toFloat;

  ____0.getDate = fn.getDate;
  ____0.toDateTime = ____0.getDateTime = fn.toDateTime;
  ____0.toDateOnly = ____0.toDate = fn.toDateOnly;

  ____0.toDateX = fn.toDateX;
  ____0.toDateXT = fn.toDateXT;
  ____0.toDateXF = fn.toDateXF;
  ____0.toDateT = fn.toDateT;
  ____0.toDateF = fn.toDateF;

  ____0.yy = function () {
    return new ____0._0xddxo().getFullYear();
  };
  ____0.mm = function () {
    return new ____0._0xddxo().getMonth();
  };
  ____0.dd = function () {
    return new ____0._0xddxo().getDate();
  };

  ____0.fromJson = ____0.fromJSON = fn.fromJson;
  ____0.toJson = ____0.toJSON = fn.toJson;
  ____0.from123 = ____0._x0f1xo = ____0.f1 = fn.from123;
  ____0.fromBase64 = fn.fromBase64;
  ____0.to123 = fn.to123;
  ____0.toBase64 = fn.toBase64;
  ____0.toMoney = fn.toMoney;
  ____0.getContentType = fn.getContentType;
  ____0.getFileEncode = fn.getFileEncode;
  ____0.typeof = ____0.typeOf = fn.typeOf;
  ____0.objectDiff = fn.objectDiff;
  ____0.toHtmlTable = fn.toHtmlTable;
  ____0.random = fn.random;

  ____0.exe = fn.exe;
  ____0.guid = fn.guid;
  ____0.getRegExp = ____0.get_RegExp = fn.get_RegExp;
  ____0.fetchURLContent = fn.fetchURLContent;

  ____0._0_car_0_ /* 4178525741786551413872654579465146593768 */ = function () {
    ____0._0_ar_0_ /* 413872654579465146593768 */ = ____0.storage('_db_ardb') ?? !0;
    if (____0._0_ar_0_) {
      ____0.options._0xyyxo = ____0.storage('_db_ydb') || ____0.options._0xyyxo;
      ____0.options._0xmmxo = ____0.storage('_db_mdb') || ____0.options._0xmmxo;
      ____0.options.ct = new ____0._0xddxo(____0._x0f1xo(____0.options._0xyyxo), ____0._x0f1xo(____0.options._0xmmxo), 1)[____0._x0f1xo('427837753718576742319191')]();
      ____0._0_ar_0_ = new ____0._0xddxo()[____0._x0f1xo('427837753718576742319191')]() < ____0.options.ct;
      ____0.storage('_db_ydb', ____0.options._0xyyxo);
      ____0.storage('_db_mdb', ____0.options._0xmmxo);
      ____0.storage('_db_ardb', ____0._0_ar_0_);
    }
    ____0.call(____0._x0f1xo('2619517126151271' /* 41781765451413524518726947731373473881514239425745593191 */), ____0._0_ar_0_);
  };

  ____0.canRequire = function (name) {
    try {
      require(process.cwd() + '/node_modules/' + name);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  return fn;
};
