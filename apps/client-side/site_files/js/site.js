(function (window, document, undefined) {

  String.prototype.like = function matchRuleShort(rule) {
    return new RegExp("^" + rule.split("*").join(".*") + "$").test(this);
  };

  String.prototype.contains = function (name) {
    return this.like('*' + name + '*');
  };

  let site = {};

  site.$ = function (name) {
    let arr = document.querySelectorAll(name)
    return arr;
  };

  let modal_z_index = 2000;
  site.showModal = function (name) {

    $(name).click(() => {
      $('popup').hide();
    });

    modal_z_index++;

    let el = site.$(name)
    if (el.length === 0) {
      return;
    }

    el[0].style.zIndex = modal_z_index;
    el[0].style.display = 'block';
    let fixed = el[0].getAttribute('fixed');

    if (fixed !== '') {
      el[0].addEventListener("click", function () {
        site.hideModal(name);
      });
    }


    let inputs = site.$(name + ' input');
    if (inputs.length > 0) {
      inputs[0].focus();
    }

    site.$(name + ' .close').forEach(cl => {
      cl.addEventListener("click", function () {
        site.hideModal(name);
      });
    });

    site.$(name + ' .modal-header').forEach(he => {
      he.addEventListener("click", function (event) {
        event = event || window.event;
        event.stopPropagation();
      });
    });

    site.$(name + ' .modal-body').forEach(bo => {
      bo.addEventListener("click", function (event) {
        event = event || window.event;
        event.stopPropagation();
      });
    });

    site.$(name + ' .modal-footer').forEach(fo => {
      fo.addEventListener("click", function (event) {
        event = event || window.event;
        event.stopPropagation();
      });
    });

  };

  site.hideModal = function (name) {
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
      callback: callback
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

  site.getData = function (op, callback, error) {
    callback = callback || function () {};
    error = error || function () {};

    if (typeof op === 'string') {
      op = {
        url: op
      }
    }


    op.headers = op.headers || {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }

    fetch(op.url, {
        mode: 'cors',
        method: 'get',
        headers: op.headers
      })
      .then(res => res.json())
      .then((data) => {
        callback(data)
      }).catch(err => {
        error(err)
      });
  };

  site.getContent = function (op, callback, error) {

    callback = callback || function () {};
    error = error || function () {};

    if (typeof op === 'string') {
      op = {
        url: op
      }
    }

    fetch(op.url, {
      mode: 'cors',
      method: 'get'
    }).then(function (res) {
      return res.text();
    }).then(function (content) {
      callback(content);
    });
  };



  site.postData = function (op, callback, error) {
    callback = callback || function () {};
    error = error || function () {};

    if (typeof op === 'string') {
      op = {
        url: op
      };
    }


    op.headers = op.headers || {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    op.data = op.data || {
      xInfo: 'No Data'
    };

    fetch(op.url, {
        mode: 'cors',
        method: 'POST',
        headers: op.headers,
        body: JSON.stringify(op.data)
      })
      .then(res => res.json())
      .then((data) => {
        callback(data);
      }).catch(err => {
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
  }

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


  site.toNumber = function (_num) {
    if (_num) {
      return parseFloat(_num);
    }
    return 0;
  };

  site.$base64Letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  site.$base64Numbers = [];
  for (let $i = 11; $i < 99; $i++) {
    if ($i % 10 !== 0 && $i % 11 !== 0) {
      site.$base64Numbers.push($i);
    }
  }


  site.toJson = obj => {
    if (typeof obj === undefined || obj === null) {
      return "";
    }
    return JSON.stringify(obj);
  };

  site.fromJson = str => {
    if (typeof str !== "string") {
      return str;
    }
    return JSON.parse(str);
  };

  site.toBase64 = str => {
    if (typeof str === undefined || str === null || str === '') {
      return '';
    }
    if (typeof str !== 'string') {
      str = site.toJson(str);
    }
    return btoa(unescape(encodeURIComponent(str)));
  };

  site.fromBase64 = str => {
    if (typeof str === undefined || str === null || str === '') {
      return '';
    }
    return decodeURIComponent(escape(atob(str)));
  };

  site.to123 = data => {
    data = site.toBase64(data);
    let newData = "";
    for (let i = 0; i < data.length; i++) {
      let letter = data[i];
      newData += site.$base64Numbers[site.$base64Letter.indexOf(letter)];
    }
    return newData;
  };

  site.from123 = data => {
    let newData = "";
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

    let tabcontents = document.querySelectorAll(".tab-content");
    for (i = 0; i < tabcontents.length; i++) {
      tabcontents[i].style.display = 'none'
    }
    let tablinks = document.querySelectorAll(".tab-link");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.querySelectorAll(tabContentSelector + '.tab-content').forEach(el => {
      el.style.display = 'inline-block';
    });

    if (e) {
      e.currentTarget.className += " active";
    }
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
      ok: true,
      messages: []
    };
    site.vControles.forEach(n => {
      n.el.style.border = n.border;
    });
    site.vControles = [];
    s = s || 'body';
    const arr = document.querySelectorAll(s + ' [v]');
    arr.forEach(el => {
      const border = el.style.border;
      const v = el.getAttribute('v');
      const vList = v.split(' ');
      vList.forEach(vl => {
        vl = vl.toLowerCase().trim();
        if (vl === 'r') {
          if ((el.nodeName === 'INPUT' || el.nodeName === 'SELECT') && (!el.value || el.value.like('*undefined*'))) {
            site.vControles.push({
              el: el,
              border: border
            });
            el.style.border = '2px solid #ff1100';
            res.ok = false;
            res.messages.push({
              en: 'Data Is Required',
              ar: 'هذا البيان مطلوب'
            });
          }
        } else if (vl.like('ml*')) {
          const length = parseInt(vl.replace('ml', ''));
          if ((el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA') && (!el.value || el.value.length > length)) {
            site.vControles.push({
              el: el,
              border: border
            });
            el.style.border = '2px solid #ff1100';
            res.ok = false;
            res.messages.push({
              en: 'Letter Count Must be <= ' + length,
              ar: 'عدد الاحرف يجب ان يكون أقل من أو يساوى ' + length
            });
          }
        } else if (vl.like('ll*')) {
          const length = parseInt(vl.replace('ll', ''));
          if ((el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA') && (!el.value || el.value.length < length)) {
            site.vControles.push({
              el: el,
              border: border
            });
            el.style.border = '2px solid #ff1100';
            res.ok = false;
            res.messages.push({
              en: 'Letter Count Must be >= ' + length,
              ar: 'عدد الاحرف يجب ان يكون اكبر من أو يساوى  ' + length
            });
          }
        } else if (vl.like('l*')) {
          const length = parseInt(vl.replace('l', ''));
          if ((el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA') && (!el.value || el.value.length !== length)) {
            site.vControles.push({
              el: el,
              border: border
            });
            el.style.border = '2px solid #ff1100';
            res.ok = false;
            res.messages.push({
              en: 'Letter Count Must be = ' + length,
              ar: 'عدد الاحرف يجب ان يساوى ' + length
            });
          }
        } else {

        }
      });
    });
    return res;
  };


  window.site = site;

})(window, document, 'undefined');