module.exports = function init(req, res, site) {

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

    function getContent(name){
        if(name.endsWith('.html')){
          return site.readFileSync(site.dir + '/html/' + name)
        }
        return 'Content Of : ' + name
    }

    function renderHtml($) {
        $('[x-permission]').remove()
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
        for (var i = 0; i < matches.length; i++) {
            let v = matches[i]

            if (v.startsWith('##var.')) {
                v = v.replace('##var.', '').replace('##', '')

                txt = txt.replace(matches[i], renderVar(v))
            }

        }
        return txt
    }

    return parser
}