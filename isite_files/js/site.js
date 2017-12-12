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
    if (typeof data !== "string") {
      return "";
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

  window.site = site;
})(window, document, 'undefined');