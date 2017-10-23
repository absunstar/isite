module.exports = function init(req, res, site) {
  let cookie = function(key, value, options) {
    if ((key, value)) {
      return cookie.set(key, value, options)
    } else {
      return cookie.get(key)
    }
  }

  cookie.parse = cookie => {
    if (typeof cookie === "undefined") return []
    return cookie.split(";").reduce(function(prev, curr) {
      let m = / *([^=]+)=(.*)/.exec(curr)
      if (m) {
        let key = m[1]
        let value = decodeURIComponent(m[2])
        prev[key] = value
      }
      return prev
    }, {})
  }

  cookie.stringify = cookies => {

    if (cookies.length === 0) {
      return null
    }
    for (let i = 0; i < cookies.length; i++) {
      let co = cookies[i]
      if (cookie.obj[co.key] === co.value) {
        co = null
        continue
      }

      if (co == null) continue
      let out = ""

      out +=
        co.key +
        "=" +
        encodeURIComponent(co.value) +
        ";path=" +
        co.options.path +
        "; expires=" +
        new Date(new Date().getTime() + 1000 * 60 * co.options.expires).toUTCString()

      return out
    }
    return null
  }

  cookie.obj = cookie.parse(req.headers.cookie)
  cookie.newList = []
  cookie.write = () => {
    let data = cookie.stringify(cookie.newList)
    if (data) {
      res.setHeader("Set-Cookie", data)
    }
  }

  cookie.set = function(key, value, _options) {
    let options = Object.assign(
      {
        expires: site.options.session.timeout,
        path: "/"
      },
      _options
    )

    cookie.newList.push({
      key: key,
      value: value,
      options: options
    })
  }

  cookie.get = function(key) {
    let value = cookie.obj[key]
    if (typeof value == "undefined") {
      return null
    }
    return value
  }

  return cookie
}
