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

  function renderObj(v) {

    if (typeof req.obj[v] !== undefined) {
      return req.obj[v]
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

  function getContent(name) {
    let path = site.path.join(route.parserDir, site.path.extname(name).replace('.', ''), name)

    if (!site.isFileExistsSync(path)) {
      let arr = name.split('/')
      if (arr.length > 1) {
        path = site.path.join(site.path.dirname(route.parserDir), 'apps', arr[0], 'site_files', site.path.extname(arr[1]).replace('.', ''), arr[1])
      }
    }

    if (!site.isFileExistsSync(path)) {
      site.log(path, 'PATH NOT EXISTS')
      return " [ PATH NOT EXISTS : " + name + " ] "

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

    $("[x-permission]").each(function (i, elem) {
      if (!site.security.isUserHasPermission(req, res, $(this).attr("x-permission"))) {
        $(this).remove()
      }
    })

    $("[x-permissions]").each(function (i, elem) {
      if (!site.security.isUserHasPermission(req, res, $(this).attr("x-permissions"))) {
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
        } else if (v.startsWith("##params.")) {
          v = v.replace("##params.", "").replace("##", "")
          txt = txt.replace(matches[i], renderParam(v))
        } else if (v.startsWith("##query.")) {
          v = v.replace("##query.", "").replace("##", "")
          txt = txt.replace(matches[i], renderQuery(v))
        } else if (v.startsWith("##obj.")) {
          v = v.replace("##obj.", "").replace("##", "")
          txt = txt.replace(matches[i], renderObj(v))
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
    return content
  }

  parser.json = function (content) {
    return content
  }

  return parser
}