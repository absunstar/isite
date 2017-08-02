function parseCookies(cookie) {
    if (typeof cookie === 'undefined') return [];
    return cookie.split(';').reduce(
        function(prev, curr) {
            let m = / *([^=]+)=(.*)/.exec(curr);
            let key = m[1];
            let value = decodeURIComponent(m[2]);
            prev[key] = value;
            return prev;
        }, {}
    );
}

function stringifyCookies(cookies, expires) {
    let list = [];
    for (let key in cookies) {
        list.push(key + '=' + encodeURIComponent(cookies[key]));
    }
    return list.join('; ') + '; expires=' + new Date(new Date().getTime() + (1000 * 60 * expires)).toUTCString();;
}


module.exports = function init(req, res, site) {

    let cookie = {}
    cookie.list = parseCookies(req.headers.cookie);

    cookie.set = function(key, value) {
        newCookies = []
        newCookies[key] = value
        res.setHeader('Set-Cookie', stringifyCookies(newCookies, site.sessionTimeout));
    }

    cookie.get = function(key) {
        let value = cookie.list[key];
        if (typeof value == 'undefined') {
            return null
        }
        return value
    }

    return cookie
}