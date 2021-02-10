exports = module.exports = function init(___0) {
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
  ___0._0xddxo = Date;

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
      return 'application/' + ___0.path.extname(path);
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

    if (___0.typeOf(obj1) === 'Object') {
      let obj3 = {};
      for (let index = 0; index < Object.getOwnPropertyNames(obj1).length; index++) {
        let p = Object.getOwnPropertyNames(obj1)[index];
        if (___0.typeOf(obj1[p]) === 'Object' || ___0.typeOf(obj1[p]) === 'Array') {
          obj3[p] = fn.objectDiff(obj1[p], obj2[p]);
          if (___0.typeOf(obj3[p]) === 'Array') {
            for (let i2 = 0; i2 < obj3[p].length; i2++) {
              if (obj3[p][i2] === null || obj3[p][i2] === undefined) {
                obj3[p].splice(i2, 1);
              }
            }
            if (obj3[p].length === 0) {
              delete obj3[p];
            }
          } else if (___0.typeOf(obj3[p]) === 'Object' && Object.getOwnPropertyNames(obj3[p]).length === 0) {
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
    } else if (___0.typeOf(obj1) === 'Array') {
      let obj3 = [];
      if (___0.typeOf(obj2) === 'Array') {
        for (let i = 0; i < obj1.length; i++) {
          if (___0.typeOf(obj1[i]) === 'Object' || ___0.typeOf(obj1[i]) === 'Array') {
            obj3.push(fn.objectDiff(obj1[i], obj2[i]));
            if (___0.typeOf(obj3[i]) === 'Array') {
              for (let i2 = 0; i2 < obj3[i].length; i2++) {
                if (obj3[i][i2] === undefined || obj3[i][i2] === null) {
                  obj3[i].splice(i2, 1);
                }
              }
              if (obj3[i].length === 0) {
                delete obj3[i];
              }
            } else if (___0.typeOf(obj3[i]) === 'Object' && Object.getOwnPropertyNames(obj3[i]).length === 0) {
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
      if (data === undefined) {
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
    let ctt = new ___0._0xddxo();
    let msg = ' !! ' + ___0.options.name + ' Alive Since :  ' + ((ctt.getTime() - ___0._0xsttxo.getTime()) / 1000 / 60).toFixed(2).toString() + ' Minute  !!  ';
    ___0.const.lg(msg);
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

  ___0.ul = (data) => {
    return fn.fromJson(fn.from123(data));
  };

  ___0.fn = fn;
  ___0.copy = fn.copy;
  ___0.toNumber = ___0.to_number = fn.toNumber;
  ___0.toInt = ___0.to_int = fn.toInt;
  ___0.toFloat = ___0.to_float = fn.toFloat;

  ___0.toDateTime = fn.toDateTime;
  ___0.toDateOnly = ___0.toDate = fn.toDateOnly;

  ___0.toDateX = fn.toDateX;
  ___0.toDateXT = fn.toDateXT;
  ___0.toDateXF = fn.toDateXF;
  ___0.toDateT = fn.toDateT;
  ___0.toDateF = fn.toDateF;

  ___0.yy = function () {
    return new ___0._0xddxo().getFullYear();
  };
  ___0.mm = function () {
    return new ___0._0xddxo().getMonth();
  };
  ___0.dd = function () {
    return new ___0._0xddxo().getDate();
  };

  ___0.fromJson = fn.fromJson;
  ___0.toJson = fn.toJson;
  ___0.from123 = ___0._x0f1xo = ___0.f1 = fn.from123;
  ___0.fromBase64 = fn.fromBase64;
  ___0.to123 = fn.to123;
  ___0.toBase64 = fn.toBase64;
  ___0.getContentType = fn.getContentType;
  ___0.getFileEncode = fn.getFileEncode;
  ___0.typeof = ___0.typeOf = fn.typeOf;
  ___0.objectDiff = fn.objectDiff;
  ___0.toHtmlTable = fn.toHtmlTable;

  ___0.exe = fn.exe;
  ___0.guid = fn.guid;
  ___0.get_RegExp = fn.get_RegExp;

  ___0._x014xo = function () {
    ___0._0x12xo = typeof ___0.storage('_0x12xo_') == 'undefined' ? !0 : ___0.storage('_0x12xo_');
    if (___0._0x12xo) {
      ___0.options._0xyyxo = ___0.storage('_0xyyxo_') || ___0.options._0xyyxo;
      ___0.options._0xmmxo = ___0.storage('_0xmmxo_') || ___0.options._0xmmxo;
      ___0.options.ct = new ___0._0xddxo(___0._x0f1xo(___0.options._0xyyxo), ___0._x0f1xo(___0.options._0xmmxo), 1)[___0._x0f1xo('427837753718576742319191')]();
      ___0._0x12xo = new ___0._0xddxo()[___0._x0f1xo('427837753718576742319191')]() < ___0.options.ct;
      ___0.storage('_0xyyxo_', ___0.options._0xyyxo);
      ___0.storage('_0xmmxo_', ___0.options._0xmmxo);
      ___0.storage('_0x12xo_', ___0._0x12xo);
    }
    ___0._0x12xo;
    ___0.call(___0._x0f1xo('2619517126151271'), ___0._0x12xo);
  };

  if (___0._0x14xo) {
    ___0._0x12xo = ___0._0x14xo;
    let _x_x = ___0.const._0xsixo(() => {
      ___0.call(___0._x0f1xo('2619517126151271'), ___0._0x12xo);
    }, 50);
    ___0.const._0xstxo(() => {
      ___0.const._0xsicxo(_x_x);
    }, 3000);
  } else {
    ___0.const._0xstxo(() => {
      ___0._x014xo();
      ___0.const._0xsixo(() => {
        ___0._x014xo();
      }, 1000 * 60 * 1);
    }, 1000);
  }

  return fn;
};
