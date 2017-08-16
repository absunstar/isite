module.exports = function init(req, res, site, route) {

    let cheerio = require('cheerio');
    let parser = {}

    function renderVar(v) {
        for (var i = 0; i < site.vars.length; i++) {
            var obj = site.vars[i]
            if (obj.key == v) {
                return obj.value
            }

        }
        return ' !xxx! '
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
        });
        $('[x-import]').each(function (i, elem) {
            $(this).html(getContent($(this).attr('x-import')))
        });
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
                }
            }
        }

        return txt
    }

    return parser
}