(function (window, document, undefined) {
  let site = {}
  site.$base64Letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  site.$base64Numbers = [];
  for (let $i = 11; $i < 99; $i++) {
    if ($i % 10 !== 0 && $i % 11 !== 0) {
      site.$base64Numbers.push($i);
    }
  }

  site.toJson = obj =>{
    if (typeof obj === undefined || obj === null) {
      return "";
    }
    return JSON.stringify(obj);
  }
  site.fromJson = str =>{
    if (typeof str !== "string") {
      return str;
    }
    return JSON.parse(str);
  }

  site.toBase64 = str => {
    if(typeof str === undefined || str === null || str === ''){
      return '';
    }
    if(typeof str !== 'string'){
      str = site.toJson(str);
    }
    return btoa(unescape(encodeURIComponent(str)));
  };

  site.fromBase64 = str => {
    if(typeof str === undefined || str === null || str === ''){
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
  }

  site.toHtmlTable = function (obj) {
    if (obj === undefined || obj === null) {
      return '';
    }
    if(site.typeOf(obj) == 'Object'){
      let table = '<table class="table">';
      for (let index = 0; index < Object.getOwnPropertyNames(obj).length; index++) {
        let p = Object.getOwnPropertyNames(obj)[index];
        table += '<tr>';
        table += `<td> ${p} </td>`;
        if(site.typeOf(obj[p]) == 'Object' || site.typeOf(obj[p]) == 'Array'){
          table += `<td> ${site.toHtmlTable(obj[p])} </td>`;
        }else{
          table += `<td> ${obj[p]} </td>`;
        }
        
        table += '</tr>';
      }
      table += '</table>';
      return table;
    }else if(site.typeOf(obj) == 'Array'){
      let table = '<table class="table">';
        for (let i = 0; i < obj.length; i++) {
          if(site.typeOf(obj[i]) == 'Object' || site.typeOf(obj[i]) == 'Array'  ){
            table += `<tr><td>${site.toHtmlTable(obj[i])}</td></tr>`;
          }else{
            table += `<tr><td>${obj[i]}</td></tr>`;
          }
        }
      table += '</table>';
      return table;
    }
    return ''
  }

  window.site = site;
})(window, document, 'undefined');