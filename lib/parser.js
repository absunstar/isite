module.exports = function init(req, res) {

    let cheerio = require('cheerio');
    let parser = {}

    function renderVar(v) {
        return 'renderd'
    }
    function renderHtml($) {
       $('[x-permission]').remove()
       return $
    }

    parser.html = function (content) {
        let vars = []
        let $ = cheerio.load(content);
        $ = renderHtml($)
        let txt = $.html()
        let matches = $.html().match(/##.*?##/g)
        for (var i = 0; i < matches.length; i++) {
            txt = txt.replace(matches[i], renderVar(matches[i]))
        }
        return txt
    }

    return parser
}