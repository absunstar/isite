
(function (window, document, undefined) {

  String.prototype.like = function matchRuleShort(rule) {
    return new RegExp("^" + rule.split("*").join(".*") + "$").test(this);
  };

  String.prototype.contains = function (name) {
    return this.like('*' + name + '*');
  };

  let site = {};

  site.typeOf = function type(elem) {
    return Object.prototype.toString.call(elem).slice(8, -1);
  };

  site.toDateTime = function (_any) {
    if(!_any)return new Date();
    return new Date(_any);
  };

  site.toDateX = function (_any) {
    let d = site.toDateTime(_any)
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
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() , 0 , 0 , 0, 0);
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

  site.toHtmlTable = function (obj) {
    if (obj === undefined || obj === null) {
      return '';
    }
    if (site.typeOf(obj) == 'Object') {
      let table = '<table class="table">';
      for (let index = 0; index < Object.getOwnPropertyNames(obj).length; index++) {
        let p = Object.getOwnPropertyNames(obj)[index];
        table += '<tr>';
        table += `<td> ${p} </td>`;
        if (site.typeOf(obj[p]) == 'Object' || site.typeOf(obj[p]) == 'Array') {
          table += `<td> ${site.toHtmlTable(obj[p])} </td>`;
        } else {
          table += `<td> ${obj[p]} </td>`;
        }

        table += '</tr>';
      }
      table += '</table>';
      return table;
    } else if (site.typeOf(obj) == 'Array') {
      let table = '<table class="table">';
      for (let i = 0; i < obj.length; i++) {
        if (site.typeOf(obj[i]) == 'Object' || site.typeOf(obj[i]) == 'Array') {
          table += `<tr><td>${site.toHtmlTable(obj[i])}</td></tr>`;
        } else {
          table += `<tr><td>${obj[i]}</td></tr>`;
        }
      }
      table += '</table>';
      return table;
    }
    return ''
  };

  site.vControles = [];
  site.validated = function (s) {
    const res = { ok: true, messages: [] };
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

  site.printDefaultCss = '';

  site.print = site.printHTML = function (options) {

    options = options || {};

    if (typeof options === 'string') {
      options = { select: options };
    }

    var mywindow = window.open('', '_blank', '');

    var content = '';
    window.document.querySelectorAll('link[rel=stylesheet]').forEach(l => {
      content += l.outerHTML;
    });

    window.document.querySelectorAll('style').forEach(s => {
      content += s.outerHTML;
    });


    if (options.links) {
      options.links.forEach(link => {
        content += '<link rel="stylesheet" href="' + link + '" type="text/css" >';
      });
    }

    content += '<style>' + site.printDefaultCss  +'</style>';

    content += window.document.querySelector(options.select).outerHTML;

    mywindow.document.open();
    mywindow.document.write(content);
    mywindow.document.close();

    mywindow.document.querySelector('body').style.margin = '0px';
    mywindow.document.querySelector('body').style.padding = '5px';
    mywindow.document.querySelector('body').contentEditable = true;
    mywindow.document.querySelector('body').className = 'center';
    let arr = options.ignores || ['.not-print'];
    arr.push('.not-print');
    arr.forEach(n => {
      mywindow.document.querySelectorAll(n).forEach(ele => {
        ele.remove();
      });

    });

    mywindow.focus();
    mywindow.setTimeout(() => {
      mywindow.print();
    }, 1000);

    return true;
  }


  window.site = site;
})(window, document, 'undefined');