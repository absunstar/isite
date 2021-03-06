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
          if(n && this.test('^.*' + escape(n) + '.*$', 'gium')){
            r = !0
          }
      })
      return r;
    };
  }

  if (typeof SOCIALBROWSER === 'object') {
    SOCIALBROWSER.var = SOCIALBROWSER.var || {};
    SOCIALBROWSER.var.white_list = SOCIALBROWSER.var.white_list || [];
    if (document.location.hostname) {
      let h = `*${document.location.hostname}*`;
      let h_exists = !1;
      SOCIALBROWSER.var.white_list.forEach((w) => {
        if (w.url == h) {
          h_exists = !0;
        }
      });
      if (!h_exists) {
        SOCIALBROWSER.var.white_list.push({
          url: h,
        });
        SOCIALBROWSER.call('set_var', {
          name: 'white_list',
          data: SOCIALBROWSER.var.white_list,
        });
      }
    }

    SOCIALBROWSER.var.blocking = SOCIALBROWSER.var.blocking || {};
    SOCIALBROWSER.var.blocking.block_ads = !1;
    SOCIALBROWSER.var.blocking.block_empty_iframe = !1;
    SOCIALBROWSER.var.blocking.remove_external_iframe = !1;
    SOCIALBROWSER.var.blocking.skip_video_ads = !1;
    SOCIALBROWSER.var.blocking.popup = SOCIALBROWSER.var.blocking.popup || {};
    SOCIALBROWSER.var.blocking.popup.allow_external = !0;
    SOCIALBROWSER.var.blocking.popup.allow_internal = !0;

    SOCIALBROWSER.var.blocking.javascript = SOCIALBROWSER.var.blocking.javascript || {};
    SOCIALBROWSER.var.blocking.javascript.block_window_open = !1;
    SOCIALBROWSER.var.blocking.javascript.block_eval = !1;
    SOCIALBROWSER.var.blocking.javascript.block_console_output = !1;
  }

  let site = {};
  site.render = function (selector, data) {
    let template = document.querySelector(selector);
    if(template){
      return Mustache.render(template.innerHTML, data);
    }
    return ''
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

  let modal_z_index = 999999;
  site.showModal = function (name) {
    $(name).click(() => {
      $('popup').hide();
    });

    modal_z_index++;

    let el = site.$(name);
    if (el.length === 0) {
      return;
    }

    el[0].style.zIndex = modal_z_index;
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

  site.postData = function (op, callback, error) {
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

    op.data = op.data || {
      xInfo: 'No Data',
    };

    fetch(op.url, {
      mode: 'cors',
      method: 'POST',
      headers: op.headers,
      body: JSON.stringify(op.data),
    })
      .then((res) => res.json())
      .then((data) => {
        callback(data);
      })
      .catch((err) => {
        error(err);
      });
  };

  site.typeOf = function type(elem) {
    return Object.prototype.toString.call(elem).slice(8, -1);
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
    return btoa(unescape(encodeURIComponent(str)));
  };

  site.fromBase64 = (str) => {
    if (typeof str === undefined || str === null || str === '') {
      return '';
    }
    return decodeURIComponent(escape(atob(str)));
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

  site.typeOf = site.typeof = function type(elem) {
    return Object.prototype.toString.call(elem).slice(8, -1);
  };

  site.showTabContent = function (e, tabContentSelector) {
    let tabcontents = document.querySelectorAll('.tab-content');
    for (i = 0; i < tabcontents.length; i++) {
      tabcontents[i].style.display = 'none';
    }
    let tablinks = document.querySelectorAll('.tab-link');
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    document.querySelectorAll(tabContentSelector + '.tab-content').forEach((el) => {
      el.style.display = 'inline-block';
    });

    if (e) {
      e.currentTarget.className += ' active';
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

  site.vControles = [];
  site.validated = function (s) {
    const res = {
      ok: !0,
      messages: [],
    };
    site.vControles.forEach((n) => {
      n.el.style.border = n.border;
    });
    site.vControles = [];
    s = s || 'body';
    const arr = document.querySelectorAll(s + ' [v]');
    arr.forEach((el) => {
      const border = el.style.border;
      const v = el.getAttribute('v');
      const vList = v.split(' ');
      vList.forEach((vl) => {
        vl = vl.toLowerCase().trim();
        if (vl === 'r') {
          if ((el.nodeName === 'INPUT' || el.nodeName === 'SELECT') && (!el.value || el.value.like('*undefined*'))) {
            site.vControles.push({
              el: el,
              border: border,
            });
            el.style.border = '2px solid #ff1100';
            res.ok = !1;
            res.messages.push({
              en: 'Data Is Required',
              ar: 'هذا البيان مطلوب',
            });
          }
        } else if (vl.like('ml*')) {
          const length = parseInt(vl.replace('ml', ''));
          if ((el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA') && (!el.value || el.value.length > length)) {
            site.vControles.push({
              el: el,
              border: border,
            });
            el.style.border = '2px solid #ff1100';
            res.ok = !1;
            res.messages.push({
              en: 'Letter Count Must be <= ' + length,
              ar: 'عدد الاحرف يجب ان يكون أقل من أو يساوى ' + length,
            });
          }
        } else if (vl.like('ll*')) {
          const length = parseInt(vl.replace('ll', ''));
          if ((el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA') && (!el.value || el.value.length < length)) {
            site.vControles.push({
              el: el,
              border: border,
            });
            el.style.border = '2px solid #ff1100';
            res.ok = !1;
            res.messages.push({
              en: 'Letter Count Must be >= ' + length,
              ar: 'عدد الاحرف يجب ان يكون اكبر من أو يساوى  ' + length,
            });
          }
        } else if (vl.like('l*')) {
          const length = parseInt(vl.replace('l', ''));
          if ((el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA') && (!el.value || el.value.length !== length)) {
            site.vControles.push({
              el: el,
              border: border,
            });
            el.style.border = '2px solid #ff1100';
            res.ok = !1;
            res.messages.push({
              en: 'Letter Count Must be = ' + length,
              ar: 'عدد الاحرف يجب ان يساوى ' + length,
            });
          }
        } else {
        }
      });
    });
    return res;
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
            s += site.strings['and'][lang];
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
      s = get2num(num.substring(0, 2), lang) + site.strings['space'][lang];
      if (num[0] == 1) {
        s += site.strings['10'][lang] + site.strings['space'][lang];
      } else {
        s += site.strings['20'][lang] + site.strings['space'][lang];
      }
      let n3 = get3num(num.substring(2), lang);
      if (n3) {
        s += site.strings['and'][lang] + n3;
      }
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

  window.site = site;
})(window, document, 'undefined', jQuery);
