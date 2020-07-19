module.exports = function init(req, res, _p_, route) {

  let parser = {}

  function renderVar(v) {
    if (v && v == "*") {
      return JSON.stringify(_p_.var)
    }
    return _p_.var(v)
  }

  function renderParam(v) {
    if (typeof req.paramsRaw[v] !== undefined) {
      if (v && v == "*") {
        return JSON.stringify(req.paramsRaw)
      }
      return req.paramsRaw[v]
    }

    return " "
  }

  function renderQuery(v) {
    if (typeof req.queryRaw[v] !== undefined) {
      if (v && v == "*") {
        return JSON.stringify(req.queryRaw)
      }
      return req.queryRaw[v]
    }
    return " "
  }

  function renderData(d) {
    let out = null

    if (d && d == "*") {
      out = JSON.stringify(req.data)
    } else if (d) {
      v = d.split('.')

      if (v.length > 0) {
        out = req.data[v[0]]
      }

      if (v.length > 1 && out) {
        out = out[v[1]]
      }

      if (v.length > 2 && out) {
        out = out[v[2]]
      }

      if (v.length > 3 && out) {
        out = out[v[3]]
      }

      if (v.length > 4 && out) {
        out = out[v[4]]
      }

      if (v.length > 5 && out) {
        out = out[v[5]]
      }

    }
    if (out && typeof out == "object") {
      out = JSON.stringify(out)
    }
    return out || renderWord(d)

  }

  function renderUser(v) {
    let user = req.session.user
    if (user) {
      if (v && v == "*") {
        return JSON.stringify(user)
      } else if (v == "email") {
        return user.email
      } else if (v == "name") {
        if (user.profile) {
          return user.profile.name || user.email
        }
        return user.email
      } else if (v == "id") {
        return user.id
      } else if (v == "_id") {
        return user._id
      } else {
        let out = ''
        if (v) {
          v = v.split('.')

          if (v.length > 0) {
            out = user[v[0]]
          }

          if (v.length > 1 && out) {
            out = out[v[1]]
          }

          if (v.length > 2 && out) {
            out = out[v[2]]
          }

          if (v.length > 3 && out) {
            out = out[v[3]]
          }

          if (v.length > 4 && out) {
            out = out[v[4]]
          }

          if (v.length > 5 && out) {
            out = out[v[5]]
          }

        }

        if (typeof out === 'object') {
          out = _p_.toJson(out)
        }

        return out

      }
    }

    return ""
  }

  function render_site(v) {
    if (v && v == "*") {
      return JSON.stringify(_p_)
    }
    let out = ''
    if (v) {
      v = v.split('.')

      if (v.length > 0) {
        out = _p_[v[0]]
      }

      if (v.length > 1 && out) {
        out = out[v[1]]
      }

      if (v.length > 2 && out) {
        out = out[v[2]]
      }

      if (v.length > 3 && out) {
        out = out[v[3]]
      }

      if (v.length > 4 && out) {
        out = out[v[4]]
      }

      if (v.length > 5 && out) {
        out = out[v[5]]
      }

    }

    if (typeof out === 'object') {
      out = _p_.toJson(out)
    }

    return out

  }

  function render_req(v) {
    if (v && v == "*") {
      return JSON.stringify(req)
    }
    let out = ''
    if (v) {
      v = v.split('.')

      if (v.length > 0) {
        out = req[v[0]]
      }

      if (v.length > 1 && out) {
        out = out[v[1]]
      }

      if (v.length > 2 && out) {
        out = out[v[2]]
      }

      if (v.length > 3 && out) {
        out = out[v[3]]
      }

      if (v.length > 4 && out) {
        out = out[v[4]]
      }

      if (v.length > 5 && out) {
        out = out[v[5]]
      }

    }

    if (typeof out === 'object') {
      out = _p_.toJson(out)
    }

    return out

  }

  function renderSession(v) {
    if (v && v == "*") {
      return JSON.stringify({
        accessToken: req.session.accessToken,
        createdTime: req.session.createdTime,
        modifiedTime: req.session.modifiedTime,
        data: req.session.data,
        ip: req.session.ip,
        requestesCount: req.session.requestesCount,
        busy: req.session.busy,
        ip_info: req.session.ip_info
      })
    }
    if (v == "lang") {
      return req.session.lang
    } else if (v == "theme") {
      return req.session.theme
    } else {
      return req.session.get(v)
    }
  }

  function renderJson(name) {
    return _p_.readFileSync(route.parserDir + "/json/" + name + ".json")
  }

  function renderWord(name) {
    for (let i = 0; i < _p_.words.list.length; i++) {
      let w = _p_.words.list[i]
      if (w.name == name) {
        return w[req.session.lang]
      }
    }
  }

  function renderSetting(v) {
    if (v && v == "*") {
      return JSON.stringify(_p_.setting.list)
    }
    return _p_.setting.get(v).value
  }

  function getContent(name) {
    let path = _p_.path.join(route.parserDir, _p_.path.extname(name).replace('.', ''), name)

    if (!_p_.isFileExistsSync(path)) {
      let arr = name.split('/')
      if (arr.length === 2) {
        path = _p_.path.join(_p_.path.dirname(route.parserDir), 'apps', arr[0], 'site_files', _p_.path.extname(arr[1]).replace('.', ''), arr[1])
      } else if (arr.length === 3) {
        path = _p_.path.join(_p_.path.dirname(route.parserDir), 'apps', arr[0], 'site_files', _p_.path.extname(arr[2]).replace('.', ''), arr[1], arr[2])
      }
    }


    if (!_p_.isFileExistsSync(path)) {
      let arr = name.split('/')
      if (arr.length > 1) {
        _p_.apps.forEach(ap => {
          if (arr.length === 2 && ap.name == arr[0]) {
            path = _p_.path.join(ap.path, 'site_files', _p_.path.extname(arr[1]).replace('.', ''), arr[1])
          } else if (arr.length === 2 && ap.name2 == arr[0]) {
            path = _p_.path.join(ap.path, 'site_files', _p_.path.extname(arr[1]).replace('.', ''), arr[1])
          } else if (arr.length === 3 && ap.name == arr[0]) {
            path = _p_.path.join(ap.path, 'site_files', _p_.path.extname(arr[2]).replace('.', ''), arr[1], arr[2])
          }
        })
      }
    }

    if (!_p_.isFileExistsSync(path)) {
      _p_.log(path, 'PATH NOT EXISTS')
      return ''

    }

    if (name.endsWith(".html")) {
      let txt = _p_.readFileSync(path)
      let $ = _p_.$.load(txt)
      $ = renderHtml($)
      return $.html()
    }else if (name.endsWith(".js")) {
      let txt = _p_.readFileSync(path)
      txt = parser.js(txt)
      return txt
    }else if (name.endsWith(".css")) {
      let txt = _p_.readFileSync(path)
      txt = parser.css(txt)
      return txt
    } else {
      let txt = _p_.readFileSync(path)
      return txt
    }

  
  }

  function renderHtml($) {

    $("[x-setting]").each(function (i, elem) {
      if (!_p_.setting.get($(this).attr("x-setting")).value) {
        $(this).remove()
      }
    })


    $("[x-permission]").each(function (i, elem) {
      if (!_p_.security.isUserHasPermission(req, res, $(this).attr("x-permission"))) {
        $(this).remove()
      }
    })

    $("[x-role]").each(function (i, elem) {
      if (!_p_.security.isUserHasRole(req, res, $(this).attr("x-role"))) {
        $(this).remove()
      }
    })

    $("[x-permissions]").each(function (i, elem) {
      if (!_p_.security.isUserHasPermissions(req, res, $(this).attr("x-permissions"))) {
        $(this).remove()
      }
    })

    $("[x-roles]").each(function (i, elem) {
      if (!_p_.security.isUserHasRoles(req, res, $(this).attr("x-roles"))) {
        $(this).remove()
      }
    })



    $("[x-lang]").each(function (i, elem) {
      if ($(this).attr("x-lang") !== req.session.lang) {
        $(this).remove()
      }
    })

    $("[x-feature]").each(function (i, elem) {
      let f = $(this).attr("x-feature")
      let not = false
      if (f.startsWith('!')) {
        f = f.replace('!', '')
        not = true
      }
      if (req.features.indexOf(f.toLowerCase()) === -1 && !not) {
        $(this).remove()
      }
      if (req.features.indexOf(f.toLowerCase()) !== -1 && not) {
        $(this).remove()
      }
    })

    $("[x-features]").each(function (i, elem) {
      let fs = $(this).attr("x-features")
      if (fs.indexOf('||') > -1) {
        let del = true
        fs.split('||').forEach(f => {
          f = f.trim()
          let not = false
          if (f.startsWith('!')) {
            f = f.replace('!', '')
            not = true
          }
          if (req.features.indexOf(f.toLowerCase()) > -1 && !not) {
            del = false
          }
          if (req.features.indexOf(f.toLowerCase()) < 0 && not) {
            del = false
          }
        })

        if (del) {
          $(this).remove()
        }

      } else if (fs.indexOf('&&') > -1) {
        let true_list = []
        fs.split('&&').forEach(f => {
          f = f.trim()
          let d = true
          if (f.startsWith('!')) {
            f = f.replace('!', '')
            d = false
          }
          if (req.features.indexOf(f.toLowerCase()) === -1 && !d) {
            true_list.push({})
          }
          if (req.features.indexOf(f.toLowerCase()) > -1 && d) {
            true_list.push({})
          }
        })
        if (true_list.length !== fs.split('&&').length) {
          $(this).remove()
        }
      } else {
        f = fs.trim()
        let d = true
        if (f.startsWith('!')) {
          f = f.replace('!', '')
          d = false
        }
        if (req.features.indexOf(f.toLowerCase()) === -1 && d) {
          $(this).remove()
        }
        if (req.features.indexOf(f.toLowerCase()) > -1 && !d) {
          $(this).remove()
        }
      }

    })

    if (route.parser.like("*css*")) {
      $("style").each(function (i, elem) {
        $(this).html(parser.css($(this).html()))
      })
    }

    if (route.parser.like("*js*")) {
      $("script").each(function (i, elem) {
        $(this).html(parser.js($(this).html()))
      })
    }

    $("[x-import]").each(function (i, elem) {
      $(this).html(getContent($(this).attr("x-import")) + $(this).html())
    })

    $("[x-append]").each(function (i, elem) {
      $(this).html($(this).html() + getContent($(this).attr("x-append")))
    })

    $("[x-replace]").each(function (i, elem) {
      $(this).html(getContent($(this).attr("x-replace")))
    })

    return $
  }

  parser.html = function (content) {
    let $ = _p_.$.load(content)
    $ = renderHtml($)
    let txt = $.html()

    let matches = $.html().match(/##.*?##/g)
    if (matches) {
      for (var i = 0; i < matches.length; i++) {
        let v = matches[i]

        if (v.startsWith("##var.")) {
          v = v.replace("##var.", "").replace("##", "")
          txt = txt.replace(matches[i], renderVar(v))
        } else if (v.startsWith("##user.")) {
          v = v.replace("##user.", "").replace("##", "")
          txt = txt.replace(matches[i], renderUser(v))
        } else if (v.startsWith("##site.")) {
          v = v.replace("##site.", "").replace("##", "")
          txt = txt.replace(matches[i], render_site(v))
        } else if (v.startsWith("##req.")) {
          v = v.replace("##req.", "").replace("##", "")
          txt = txt.replace(matches[i], render_req(v))
        } else if (v.startsWith("##session.")) {
          v = v.replace("##session.", "").replace("##", "")
          txt = txt.replace(matches[i], renderSession(v))
        } else if (v.startsWith("##json.")) {
          v = v.replace("##json.", "").replace("##", "")
          txt = txt.replace(matches[i], renderJson(v))
        } else if (v.startsWith("##word.")) {
          v = v.replace("##word.", "").replace("##", "")
          txt = txt.replace(matches[i], renderWord(v))
        } else if (v.startsWith("##setting.")) {
          v = v.replace("##setting.", "").replace("##", "")
          txt = txt.replace(matches[i], renderSetting(v))
        } else if (v.startsWith("##params.")) {
          v = v.replace("##params.", "").replace("##", "")
          txt = txt.replace(matches[i], renderParam(v))
        } else if (v.startsWith("##query.")) {
          v = v.replace("##query.", "").replace("##", "")
          txt = txt.replace(matches[i], renderQuery(v))
        } else if (v.startsWith("##data.")) {
          v = v.replace("##data.", "").replace("##", "")
          txt = txt.replace(matches[i], renderData(v))
        } else {}
      }
    }

    return txt
  }

  parser.css = function (content) {
    let matches = content.match(/var\(--.*?\)/g)
    if (matches) {
      for (var i = 0; i < matches.length; i++) {
        let v = matches[i]

        v = v.replace("var(--", "").replace(")", "")
        content = content.replace(matches[i], renderVar(v))
      }
    }

    let matches2 = content.match(/word\(--.*?\)/g)
    if (matches2) {
      for (var i = 0; i < matches2.length; i++) {
        let v = matches2[i]

        v = v.replace("word(--", "").replace(")", "")
        content = content.replace(matches2[i], renderWord(v))
      }
    }

    return content
  }

  parser.js = function (content) {
    let matches = content.match(/\/\*##.*?\*\//g);
    if (matches) {
      for (var i = 0; i < matches.length; i++) {
        let v = matches[i]
        v = v.replace("/*##", "").replace("*/", "")
        content = content.replace(matches[i], getContent(v))
      }
    }
    return content
  }

  parser.json = function (content) {
    return content
  }

  parser.renderHtml = renderHtml
  return parser
}