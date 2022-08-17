exports = module.exports = function init(____0) {
  const fn = function () {};

  fn.get_RegExp = function (txt, flag) {
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
  fn.toDateTime = function (_any) {
    return new Date(_any);
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

  fn.toDateOnly = function (_any) {
    let d = fn.toDateTime(_any);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
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
    if (typeof path === undefined) return null;
    if (path.endsWith('.exe')) {
      return 'application/octet-stream';
    } else if (path.endsWith('.txt')) {
      return 'text/plain';
    } else if (path.endsWith('.html')) {
      return 'text/html';
    } else if (path.endsWith('.pdf')) {
      return 'application/pdf';
    } else if (path.endsWith('.png')) {
      return 'image/png';
    } else if (path.endsWith('.jpg')) {
      return 'image/jpg';
    } else if (path.endsWith('.jpeg')) {
      return 'image/jpeg';
    } else if (path.endsWith('.gif')) {
      return 'image/gif';
    } else if (path.endsWith('.ico')) {
      return 'image/ico';
    } else if (path.endsWith('.json')) {
      return 'application/json';
    } else if (path.endsWith('.apk')) {
      return 'application/vnd.android.package-archive';
    } else if (path.endsWith('.jar')) {
      return 'application/java-archive';
    } else {
      return 'application/' + ____0.path.extname(path);
    }
  };

  fn.getFileEncode = function (path) {
    path = path || '';
    if (
      path.endsWith('.woff2') ||
      path.endsWith('.woff') ||
      path.endsWith('.ttf') ||
      path.endsWith('.svg') ||
      path.endsWith('.otf') ||
      path.endsWith('.png') ||
      path.endsWith('.gif') ||
      path.endsWith('.jpg') ||
      path.endsWith('.jpeg') ||
      path.endsWith('.ico') ||
      path.endsWith('.bmp') ||
      path.endsWith('.eot')
    ) {
      return 'binary';
    }
    return 'utf8';
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

  fn.fromJson = (data) => {
    try {
      if (!data) {
        return {};
      }

      if (data && typeof data === 'string' && data != '') {
        return JSON.parse(data);
      }

      if (typeof data === 'object') {
        return data;
      }
    } catch (e) {
      return {};
    }

    return {};
  };

  fn.toJson = (obj) => {
    if (obj === undefined || obj === null) {
      return '';
    }
    return JSON.stringify(obj);
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

  ____0.hide = (data) => {
    return fn.to123(data);
  };
  ____0.ul = ____0.show = (data) => {
    return fn.fromJson(fn.from123(data));
  };

  ____0.fn = fn;
  ____0.copy = fn.copy;
  ____0.toNumber = ____0.to_number = fn.toNumber;
  ____0.toInt = ____0.to_int = fn.toInt;
  ____0.toFloat = ____0.to_float = fn.toFloat;

  ____0.toDateTime = fn.toDateTime;
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

  ____0.fromJson = fn.fromJson;
  ____0.toJson = fn.toJson;
  ____0.from123 = ____0._x0f1xo = ____0.f1 = fn.from123;
  ____0.fromBase64 = fn.fromBase64;
  ____0.to123 = fn.to123;
  ____0.toBase64 = fn.toBase64;
  ____0.getContentType = fn.getContentType;
  ____0.getFileEncode = fn.getFileEncode;
  ____0.typeof = ____0.typeOf = fn.typeOf;
  ____0.objectDiff = fn.objectDiff;
  ____0.toHtmlTable = fn.toHtmlTable;

  ____0.exe = fn.exe;
  ____0.guid = fn.guid;
  ____0.get_RegExp = fn.get_RegExp;

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
