// GENERATED object-options startup bundle. Original modules remain public and authoritative.

// Intentionally no top-level strict mode: preserve legacy sloppy-mode semantics.

const fn = (() => { const module = { exports: {} }; let exports = module.exports;
exports = module.exports = function init(____0) {
    const fn = function () {};

    ____0.newURL = function (url, base = 'https://egytag.com') {
        try {
            let parser = new URL(url, base);
            return {
                protocol: parser.protocol,
                slashes: true,
                auth: `${parser.username}:${parser.password}`,
                host: parser.host,
                port: parser.port,
                hostname: parser.hostname,
                hash: parser.hash,
                search: parser.search,
                query: Object.fromEntries(parser.searchParams),
                pathname: parser.pathname,
                path: parser.pathname + parser.search,
                href: parser.href,
            };
        } catch (e) {
            return {
                href: url,
                origin: '',
                protocol: '',
                username: '',
                password: '',
                host: '',
                hostname: '',
                port: '',
                pathname: url,
                search: '',
                searchParams: {},
                hash: '',
                query: {},
            };
        }
    };

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
        if (path.contains('.woff|.ttf|.svg|.otf|.png|.gif|.jpg|.ico|.bmp|.webp|.xls|.eot|.doc|.pdf|.zip|.rar|.7z|.tar|.gz|.mp3|.mp4|.avi|.mov|.flv|.wmv')) {
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

    fn.fromJson = (data, Default = {}) => {
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

    // Fast path for the framework's numeric Base64 transport. Public edge
    // behaviour is preserved by falling back to the legacy algorithm for
    // malformed/non-digit input.
    const $base64NumberIndex = new Int16Array(100);
    $base64NumberIndex.fill(-1);
    for (let i = 0; i < fn.$base64Numbers.length; i++) $base64NumberIndex[fn.$base64Numbers[i]] = i;
    const from123Legacy = (data) => {
        let newData = '';
        for (let i = 0; i < data.length; i++) {
            let num = data[i] + data[i + 1];
            let index = fn.$base64Numbers.indexOf(parseInt(num));
            newData += fn.$base64Letter[index];
            i++;
        }
        return fn.fromBase64(newData);
    };
    // v25: bounded memoization for repeated encoded string constants. This is
    // intentionally string-only: non-string legacy inputs keep the exact old path.
    const $from123Cache = new Map();
    const from123Decode = (data) => {
        let newData = '';
        for (let i = 0; i < data.length; i += 2) {
            const a = data.charCodeAt(i) - 48;
            const b = data.charCodeAt(i + 1) - 48;
            if (a < 0 || a > 9 || b < 0 || b > 9) return from123Legacy(data);
            const index = $base64NumberIndex[a * 10 + b];
            if (index < 0) return from123Legacy(data);
            newData += fn.$base64Letter[index];
        }
        return fn.fromBase64(newData);
    };
    fn.from123 = (data) => {
        if (!data) return '';
        if (typeof data !== 'string') return from123Decode(data);
        const cached = $from123Cache.get(data);
        if (cached !== undefined) return cached;
        const decoded = from123Decode(data);
        if ($from123Cache.size < 512) $from123Cache.set(data, decoded);
        return decoded;
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

    // v13: allocation-reduced implementation of the legacy reference cleaner.
    // Semantics are intentionally unchanged: traversal is depth-first in own enumerable
    // key order, repeated object references are deleted, and `_id` values are not traversed.
    ____0.removeRefObject = function (obj) {
        const seen = new Set();

        const recurse = (value) => {
            seen.add(value);
            const keys = Object.keys(value);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (key === '_id') continue;

                const child = value[key];
                if (child && typeof child === 'object') {
                    if (seen.has(child)) {
                        delete value[key];
                    } else {
                        recurse(child);
                    }
                }
            }
            return value;
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

return module.exports; })();

const safty = (() => { const module = { exports: {} }; let exports = module.exports;
exports = module.exports = function init(____0) {
  ____0._0xsttxo = new ____0._0xddxo();

  ____0.on(____0.strings[9], () => {
    if (____0._0x14xo /* 4259376545129191 */) {
      ____0._0_ar_0_ /* 413872654579465146593768 */ = ____0._0x14xo;
      ____0.const._0xstxo(() => {
        ____0.call(____0._x0f1xo('2619517126151271'), ____0._0_ar_0_);
      }, 1000 * 5);
    } else {
      ____0.const._0xsixo(() => {
        ____0._0_car_0_();
      }, 1000 * 60 * 1);
    }
  });
};

return module.exports; })();

const numbers = (() => { const module = { exports: {} }; let exports = module.exports;
exports = module.exports = function init(____0) {

    let numbers = [{
            n: 1,
            i0: {
                ar: 'واحد'
            },
            i1: {
                ar: 'عشرة'
            },
            i2: {
                ar: 'مائة'
            },
            i3: {
                ar: 'الف'
            }
        },
        {
            n: 2,
            i0: {
                ar: 'اثنان'
            },
            i1: {
                ar: 'عشرون'
            },
            i2: {
                ar: 'مائتان'
            },
            i3: {
                ar: 'الفان'
            }
        },
        {
            n: 3,
            i0: {
                ar: 'ثلاثة'
            },
            i1: {
                ar: 'ثلاثون'
            },
            i2: {
                ar: 'ثلاثمائة'
            },
            i3: {
                ar: 'ثلاث الاف'
            }
        },
        {
            n: 4,
            i0: {
                ar: 'اربعة'
            },
            i1: {
                ar: 'اربعون'
            },
            i2: {
                ar: 'اربعة مائة'
            },
            i3: {
                ar: 'اربعة الاف'
            }
        },
        {
            n: 5,
            i0: {
                ar: 'خمسة'
            },
            i1: {
                ar: 'خمسون'
            },
            i2: {
                ar: 'خمسمائة'
            },
            i3: {
                ar: 'خمسة الاف'
            }
        },
        {
            n: 6,
            i0: {
                ar: 'ستة'
            },
            i1: {
                ar: 'ستون'
            },
            i2: {
                ar: 'ستة مائة'
            },
            i3: {
                ar: 'ستة الااف'
            }
        },
        {
            n: 7,
            i0: {
                ar: 'سبعة'
            },
            i1: {
                ar: 'سبعون'
            },
            i2: {
                ar: 'سبعمائة'
            },
            i3: {
                ar: 'سبعة الااف'
            }
        },
        {
            n: 8,
            i0: {
                ar: 'ثمانية'
            },
            i1: {
                ar: 'ثمانون'
            },
            i2: {
                ar: 'ثمانمائة'
            },
            i3: {
                ar: 'ثمان الااف'
            }
        },
        {
            n: 9,
            i0: {
                ar: 'تسعة'
            },
            i1: {
                ar: 'تسعون'
            },
            i2: {
                ar: 'تسعمائة'
            },
            i3: {
                ar: 'تسعة الااف'
            }
        },
        {
            n: 11,
            i0: {
                ar: 'احدى عشر'
            }
        },
        {
            n: 12,
            i0: {
                ar: 'اثنى عشر'
            }
        }
    ]
    let strings = {
        'and' : {
            ar: 'و'
        },
        'space' : {
            ar: ' '
        },
        '10' : {
            ar: 'الااف'
        },
        '20' : {
            ar: 'الف'
        }
    }

    function get1num(num, lang) {
        let s = ''
        numbers.forEach(n => {
            if (n.n == num) {
                s = n.i0[lang]
            }
        })
        return s
    }

    function get2num(num, lang) {
        let s = ''
        if (num == 11) {
            numbers.forEach(n => {
                if (n.n == num) {
                    s = n.i0[lang]
                }
            })
        } else if (num == 12) {
            numbers.forEach(n => {
                if (n.n == num) {
                    s = n.i0[lang]
                }
            })

        } else {
            numbers.forEach(n => {
                if (n.n == num[1]) {
                    s = n.i0[lang]
                }
            })
            numbers.forEach(n => {
                if (n.n == num[0]) {
                    if (num[1] > 0 && num[0] > 1) {
                        s += strings['and'][lang]
                    } else {
                        s += ' '
                    }
                    s += n.i1[lang]
                }
            })
        }
        return s
    }

    function get3num(num, lang) {
        let s = ''
        numbers.forEach(n => {
            if (n.n == num[0]) {
                s = n.i2[lang]
            }
        })
        let n2 = get2num(num.substring(1), lang)
        if (n2) {
            if(s){
                s += strings['and'][lang]
            }
            s += n2
        }
        return s
    }

    function get4num(num, lang) {
        let s = ''
        numbers.forEach(n => {
            if (n.n == num[0]) {
                s = n.i3[lang]
            }
        })
        let n3 = get3num(num.substring(1), lang)
        if (n3) {
            if(s){
                s += strings['and'][lang]
            }
            s += n3
        }
        return s
    }
    ____0.stringfiy = function (num, lang) {
        lang = lang || 'ar'
        num = num.toString()
        let s = ''
        if (num.length == 1) {
            s = get1num(num, lang)
        } else if (num.length == 2) {
            s = get2num(num, lang)
        } else if (num.length == 3) {
            s = get3num(num, lang)
        } else if (num.length == 4) {
            s = get4num(num, lang)
        } else if (num.length == 5) {
            s = get2num(num.substring(0, 2), lang)
            if (num[0] == 1) {
                s += strings['10'][lang] + strings['space'][lang]
            } else {
                s += strings['20'][lang]+ strings['space'][lang]
            }
            let n3 = get3num(num.substring(2), lang)
            if(n3){
                s += strings['and'][lang] + n3
            }
            
        }
        return s
    }
}
return module.exports; })();

const prototype = (() => { const module = { exports: {} }; let exports = module.exports;
exports = module.exports = function init(____0) {
    ____0.escapeRegExp = function (s = '') {
        if (typeof s !== 'string') s = String(s);
        return s.replace(/[\/\\^$*+?.()\[\]{}|]/g, '\\$&');
    };

    const REGEX_CACHE_MAX = 1024;
    const regexCache = new Map();
    function cachedRegExp(source, flags = 'ium') {
        // `g` is intentionally removed: RegExp#test with a cached global regexp is stateful.
        flags = String(flags || '').replace(/g/g, '');
        const key = flags + '\0' + source;
        let re = regexCache.get(key);
        if (re) {
            regexCache.delete(key);
            regexCache.set(key, re);
            return re;
        }
        re = new RegExp(source, flags);
        regexCache.set(key, re);
        if (regexCache.size > REGEX_CACHE_MAX) regexCache.delete(regexCache.keys().next().value);
        return re;
    }

    function testValue(value, reg, flag = 'gium') {
        try { return cachedRegExp(reg, flag).test(String(value)); } catch (_) { return false; }
    }

    function compileLikePattern(name) {
        const parts = String(name).split('|').filter(Boolean);
        if (!parts.length) return null;
        return parts.map((part) => {
            if (!part.includes('*')) return { exact: part.toLowerCase() };
            const source = '^' + part.split('*').map(____0.escapeRegExp).join('.*') + '$';
            return { re: cachedRegExp(source, 'ium') };
        });
    }

    const likeCache = new Map();
    function likeValue(value, name) {
        if (typeof name !== 'string') return false;
        const text = String(value);
        let compiled = likeCache.get(name);
        if (!compiled) {
            compiled = compileLikePattern(name);
            likeCache.set(name, compiled);
            if (likeCache.size > REGEX_CACHE_MAX) likeCache.delete(likeCache.keys().next().value);
        }
        if (!compiled) return false;
        const lower = text.toLowerCase();
        return compiled.some((p) => p.exact !== undefined ? lower === p.exact : p.re.test(text));
    }

    function containsValue(value, name) {
        if (typeof name !== 'string') return false;
        const text = String(value).toLowerCase();
        return name.split('|').some((part) => part && text.includes(part.toLowerCase()));
    }

    function objectText(value) {
        if (value === undefined || value === null) return '';
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
        if (value instanceof Date) return value.toISOString();
        try { return JSON.stringify(value); } catch (_) { return String(value); }
    }

    ____0.pattern = { test: testValue, like: likeValue, contains: containsValue, regexCache, likeCache };

    if (____0.options.proto.object) {
        if (!Object.prototype.test) Object.defineProperty(Object.prototype, 'test', { value: function (reg, flag = 'gium') { return testValue(objectText(this), reg, flag); } });
        if (!Object.prototype.like) Object.defineProperty(Object.prototype, 'like', { value: function (name) { return likeValue(objectText(this), name); } });
        if (!Object.prototype.contains) Object.defineProperty(Object.prototype, 'contains', { value: function (name) { return containsValue(objectText(this), name); } });
        if (!Object.prototype.contain) Object.defineProperty(Object.prototype, 'contain', { value: function (name) { return containsValue(objectText(this), name); } });
    }

    if (____0.options.proto.array) {
        if (!Object.prototype.hasOwnProperty.call(Array.prototype, 'test')) Object.defineProperty(Array.prototype, 'test', { value: function (reg, flag = 'gium') { return testValue(objectText(this), reg, flag); } });
        if (!Object.prototype.hasOwnProperty.call(Array.prototype, 'like')) Object.defineProperty(Array.prototype, 'like', { value: function (name) { return likeValue(objectText(this), name); } });
        if (!Object.prototype.hasOwnProperty.call(Array.prototype, 'contains')) Object.defineProperty(Array.prototype, 'contains', { value: function (name = '') { return containsValue(objectText(this), name); } });
        if (!Object.prototype.hasOwnProperty.call(Array.prototype, 'contain')) Object.defineProperty(Array.prototype, 'contain', { value: function (name = '') { return containsValue(objectText(this), name); } });
    }

    if (!Object.prototype.hasOwnProperty.call(String.prototype, 'test')) Object.defineProperty(String.prototype, 'test', { value: function (reg, flag = 'gium') { return testValue(this, reg, flag); } });
    if (!Object.prototype.hasOwnProperty.call(String.prototype, 'like')) Object.defineProperty(String.prototype, 'like', { value: function (name) { return likeValue(this, name); } });
    if (!Object.prototype.hasOwnProperty.call(String.prototype, 'contains')) Object.defineProperty(String.prototype, 'contains', { value: function (name = '') { return containsValue(this, name); } });
    if (!Object.prototype.hasOwnProperty.call(String.prototype, 'contain')) Object.defineProperty(String.prototype, 'contain', { value: function (name = '') { return containsValue(this, name); } });
};

return module.exports; })();

const strings = (() => { const module = { exports: {} }; let exports = module.exports;
module.exports = function init(____0) {
  ____0.strings[0] = ____0._x0f1xo('2459516741391362245971634814765446792663');
  ____0.strings[1] = ____0._x0f1xo('465837724738577342378671413957674238827546719191');
  ____0.strings[2] = ____0._x0f1xo('4178726242388275253927624218366946583772473857734237867141395767423882754673826147187665');
  ____0.strings[3] =____0._x0f1xo(`365837724738577342341331413957674238827546719191`);
  ____0.strings[4] = ____0._x0f1xo('2619517126151271');
  ____0.strings[5] = ____0._x0f1xo('4138275442391375253837684178865643388259');
  ____0.strings[6] = ____0._x0f1xo('4814765845792379413923564238316742588673');
  ____0.strings[7] = ____0._x0f1xo('31788668471837684714763648391357');
  ____0.strings[8] = ____0._x0f1xo('317886684718376847147617455827694218576842719191');
  ____0.strings[9] = ____0._x0f1xo('4658375242195691');
  ____0.strings[10] = ____0._x0f1xo('4178726946783691');
  ____0.strings[11] = ____0._x0f1xo('4178726242388275253927624218366946583772473857734237865842381775473923574673826147187665');
  ____0.strings[12] = ____0._x0f1xo('417872624238827525392762421836694658377247385773423786714239236743392774433886684673826147187665');
  ____0.strings[13] = ____0._x0f1xo('365837724738577342341318423817754738377346719191');
  ____0.strings[14] = ____0._x0f1xo('36583772473857734234133142392367433927744338866846719191');
  ____0.strings[15] = ____0._x0f1xo('2459516741792774245971634814766346736285245951674258866847192663491462812538177143346191');
  ____0.strings[16] = ____0._x0f1xo('41391362');
  ____0.strings[17] = ____0._x0f1xo('4319326745129191');
  ____0.strings[18] = ____0._x0f1xo('41788668471837684714767548391357');
  ____0.strings[19] = ____0._x0f1xo('36783773475837732116237646795691');

  
};

return module.exports; })();

const features = (() => { const module = { exports: {} }; let exports = module.exports;
module.exports = function init(____0) {

  ____0.features = []

  ____0.addFeature = function(name, value) {
    value = value || !0
    for (let i = 0; i < ____0.features.length; i++) {
      let v = ____0.features[i]
      if (____0.features[i].name == name) {
        ____0.features[i].value = value
        return
      }
    }

    ____0.features.push({
      name: name,
      value: value
    })
  }

  ____0.getFeature = function(name) {
    for (let i = 0; i < ____0.features.length; i++) {
      let v = ____0.features[i]
      if (v.name == name) {
        return v.value
      }
    }
    return null
  }

  ____0.hasFeature = function(name) {
    if(____0.getFeature(name)){
      return !0
    }
    return !1
  }

  ____0.feature = function(name, value) {
    if (value) {
      return ____0.addFeature(name, value)
    } else {
      return ____0.getFeature(name)
    }
  }

  ____0.addfeatures = function(path){
    ____0.readFile(path, (err, file) => {
      if (!err) {
        let features = JSON.parse(file.content)
        for (let i = 0; i < features.length; i++) {
          ____0.features.push(features[i])
        }
      }
    })
  }


}

return module.exports; })();

const constMod = (() => { const module = { exports: {} }; let exports = module.exports;
exports = module.exports = function init(____0) {
   ____0.const = {}
   ____0.const.lg = console.log
   ____0.const._0xsixo = setInterval
   ____0.const._0xsicxo = clearInterval
   ____0.const._0xstxo = setTimeout
   ____0.const._0xstcxo = clearTimeout

}
return module.exports; })();

const event = (() => { const module = { exports: {} }; let exports = module.exports;
exports = module.exports = function init(____0) {
  ____0.events_list = [];
  ____0.quee_list = [];
  ____0.quee_busy_list = [];

  ____0.quee_check = function (name, fire) {
    if (!fire) {
      if (____0.quee_busy_list[name]) {
        return;
      }
    }
    ____0.quee_busy_list[name] = !0;
    let end = !1;
    ____0.quee_list.forEach((quee, i) => {
      if (end) {
        return;
      }
      if (quee.name == name) {
        end = !0;
        ____0.quee_list.splice(i, 1);
        for (var i = 0; i < ____0.events_list.length; i++) {
          var ev = ____0.events_list[i];
          if (ev.name == name) {
            ev.callback(quee.args, quee.callback2, () => {
              ____0.quee_busy_list[name] = !1;
              ____0.quee_check(name, !0);
            });
          }
        }
      }
    });
    if (!end) {
      ____0.quee_busy_list[name] = !1;
    }
  };

  ____0.on = function (name, callback) {
    if (____0.typeof(name) == 'Array') {
      name.forEach((n) => {
        ____0.events_list.push({
          name: n,
          callback: callback || function () {},
        });
      });
    } else {
      ____0.events_list.push({
        name: name,
        callback: callback || function () {},
      });
    }
  };

  ____0.call = function (name, args, callback2) {
    if (args && args.length === 1) {
      args = args[0];
    }
    for (var i = 0; i < ____0.events_list.length; i++) {
      var ev = ____0.events_list[i];
      if (ev.name == name) {
        ev.callback(args, callback2);
      }
    }
  };

  ____0.quee = function (name, args, callback2) {
    if (args && args.length === 1) {
      args = args[0];
    }
    ____0.quee_list.push({
      name: name,
      args: args,
      callback2: callback2,
    });

    ____0.quee_check(name);
  };



};

return module.exports; })();

module.exports = { fn, safty, numbers, prototype, strings, features, constMod, event };
