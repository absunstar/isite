module.exports = function init(req, res, site, route) {

    let cheerio = require('cheerio');
    let parser = {}

    function renderVar(v) {
        for (var i = 0; i < site.vars.length; i++) {
            var obj = site.vars[i]
            if (obj.name == v) {
                return obj.value
            }

        }
        return ' '
    }

    function renderUser(v) {
        let user = req.session.user
        if (user) {
            if (v == 'email') {
                return req.session.user.email
            }
        }

        return ' no user '
    }
    function renderJson(name) {
        return site.readFileSync(route.parserDir + '/json/' + name + '.json')
    }

    function renderWord(name) {
        for (let i = 0; i < site.words.length; i++) {
            let w = site.words[i];
            if (w.name == name) {
                if (req.session.lang == 'en') {
                    return w.en
                } else {
                    return w.ar
                }
            }

        }
    }

    function getContent(name) {

        if (name.endsWith('.html')) {
            let txt = site.readFileSync(route.parserDir + '/html/' + name)
            let $ = cheerio.load(txt)
            $ = renderHtml($)
            return $.html()
        } else if (name.endsWith('.css')) {
            let txt = site.readFileSync(route.parserDir + '/css/' + name)
            return txt
        } else if (name.endsWith('.js')) {
            let txt = site.readFileSync(route.parserDir + '/js/' + name)
            return txt
        } else if (name.endsWith('.json')) {
            let txt = site.readFileSync(route.parserDir + '/json/' + name)
            return txt
        } else if (name.endsWith('.xml')) {
            let txt = site.readFileSync(route.parserDir + '/xml/' + name)
            return txt
        } else {
            return 'Content Of : ' + name
        }

    }

    function renderHtml($) {

        $('[x-permission]').each(function (i, elem) {
            if (!site.security.isUserHasPermission(req, res, $(this).attr('x-permission'))) {
                $(this).remove()
            }
        })

        $('[x-import]').each(function (i, elem) {
            $(this).html(getContent($(this).attr('x-import')))
        })

        $('[x-lang]').each(function (i, elem) {
            if ($(this).attr('x-lang') !== req.session.lang) {
                $(this).remove()
            }
        })

        $('style').each(function (i, elem) {
            $(this).html(parser.css($(this).html()))
        })

        return $
    }

    parser.html = function (content) {
        let $ = cheerio.load(content);
        $ = renderHtml($)
        let txt = $.html()

        let matches = $.html().match(/##.*?##/g)
        if (matches) {
            for (var i = 0; i < matches.length; i++) {
                let v = matches[i]

                if (v.startsWith('##var.')) {
                    v = v.replace('##var.', '').replace('##', '')
                    txt = txt.replace(matches[i], renderVar(v))
                } else if (v.startsWith('##user.')) {
                    v = v.replace('##user.', '').replace('##', '')
                    txt = txt.replace(matches[i], renderUser(v))
                } else if (v.startsWith('##json.')) {
                    v = v.replace('##json.', '').replace('##', '')
                    txt = txt.replace(matches[i], renderJson(v))
                } else if (v.startsWith('##word.')) {
                    v = v.replace('##word.', '').replace('##', '')
                    txt = txt.replace(matches[i], renderWord(v))
                } else {

                }
            }
        }

        return txt
    }

    parser.css = function (content) {


        let matches = content.match(/var\(--.*?\)/g)
        if (matches) {
            for (var i = 0; i < matches.length; i++) {
                let v = matches[i]

                v = v.replace('var(--', '').replace(')', '')
                content = content.replace(matches[i], renderVar(v))

            }
        }


        let matches2 = content.match(/word\(--.*?\)/g)
        if (matches2) {
            for (var i = 0; i < matches2.length; i++) {
                let v = matches2[i]

                v = v.replace('word(--', '').replace(')', '')
                content = content.replace(matches2[i], renderWord(v))

            }
        }

        return content
    }

    return parser
}