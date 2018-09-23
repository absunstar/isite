module.exports = function init(req, res, site, route) {

  let parser = {}

  function renderVar(v) {
    return site.var(v)
  }

  function renderParam(v) {
    if (typeof req.params[v] !== undefined) {
      return req.params[v]
    }

    return " "
  }

  function renderQuery(v) {
    if (typeof req.query[v] !== undefined) {
      return req.query[v]
    }
    return " "
  }

  function renderData(v) {

    if (typeof req.data[v] !== undefined) {
      return req.data[v]
    }
    return null
  }

  function renderUser(v) {
    let user = req.session.user
    if (user) {
      if (v == "email") {
        return req.session.user.email
      } else if (v == "name") {
        if (req.session.user.profile) {
          return req.session.user.profile.name || req.session.user.email
        }
        return req.session.user.email
      } else if (v == "id") {
        return req.session.user._id
      } else if (v == "_id") {
        return req.session.user._id
      } else {
        return ""
      }
    }

    return ""
  }

  function renderSession(v) {
    if (v == "lang") {
      return req.session.lang
    } else if (v == "theme") {
      return req.session.theme
    } else {
      return req.session.get(v)
    }
  }

  function renderJson(name) {
    return site.readFileSync(route.parserDir + "/json/" + name + ".json")
  }

  function renderWord(name) {
    for (let i = 0; i < site.words.list.length; i++) {
      let w = site.words.list[i]
      if (w.name == name) {
        return w[req.session.lang]
      }
    }
  }

  function renderSetting(name) {
    return site.setting.get(name).value
  }

  function getContent(name) {
    let path = site.path.join(route.parserDir, site.path.extname(name).replace('.', ''), name)

    if (!site.isFileExistsSync(path)) {
      let arr = name.split('/')
      if (arr.length === 2) {
        path = site.path.join(site.path.dirname(route.parserDir), 'apps', arr[0], 'site_files', site.path.extname(arr[1]).replace('.', ''), arr[1])
      } else if (arr.length === 3) {
        path = site.path.join(site.path.dirname(route.parserDir), 'apps', arr[0], 'site_files', site.path.extname(arr[2]).replace('.', '') , arr[1], arr[2])
      }
    }


    if (!site.isFileExistsSync(path)) {
      let arr = name.split('/')
      if (arr.length > 1) {
        site.apps.forEach(ap => {
          if (arr.length === 2 && ap.name == arr[0]) {
            path = site.path.join(ap.path, 'site_files', site.path.extname(arr[1]).replace('.', ''), arr[1])
          }else if (arr.length === 3 && ap.name == arr[0]) {
            path = site.path.join(ap.path, 'site_files', site.path.extname(arr[2]).replace('.', ''), arr[1] , arr[2])
          }
        })
      }
    }

    if (!site.isFileExistsSync(path)) {
      site.log(path, 'PATH NOT EXISTS')
      return ''

    }

    if (name.endsWith(".html")) {
      let txt = site.readFileSync(path)
      let $ = site.$.load(txt)
      $ = renderHtml($)
      return $.html()
    } else {
      let txt = site.readFileSync(path)
      return txt
    }
  }

  function renderHtml($) {

    $("[x-setting]").each(function (i, elem) {
      if (!site.setting.get($(this).attr("x-setting")).value) {
        $(this).remove()
      }
    })


    $("[x-permission]").each(function (i, elem) {
      if (!site.security.isUserHasPermission(req, res, $(this).attr("x-permission"))) {
        $(this).remove()
      }
    })

    $("[x-role]").each(function (i, elem) {
      if (!site.security.isUserHasRole(req, res, $(this).attr("x-role"))) {
        $(this).remove()
      }
    })

    $("[x-permissions]").each(function (i, elem) {
      if (!site.security.isUserHasPermissions(req, res, $(this).attr("x-permissions"))) {
        $(this).remove()
      }
    })

    $("[x-roles]").each(function (i, elem) {
      if (!site.security.isUserHasRole(req, res, $(this).attr("x-roles"))) {
        $(this).remove()
      }
    })

    $("[x-import]").each(function (i, elem) {
      $(this).html(getContent($(this).attr("x-import")))
    })

    $("[x-lang]").each(function (i, elem) {
      if ($(this).attr("x-lang") !== req.session.lang) {
        $(this).remove()
      }
    })

    $("[x-feature]").each(function (i, elem) {
      let f = $(this).attr("x-feature")
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
    })

    $("[x-features]").each(function (i, elem) {
      let f = $(this).attr("x-features")
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

    return $
  }

  parser.html = function (content) {
    let $ = site.$.load(content)
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

  return parser
}