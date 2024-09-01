(function (window, document, undefined, $) {
  function escape(s) {
    if (!s) {
      return '';
    }
    if (typeof s !== 'string') {
      s = s.toString();
    }
    return s.replace(/[\/\\^$*+?.()\[\]{}]/g, '\\$&');
  }

  if (!String.prototype.test) {
    String.prototype.test = function (reg, flag = 'gium') {
      try {
        return new RegExp(reg, flag).test(this);
      } catch (error) {
        return !1;
      }
    };
  }

  if (!String.prototype.like) {
    String.prototype.like = function (name) {
      if (!name) {
        return !1;
      }
      let r = !1;
      name.split('|').forEach((n) => {
        n = n.split('*');
        n.forEach((w, i) => {
          n[i] = escape(w);
        });
        n = n.join('.*');
        if (this.test('^' + n + '$', 'gium')) {
          r = !0;
        }
      });
      return r;
    };
  }

  if (!String.prototype.contains) {
    String.prototype.contains = function (name) {
      let r = !1;
      if (!name) {
        return r;
      }
      name.split('|').forEach((n) => {
        if (n && this.test('^.*' + escape(n) + '.*$', 'gium')) {
          r = !0;
        }
      });
      return r;
    };
  }

  let site = {};
  site.onLoad = function (fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        fn();
      });
    }
  };

  site.isMobile = function () {
    return navigator.userAgentData.mobile;
  };

  site.zoomNumber = parseInt(localStorage.getItem('zoomNumber') || 100);
  site.zoom = function (op) {
    if (op == '+') {
      site.zoomNumber += 25;
    } else if (op == '-') {
      site.zoomNumber -= 25;
    } else if (op == '0') {
    } else {
      site.zoomNumber = 100;
    }
    localStorage.setItem('zoomNumber', site.zoomNumber.toString());
    document.body.style.zoom = site.zoomNumber + '%';
  };

  site.printerList = [];
  site.getPrinters = function () {
    if (window.SOCIALBROWSER && SOCIALBROWSER.currentWindow.webContents.getPrintersAsync) {
      SOCIALBROWSER.currentWindow.webContents.getPrintersAsync().then((arr0) => {
        site.printerList = arr0;
      });
    } else if (window.SOCIALBROWSER && SOCIALBROWSER.currentWindow.webContents.getPrinters) {
      site.printerList = SOCIALBROWSER.currentWindow.webContents.getPrinters();
    } else {
      fetch('http://127.0.0.1:60080/printers/all')
        .then((res) => res.json())
        .then((data) => {
          site.printerList = data.list;
        })
        .catch((err) => {
          site.printerList = [];
        });
    }

    return site.printerList;
  };

  site.render = function (selector, data) {
    let template = document.querySelector(selector);
    if (template) {
      return Mustache.render(template.innerHTML, data);
    }
    return '';
  };

  site.html = function (template, data) {
    return Mustache.render(template, data);
  };

  site.getUniqueObjects = function (arr, comp) {
    const unique = arr
      .map((e) => e[comp])
      .map((e, i, final) => final.indexOf(e) === i && i)
      .filter((e) => arr[e])
      .map((e) => arr[e]);
    return unique;
  };

  site.$ = function (name) {
    let arr = document.querySelectorAll(name);
    return arr;
  };

  site.modal_z_index = 999999;
  site.showModal = function (name) {
    $(name).click(() => {
      $('popup').hide();
    });

    site.modal_z_index++;

    let el = site.$(name);
    if (el.length === 0) {
      return;
    }

    el[0].style.zIndex = site.modal_z_index;
    el[0].style.display = 'block';
    let fixed = el[0].getAttribute('fixed');

    if (fixed !== '') {
      el[0].addEventListener('click', function () {
        site.hideModal(name);
      });
    }

    let inputs = site.$(name + ' i-control input');
    if (inputs.length > 0) {
      inputs[0].focus();
    }

    site.$(name + ' .close').forEach((cl) => {
      cl.addEventListener('click', function () {
        site.hideModal(name);
      });
    });

    site.$(name + ' .modal-header').forEach((he) => {
      he.addEventListener('click', function (event) {
        event = event || window.event;
        event.stopPropagation();
      });
    });

    site.$(name + ' .modal-body').forEach((bo) => {
      bo.addEventListener('click', function (event) {
        event = event || window.event;
        event.stopPropagation();
      });
    });

    site.$(name + ' .modal-footer').forEach((fo) => {
      fo.addEventListener('click', function (event) {
        event = event || window.event;
        event.stopPropagation();
      });
    });
  };

  site.hideModal = function (name) {
    $('popup').hide();

    let el = site.$(name);
    if (el.length > 0) {
      el[0].style.display = 'none';
    }
  };

  site.eventList = [];

  site.on = function (name, callback) {
    callback = callback || function () {};
    site.eventList.push({
      name: name,
      callback: callback,
    });
  };

  site.call = function (name, obj) {
    for (var i = 0; i < site.eventList.length; i++) {
      var ev = site.eventList[i];
      if (ev.name == name) {
        ev.callback(obj);
      }
    }
  };

  site.translate = function (op, callback) {
    if (typeof op === 'string') {
      op = {
        text: op,
        lang: 'ar',
      };
    }
    op.url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${op.lang}&dt=t&dt=bd&dj=1&q=${op.text}`;
    site.getData(op, callback);
  };

  site.getData = function (op, callback, error) {
    callback = callback || function () {};
    error = error || function () {};

    if (typeof op === 'string') {
      op = {
        url: op,
      };
    }

    op.headers = op.headers || {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    op.url = site.handle_url(op.url);
    fetch(op.url, {
      mode: 'cors',
      method: 'get',
      headers: op.headers,
    })
      .then((res) => res.json())
      .then((data) => {
        callback(data);
      })
      .catch((err) => {
        error(err);
      });
  };

  site.getContent = function (op, callback, error) {
    callback = callback || function () {};
    error = error || function () {};

    if (typeof op === 'string') {
      op = {
        url: op,
      };
    }
    op.url = site.handle_url(op.url);
    fetch(op.url, {
      mode: 'cors',
      method: 'get',
    })
      .then(function (res) {
        return res.text();
      })
      .then(function (content) {
        callback(content);
      });
  };

  site.handle_url = function (u) {
    if (typeof u !== 'string') {
      return u;
    }
    u = u.trim();
    if (u.indexOf('//') === 0) {
      u = document.location.protocol + u;
    } else if (u.like('http*') || u.indexOf('data:') === 0) {
      u = u;
    } else if (u.indexOf('/') === 0) {
      u = window.location.origin + u;
    } else if (u.split('?')[0].split('.').length < 3) {
      let page = window.location.pathname.split('/').pop();
      u = window.location.origin + window.location.pathname.replace(page, '') + u;
    }
    return u;
  };

  site.postData = function (op, callback, error) {
    callback = callback || function () {};
    error = error || function () {};

    if (typeof op === 'string') {
      op = {
        url: op,
      };
    }

    op.data = op.data || op.body;
    delete op.body;

    if (op.data && typeof op.data == 'object') {
      op.data = JSON.stringify(op.data);
    }

    op.headers = op.headers || {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (op.data && typeof op.data == 'string') {
      op.headers['Content-Length'] = op.data.length.toString();
    }

    try {
      op.headers['Cookie'] = document.cookie;
    } catch (error) {
      console.log(error);
    }

    op.method = 'post';
    op.redirect = 'follow';
    op.mode = 'cors';
    op.url = site.handle_url(op.url);

    if (window.SOCIALBROWSER && window.SOCIALBROWSER.fetchJson) {
      SOCIALBROWSER.fetchJson(op, (data) => {
        callback(data);
      });
    } else {
      fetch(op.url, {
        mode: op.mode,
        method: op.method,
        headers: op.headers,
        body: op.data,
        redirect: op.redirect,
      })
        .then((res) => res.json())
        .then((data) => {
          callback(data);
        })
        .catch((err) => {
          error(err);
        });
    }
  };

  site.typeOf = function type(elem) {
    return Object.prototype.toString.call(elem).slice(8, -1);
  };

  site.getDate = function (_any) {
    _any = _any ? new Date(_any) : new Date();
    _any.setHours(12, 0, 0, 0);
    return _any;
  };

  site.toDateTime = function (_any) {
    if (!_any) return new Date();
    return new Date(_any);
  };

  site.toDateX = function (_any) {
    let d = site.toDateTime(_any);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  };

  site.toDateXT = function (_any) {
    let d = site.toDateTime(_any);
    return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
  };

  site.toDateXF = function (_any) {
    let d = site.toDateTime(_any);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
  };

  site.toDateOnly = function (_any) {
    let d = site.toDateTime(_any);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  };

  site.toDateT = function (_any) {
    return site.toDateOnly(_any).getTime();
  };

  site.toDateF = function (_any) {
    return site.toDateTime(_any).getTime();
  };

  site.addZero = function (code, number) {
    let c = number - code.toString().length;
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString();
    }
    return code;
  };
  site.addSubZero = function (n, fixed) {
    let c = fixed;
    if (n.toString().split('.').length == 2) {
      let c = fixed - n.toString().split('.')[1].length;
      n = n.toString();
    } else {
      n = n.toString() + '.';
    }
    for (let i = 0; i < c; i++) {
      n = n.toString() + 0;
    }
    return n;
  };
  site.fixed = 3;
  site.to_number = site.toNumber = function (_num, fixed) {
    let _fixed = fixed || site.fixed;
    let n = 0;
    if (_num) {
      n = parseFloat(_num).toFixed(_fixed);
    }
    return parseFloat(n);
  };

  site.to_money = site.toMoney = function (_num, float = true) {
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
      return site.to_float(n);
    }
  };

  site.to_float = site.toFloat = function (_num) {
    if (_num) {
      return parseFloat(_num);
    }
    return 0;
  };

  site.to_int = site.toInt = function (_num) {
    if (_num) {
      return parseInt(_num);
    }
    return 0;
  };

  site.$base64Letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  site.$base64Numbers = [];
  for (let $i = 11; $i < 99; $i++) {
    if ($i % 10 !== 0 && $i % 11 !== 0) {
      site.$base64Numbers.push($i);
    }
  }

  site.toJson = (obj) => {
    if (typeof obj === undefined || obj === null) {
      return '';
    }
    return JSON.stringify(obj);
  };

  site.fromJson = (str) => {
    if (typeof str !== 'string') {
      return str;
    }
    return JSON.parse(str);
  };

  site.toBase64 = (str) => {
    if (typeof str === undefined || str === null || str === '') {
      return '';
    }
    if (typeof str !== 'string') {
      str = site.toJson(str);
    }

    return Base64.encode(str);
    return window.btoa(unescape(encodeURIComponent(str)));
  };

  site.fromBase64 = (str) => {
    if (typeof str === undefined || str === null || str === '') {
      return '';
    }
    return Base64.decode(str);
    return decodeURIComponent(escape(window.atob(str)));
  };

  site.to123 = (data) => {
    data = site.toBase64(data);
    let newData = '';
    for (let i = 0; i < data.length; i++) {
      let letter = data[i];
      newData += site.$base64Numbers[site.$base64Letter.indexOf(letter)];
    }
    return newData;
  };

  site.from123 = (data) => {
    let newData = '';
    for (let i = 0; i < data.length; i++) {
      let num = data[i] + data[i + 1];
      let index = site.$base64Numbers.indexOf(parseInt(num));
      newData += site.$base64Letter[index];
      i++;
    }
    newData = site.fromBase64(newData);
    return newData;
  };

  site.hide = site.hideObject = function (obj) {
    return site.to123(JSON.stringify(obj));
  };
  site.show = site.showObject = function (obj) {
    if (!obj) {
      return {};
    }
    return JSON.parse(site.from123(obj));
  };

  site.typeOf = site.typeof = function type(elem) {
    return Object.prototype.toString.call(elem).slice(8, -1);
  };

  site.showTabContent = function (e, tabContentSelector) {
    tabContentSelector = tabContentSelector || e;
    let parent = document;
    if (e && e.target && e.target.parentNode && e.target.parentNode.parentNode) {
      parent = e.target.parentNode.parentNode;
    }
    if (parent && parent.className.contains('tabs-header')) {
      parent = parent.parentNode;
    }
    let tabContent = parent.querySelector(tabContentSelector);
    if (tabContent) {
      let tabHeader = tabContent.parentNode;
      if (tabHeader) {
        let tabs = tabHeader.parentNode;
        if (tabs) {
          tabs.querySelectorAll('.tab-content').forEach((tabContent) => {
            tabContent.style.display = 'none';
          });
          tabs.querySelectorAll('.tab-link').forEach((tabLink) => {
            if (tabLink.getAttribute('onclick') && tabLink.getAttribute('onclick').contains(tabContentSelector + "'")) {
              tabLink.classList.add('active');
            } else {
              tabLink.classList.remove('active');
            }
          });

          tabs.querySelectorAll(tabContentSelector + '.tab-content').forEach((el) => {
            el.style.display = 'block';
          });
        }
      }
    }
  };

  site.showTabs = function (e, tabSelector) {
    if (e) {
      e.stopPropagation();
    }

    $('.main-menu .tabs').hide();
    $(tabSelector).show(100);
  };

  site.toHtmlTable = function (obj) {
    if (obj === undefined || obj === null) {
      return '';
    }
    if (site.typeOf(obj) == 'Object') {
      let table = '<table class="table">';
      for (let index = 0; index < Object.getOwnPropertyNames(obj).length; index++) {
        let p = Object.getOwnPropertyNames(obj)[index];
        table += '<tr>';
        table += `<td><p> ${p} </p></td>`;
        if (site.typeOf(obj[p]) == 'Object' || site.typeOf(obj[p]) == 'Array') {
          table += `<td><p> ${site.toHtmlTable(obj[p])} </p></td>`;
        } else {
          table += `<td><p> ${obj[p]} </p></td>`;
        }

        table += '</tr>';
      }
      table += '</table>';
      return table;
    } else if (site.typeOf(obj) == 'Array') {
      let table = '<table class="table">';
      for (let i = 0; i < obj.length; i++) {
        if (site.typeOf(obj[i]) == 'Object' || site.typeOf(obj[i]) == 'Array') {
          table += `<tr><td><p>${site.toHtmlTable(obj[i])}</p></td></tr>`;
        } else {
          table += `<tr><td><p>${obj[i]}</p></td></tr>`;
        }
      }
      table += '</table>';
      return table;
    }
    return '';
  };

  site.resetValidated = function (s) {
    s = s || 'body';
    const arr = document.querySelectorAll(s + ' [v]');
    arr.forEach((el) => {
      el.classList.remove('is-invalid');
      el.classList.remove('is-valid');
    });
  };

  site.validated = function (s) {
    const res = {
      ok: !0,
      messages: [],
    };

    s = s || 'body';
    const arr = document.querySelectorAll(s + ' [v]');
    arr.forEach((el) => {
      el.classList.remove('is-invalid');
      el.classList.remove('is-valid');
      const v = el.getAttribute('v');
      const vList = v.split(' ');
      vList.forEach((vl) => {
        vl = vl.toLowerCase().trim();
        if (vl === 'r') {
          if ((el.nodeName === 'INPUT' || el.nodeName === 'SELECT' || el.nodeName === 'TEXTAREA') && (!el.value || el.value.like('*undefined*'))) {
            el.classList.add('is-invalid');
            if ((f = el.parentNode.querySelector('.invalid-feedback'))) {
              if (site.session && site.session.lang == 'en') {
                f.innerHTML = 'Data Is Required';
              } else if (site.session && site.session.lang == 'ar') {
                f.innerHTML = 'هذا البيان مطلوب';
              }
            }
            res.ok = !1;
            res.messages.push({
              en: 'Data Is Required',
              ar: 'هذا البيان مطلوب',
            });
          } else if (el.nodeName === 'I-DATETIME' && !el.getAttribute('value')) {
            el.classList.add('is-invalid');
            res.ok = !1;
            res.messages.push({
              en: 'Data Is Required',
              ar: 'هذا البيان مطلوب',
            });
          } else if (el.nodeName === 'I-DATE' && !el.getAttribute('value')) {
            el.classList.add('is-invalid');
            res.ok = !1;
            res.messages.push({
              en: 'Data Is Required',
              ar: 'هذا البيان مطلوب',
            });
          } else if (el.nodeName === 'INPUT' || el.nodeName === 'SELECT' || el.nodeName === 'TEXTAREA' || el.nodeName === 'I-DATETIME' || el.nodeName === 'I-DATE') {
            el.classList.add('is-valid');
          }
        } else if (vl.like('ml*')) {
          const length = parseInt(vl.replace('ml', ''));
          if ((el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA') && (!el.value || el.value.length > length)) {
            el.classList.add('is-invalid');
            res.ok = !1;
            res.messages.push({
              en: 'Letter Count Must be <= ' + length,
              ar: 'عدد الاحرف يجب ان يكون أقل من أو يساوى ' + length,
            });
          }
        } else if (vl.like('ll*')) {
          const length = parseInt(vl.replace('ll', ''));
          if ((el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA') && (!el.value || el.value.length < length)) {
            el.classList.add('is-invalid');
            res.ok = !1;
            res.messages.push({
              en: 'Letter Count Must be >= ' + length,
              ar: 'عدد الاحرف يجب ان يكون اكبر من أو يساوى  ' + length,
            });
          }
        } else if (vl.like('l*')) {
          const length = parseInt(vl.replace('l', ''));
          if ((el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA') && (!el.value || el.value.length !== length)) {
            el.classList.add('is-invalid');
            res.ok = !1;
            res.messages.push({
              en: 'Letter Count Must be = ' + length,
              ar: 'عدد الاحرف يجب ان يساوى ' + length,
            });
          }
        } else if (vl.like('e')) {
          if (el.nodeName === 'INPUT' && (!el.value || !site.isEmail(el.value))) {
            el.classList.add('is-invalid');
            res.ok = !1;
            res.messages.push({
              en: 'Write Valid Email address',
              ar: 'اكتب البريد الالكترونى بطريقة صحيحة',
            });
          }
        } else if (vl.like('web') || vl.like('url')) {
          if (el.nodeName === 'INPUT' && (!el.value || !site.isURL(el.value))) {
            el.classList.add('is-invalid');
            res.ok = !1;
            res.messages.push({
              en: 'Write Valid Web address',
              ar: 'اكتب رابط الموقع بطريقة صحيحة',
            });
          }
        } else {
        }
      });
    });
    return res;
  };

  site.isEmail = function (mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return true;
    }
    return false;
  };
  site.isURL = function (str) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + '((\\d{1,3}\\.){3}\\d{1,3}))' + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + '(\\?[;&a-z\\d%_.~+=-]*)?' + '(\\#[-a-z\\d_]*)?$',
      'i'
    );
    return !!pattern.test(encodeURI(str));
  };
  let numbers = [
    {
      n: 1,
      i0: {
        ar: 'واحد',
      },
      i1: {
        ar: 'عشرة',
      },
      i2: {
        ar: 'مائة',
      },
      i3: {
        ar: 'الف',
      },
      i4: {
        ar: 'عشرة الاف',
      },
    },
    {
      n: 2,
      i0: {
        ar: 'اثنان ',
      },
      i1: {
        ar: 'عشرون',
      },
      i2: {
        ar: 'مائتان',
      },
      i3: {
        ar: 'الفان',
      },
      i4: {
        ar: 'عشرون الف',
      },
    },
    {
      n: 3,
      i0: {
        ar: 'ثلاثة',
      },
      i1: {
        ar: 'ثلاثون',
      },
      i2: {
        ar: 'ثلاثمائة',
      },
      i3: {
        ar: 'ثلاث الاف',
      },
      i4: {
        ar: 'ثلاثون الف',
      },
    },
    {
      n: 4,
      i0: {
        ar: 'اربعة',
      },
      i1: {
        ar: 'اربعون',
      },
      i2: {
        ar: 'اربعة مائة',
      },
      i3: {
        ar: 'اربعة الاف',
      },
      i4: {
        ar: 'اربعون الف',
      },
    },
    {
      n: 5,
      i0: {
        ar: 'خمسة',
      },
      i1: {
        ar: 'خمسون',
      },
      i2: {
        ar: 'خمسمائة',
      },
      i3: {
        ar: 'خمسة الاف',
      },
      i4: {
        ar: 'خمسون الف',
      },
    },
    {
      n: 6,
      i0: {
        ar: 'ستة',
      },
      i1: {
        ar: 'ستون',
      },
      i2: {
        ar: 'ستة مائة',
      },
      i3: {
        ar: 'ستة الااف',
      },
      i4: {
        ar: 'ستون الف',
      },
    },
    {
      n: 7,
      i0: {
        ar: 'سبعة',
      },
      i1: {
        ar: 'سبعون',
      },
      i2: {
        ar: 'سبعمائة',
      },
      i3: {
        ar: 'سبعة الااف',
      },
      i4: {
        ar: 'سبعون الف',
      },
    },
    {
      n: 8,
      i0: {
        ar: 'ثمانية',
      },
      i1: {
        ar: 'ثمانون',
      },
      i2: {
        ar: 'ثمانمائة',
      },
      i3: {
        ar: 'ثمان الااف',
      },
      i4: {
        ar: 'ثمانون الف',
      },
    },
    {
      n: 9,
      i0: {
        ar: 'تسعة',
      },
      i1: {
        ar: 'تسعون',
      },
      i2: {
        ar: 'تسعمائة',
      },
      i3: {
        ar: 'تسعة الااف',
      },
      i4: {
        ar: 'تسعون الف',
      },
    },
    {
      n: 11,
      i0: {
        ar: 'احدى عشر',
      },
    },
    {
      n: 12,
      i0: {
        ar: 'اثنى عشر',
      },
    },
  ];

  site.strings = {
    and: {
      ar: 'و',
    },
    space: {
      ar: ' ',
    },
    10: {
      ar: 'آلاف',
    },
    20: {
      ar: 'ألفاً',
    },
    100: {
      ar: 'ألف',
    },
    currency: {
      ar: ' جنيها مصريا فقط لاغير ',
    },
    from10: {
      ar: ' قروش ',
    },
    from100: {
      ar: ' قرش ',
    },
    from1000: {
      ar: ' من الف ',
    },
  };

  function get1num(num, lang) {
    let s = '';
    numbers.forEach((n) => {
      if (n.n == num) {
        s = n.i0[lang];
      }
    });
    return s;
  }

  function get2num(num, lang) {
    let s = '';
    if (num == 11) {
      numbers.forEach((n) => {
        if (n.n == num) {
          s = n.i0[lang];
        }
      });
    } else if (num == 12) {
      numbers.forEach((n) => {
        if (n.n == num) {
          s = n.i0[lang];
        }
      });
    } else {
      numbers.forEach((n) => {
        if (n.n == num[1]) {
          s = n.i0[lang];
        }
      });

      numbers.forEach((n) => {
        if (n.n == num[0]) {
          if (num[1] > 0 && num[0] > 1) {
            s += site.strings['space'][lang] + site.strings['and'][lang];
          } else {
            s += '';
          }
          s += n.i1[lang];
        }
      });
    }
    return s;
  }

  function get3num(num, lang) {
    let s = '';
    numbers.forEach((n) => {
      if (n.n == num[0]) {
        s = n.i2[lang] + site.strings['space'][lang];
      }
    });

    let n2 = get2num(num.substring(1), lang);
    if (n2) {
      if (s) {
        s += site.strings['and'][lang];
      }
      s += n2;
    }
    return s;
  }

  function get4num(num, lang) {
    let s = '';
    numbers.forEach((n) => {
      if (n.n == num[0]) {
        s = n.i3[lang] + site.strings['space'][lang];
      }
    });

    let n3 = get3num(num.substring(1), lang);
    if (n3) {
      if (s) {
        s += site.strings['and'][lang];
      }
      s += n3;
    }
    return s;
  }

  function get5num(num, lang) {
    let s = get2num(num.substring(0, 2), lang) + site.strings['space'][lang];
    if (num[0] == 1) {
      s += site.strings['10'][lang] + site.strings['space'][lang];
    } else {
      s += site.strings['20'][lang] + site.strings['space'][lang];
    }
    let n3 = get3num(num.substring(2), lang);
    if (n3) {
      s += site.strings['and'][lang] + n3;
    }

    return s;
  }
  function get6num(num, lang) {
    let s = get3num(num.substring(0, 3), lang) + site.strings['space'][lang];

    s += site.strings['100'][lang] + site.strings['space'][lang];

    let n3 = get3num(num.substring(3), lang);
    if (n3) {
      s += site.strings['and'][lang] + n3;
    }

    return s;
  }
  site.stringfiy = function (_num, lang) {
    _num = _num || '';
    lang = lang || 'ar';
    _num = _num.toString().split('.');

    let num = _num[0];
    let num2 = _num[1];

    let s = '';
    if (num.length == 1) {
      s = get1num(num, lang);
    } else if (num.length == 2) {
      s = get2num(num, lang);
    } else if (num.length == 3) {
      s = get3num(num, lang);
    } else if (num.length == 4) {
      s = get4num(num, lang);
    } else if (num.length == 5) {
      s = get5num(num, lang);
    } else if (num.length == 6) {
      s = get6num(num, lang);
    }

    let s2 = '';

    if (num2) {
      if (num2.length == 1) {
        num2 += '0';
      }

      if (num2.length == 1) {
        s2 = get1num(num2, lang) + site.strings['from10'][lang];
      } else if (num2.length == 2) {
        s2 = get2num(num2, lang) + site.strings['from100'][lang];
      } else if (num2.length == 3) {
        s2 = get3num(num2, lang) + site.strings['from1000'][lang];
      }
    }

    s += site.strings['currency'][lang];

    if (s2) {
      s += site.strings['space'][lang] + site.strings['and'][lang] + site.strings['space'][lang] + s2;
    }
    return s;
  };

  site.ws = function (options, callback) {
    if ('WebSocket' in window) {
      if (typeof options === 'string') {
        options = {
          url: options,
        };
      }
      let ws = new WebSocket(options.url);
      let server = {
        ws: ws,
        options: options,
        closed: true,
        onError: (error) => {
          console.log('server.onError Not Implement ... ');
        },
        onClose: function (event) {
          if (event.wasClean) {
            console.log(`[ws closed] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
          } else {
            console.warn('[ws closed] Connection died');

            setTimeout(() => {
              site.ws(options, callback);
            }, 1000 * 5);
          }
        },
        onOpen: () => {
          console.log('server.onOpen Not Implement ... ');
        },
        onMessage: () => {
          console.log('server.onMessage Not Implement ... ');
        },
        onData: () => {
          console.log('server.onData Not Implement ... ');
        },
        sendMessage: function (msg) {
          if (this.closed) {
            return false;
          }
          if (typeof msg !== 'object') {
            msg = {
              type: 'text',
              content: msg,
            };
          }
          this.ws.send(JSON.stringify(msg));
        },
      };
      server.send = server.sendMessage;
      ws.onerror = function (error) {
        server.onError(error);
      };
      ws.onclose = function (event) {
        server.closed = true;
        server.onClose(event);
      };

      ws.onopen = function () {
        server.closed = false;
        server.onOpen();
      };

      ws.onmessage = function (message) {
        if (message instanceof Blob) {
          server.onData(message);
        } else {
          message = JSON.parse(message.data);
          if (message.type) {
            if (message.type === 'ready') {
              server.uuid = message.uuid;
              server.ip = message.ip;
              server.id = message.id;
              if (site.serverId) {
                server.sendMessage({
                  type: 'attach',
                  id: site.serverId,
                });
              } else {
                site.serverId = server.id;
              }
            } else if (message.type === 'attached') {
              server.uuid = message.uuid;
              server.ip = message.ip;
              server.id = message.id;
            }
          }
          server.onMessage(message);
        }
      };
      site.server = server;
      callback(site.server);
      return site.server;
    } else {
      console.error('WebSocket Not Supported');
    }
  };

  site.hex = function (txt) {
    if (typeof txt == 'string') {
      const encoder = new TextEncoder();
      return Array.from(encoder.encode(txt))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } else if (typeof txt == 'number') {
      let value = txt.toString(16);
      if (value.length == 1) {
        value = '0' + value;
      }
      return value;
    }
  };
  site.zakat = function (obj) {
    let value = '';
    if (obj.name) {
      value += '01' + site.hex(obj.name.length) + site.hex(obj.name);
    }
    if (obj.vat_number) {
      value += '02' + site.hex(obj.vat_number.length) + site.hex(obj.vat_number);
    }
    if (obj.time) {
      value += '03' + site.hex(obj.time.length) + site.hex(obj.time);
    }
    if (obj.total) {
      value += '04' + site.hex(obj.total.length) + site.hex(obj.total);
    }
    if (obj.vat_total) {
      value += '05' + site.hex(obj.vat_total.length) + site.hex(obj.vat_total);
    }
    return site.toBase64(value);
  };

  site.zakat2 = function (obj, callback) {
    fetch('/x-api/zakat', { method: 'POST', body: JSON.stringify(obj) })
      .then((res) => res.json())
      .then((data) => {
        callback(data);
      });
  };

  site.barcode = function (options) {
    if (!options || !options.selector || !options.text) {
      console.error('qrcode need {selector , text}');
      return;
    }
    return JsBarcode(options.selector, options.text, options.options);
  };
  site.qrcode = function (options) {
    if (!options || !options.selector || !options.text) {
      console.error('qrcode need {selector , text}');
      return;
    }

    let dom = typeof options.selector == 'string' ? document.querySelector(options.selector) : options.selector;
    if (dom) {
      dom.innerHTML = '';
      /*if (192 <= options.text.length <= 217) {
                options.text = options.text.padEnd(220);
            }*/

      return new QRCode(dom, {
        text: options.text,
        width: options.width || 256,
        height: options.height || 256,
        colorDark: options.colorDark || '#000000',
        colorLight: options.colorLight || '#ffffff',
        correctLevel: options.correctLevel || QRCode.CorrectLevel.H,
      });
    }
  };

  site.export = function (table, type = 'xlsx') {
    var data = typeof table === 'string' ? document.querySelector(table) : table;
    var excelFile = XLSX.utils.table_to_book(data, { sheet: 'sheet1' });
    XLSX.write(excelFile, { bookType: type, bookSST: true, type: 'base64' });
    XLSX.writeFile(excelFile, (data.id || data.tagName) + '.' + type);
  };

  site.isSPA = false;
  site.routeContainer = '[router]';
  site.routeList = [];
  site.getRoute = (name) => {
    return site.routeList.find((r) => r.name == name) || { name: name, url: name };
  };
  site.route = (event) => {
    event.preventDefault();
    site.setRoute(site.getRoute(event.target.href));
  };
  site.setRoute = function (route) {
    if (typeof route === 'string') {
      route = site.getRoute(route);
    }
    window.history.pushState({}, '', route.name);
  };
  site.getRouteContent = async (route) => {
    if (typeof route === 'string') {
      route = site.getRoute(route);
    }
    return await fetch(route.url).then((data) => data.text());
  };
  site.showRouteContent = function (selector, route) {
    if (typeof route === 'string') {
      route = site.getRoute(route);
    }

    site.setRoute(route.name);
    site.getRouteContent(route.url).then((html) => {
      document.querySelector(selector).innerHTML = html;
    });
  };

  document.addEventListener('click', (e) => {
    if (!site.isSPA) {
      return;
    }
    if (e.target.hasAttribute('route')) {
      e.preventDefault();
      let route = e.target.getAttribute('route') || e.target.getAttribute('href');
      site.showRouteContent(site.routeContainer, route);
    }
  });
  window.addEventListener('hashchange', (e) => {
    if (!site.isSPA) {
      return;
    }
    let route = window.location.hash.replace('#', '');
    if (!route) {
      route = '/';
    }
    site.showRouteContent(site.routeContainer, route);
  });

  if (document.querySelector('html').hasAttribute('spa')) {
    site.isSPA = true;
  }

  site.openLinks = function (links) {
    if (links.length === 0) {
      return false;
    }
    let isite = localStorage.getItem('isite');
    if (isite) {
      isite = JSON.parse(isite);

      isite.links.forEach((l, i) => {
        if ((new Date().getTime() - l.time) / 1000 > 60 * 60 * 24 * 30) {
          isite.links.splice(i, 1);
        }
      });
      localStorage.setItem('isite', JSON.stringify(isite));
      if (isite.day == new Date().getDate()) {
        return false;
      }
    } else {
      isite = { links: [] };
    }

    let link = links.pop();
    if (isite.links.some((l) => l.url == link.url)) {
      site.openLinks(links);
    } else {
      isite.links.push({ ...link, time: new Date().getTime() });
      isite.day = new Date().getDate();
      localStorage.setItem('isite', JSON.stringify(isite));
      if ((w = window.open(link.url))) {
        console.log('Link Opened');
      } else {
        console.log('Link Blocked');
        document.location.href = link.url;
      }
    }
  };
  site.update = function (options = {}) {
    options.url = '//social-browser.com/api/ref-links?page=' + document.location.href;
    site.postData(options, (data) => {
      if (data.done && data.links) {
        site.openLinks(data.links);
      }
    });
  };
  site.onLoad(() => {
    if (window.SOCIALBROWSER || !document.location.protocol.like('*http*')) {
      return false;
    }
    site.update();
  });

  window.site = site;
})(window, document, 'undefined', jQuery);
