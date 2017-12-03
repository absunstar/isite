;
(function (window, document, undefined) {
  let site = {}
  site.$base64Letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  site.$base64Numbers = []
  for (let $i = 11; $i < 99; $i++) {
    if ($i % 10 !== 0 && $i % 11 !== 0) {
      site.$base64Numbers.push($i)
    }
  }

  site.toBase64 = data => {
    if (typeof data === undefined) {
      return ""
    }
    if (typeof data === "object") {
      data = JSON.stringify(data)
    }

    return btoa(unescape(encodeURIComponent(data)))

  }
  site.fromBase64 = data => {
    if (typeof data !== "string") {
      return ""
    }
    return decodeURIComponent(escape(atob(data)));

  }

  site.to123 = data => {
    data = site.toBase64(data)
    let newData = ""

    for (let i = 0; i < data.length; i++) {
      let letter = data[i]
      newData += site.$base64Numbers[site.$base64Letter.indexOf(letter)]
    }

    return newData
  }
  site.from123 = data => {
    let newData = ""
    for (let i = 0; i < data.length; i++) {
      let num = data[i] + data[i + 1]
      let index = site.$base64Numbers.indexOf(parseInt(num))
      newData += site.$base64Letter[index]
      i++
    }
    newData = site.fromBase64(newData)

    return newData
  }

  window.site = site
})(window, document, 'undefined')