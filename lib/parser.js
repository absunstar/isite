module.exports = function init(req, res, ____0, route) {
    req.features = req.features || [];

    let parser = {};

    function renderVar(v) {
        if (v && v == '*') {
            return JSON.stringify(____0.var);
        }
        return ____0.var(v);
    }

    function renderParam(v) {
        if (typeof req.paramsRaw[v] !== undefined) {
            if (v && v == '*') {
                return JSON.stringify(req.paramsRaw);
            }
            return req.paramsRaw[v];
        }

        return ' ';
    }

    function renderQuery(v) {
        if (typeof req.queryRaw[v] !== undefined) {
            if (v && v == '*') {
                return JSON.stringify(req.queryRaw);
            }
            return req.queryRaw[v];
        }
        return ' ';
    }

    function renderData(d) {
        if (!d) {
            return '';
        }
        let hide = false;
        let out = '';

        if (d.indexOf('#') == 0) {
            d = d.replace('#', '');
            hide = true;
        }

        if (d == '*') {
            out = JSON.stringify(req.data);
        } else if (d) {
            v = d.split('.');

            if (v.length > 0) {
                out = req.data[v[0]];
            }

            if (v.length > 1 && out) {
                out = out[v[1]];
            }

            if (v.length > 2 && out) {
                out = out[v[2]];
            }

            if (v.length > 3 && out) {
                out = out[v[3]];
            }

            if (v.length > 4 && out) {
                out = out[v[4]];
            }

            if (v.length > 5 && out) {
                out = out[v[5]];
            }
        }

        if (hide) {
            out = ____0.hide(out);
        } else {
            if (typeof out === 'object') {
                out = ____0.toJson(out);
            }
        }

        return out || '';
    }

    function renderUser(v) {
        if (!v) {
            return '';
        }

        let user = req.session.user;
        if (user) {
            let hide = false;
            let out = '';
            if (v.indexOf('#') == 0) {
                v = v.replace('#', '');
                hide = true;
            }
            if (v == '*') {
                out = JSON.stringify(user);
            } else {
                v = v.split('.');

                if (v.length > 0) {
                    out = user[v[0]];
                }

                if (v.length > 1 && out) {
                    out = out[v[1]];
                }

                if (v.length > 2 && out) {
                    out = out[v[2]];
                }

                if (v.length > 3 && out) {
                    out = out[v[3]];
                }

                if (v.length > 4 && out) {
                    out = out[v[4]];
                }

                if (v.length > 5 && out) {
                    out = out[v[5]];
                }
            }

            if (typeof out === 'object') {
                out = ____0.toJson(out);
            }

            if (hide) {
                out = ____0.hide(out);
            } else {
                if (typeof out === 'object') {
                    out = ____0.toJson(out);
                }
                if (typeof out === 'undefined') {
                    out = '';
                }
            }
            return out;
        }

        return '';
    }

    function render_site(v) {
        if (!v) {
            return '';
        }
        let hide = false;
        let out = '';
        if (v.indexOf('#') == 0) {
            v = v.replace('#', '');
            hide = true;
        }
        if (v == '*') {
            out = JSON.stringify(____0);
        } else {
            v = v.split('.');

            if (v.length > 0) {
                out = ____0[v[0]];
            }

            if (v.length > 1 && out) {
                out = out[v[1]];
            }

            if (v.length > 2 && out) {
                out = out[v[2]];
            }

            if (v.length > 3 && out) {
                out = out[v[3]];
            }

            if (v.length > 4 && out) {
                out = out[v[4]];
            }

            if (v.length > 5 && out) {
                out = out[v[5]];
            }
        }

        if (typeof out === 'object') {
            out = ____0.toJson(out);
        }

        if (hide) {
            out = ____0.hide(out);
        } else {
            if (typeof out === 'object') {
                out = ____0.toJson(out);
            }
        }
        return out;
    }

    function renderSetting(v) {
        if (v && v == '*') {
            return JSON.stringify(____0.setting);
        } else {
            return render_site('setting.' + v);
        }
    }
    function renderRequest(v) {
        if (!v) {
            return '';
        }
        let hide = false;
        let out = '';
        if (v.indexOf('#') == 0) {
            v = v.replace('#', '');
            hide = true;
        }
        if (v == '*') {
            out = JSON.stringify(req);
        } else {
            v = v.split('.');

            if (v.length > 0) {
                out = req[v[0]];
            }

            if (v.length > 1 && out) {
                out = out[v[1]];
            }

            if (v.length > 2 && out) {
                out = out[v[2]];
            }

            if (v.length > 3 && out) {
                out = out[v[3]];
            }

            if (v.length > 4 && out) {
                out = out[v[4]];
            }

            if (v.length > 5 && out) {
                out = out[v[5]];
            }
        }

        if (hide) {
            out = ____0.hide(out);
        } else {
            if (typeof out === 'object') {
                out = ____0.toJson(out);
            }
        }
        return typeof out !== 'undefined' ? out : '';
    }

    function renderSession(v) {
        if (v && v == '*') {
            return JSON.stringify({
                accessToken: req.session.accessToken,
                createdTime: req.session.createdTime,
                modifiedTime: req.session.modifiedTime,
                data: req.session.data,
                requestesCount: req.session.requestesCount,
                busy: req.session.$busy,
                ip: req.session.ip,
            });
        }
        if (v == 'lang') {
            return req.session.language.id;
        } else if (v == 'theme') {
            return req.session.theme;
        } else {
            v = v.split('.');
            if (v.length === 1) {
                return req.session[v[0]];
            }
            if (v.length === 2) {
                let s1 = req.session[v[0]];
                if (s1) {
                    return s1[v[1]];
                } else {
                    return '';
                }
            }
        }
    }

    function renderJson(name) {
        return ____0.readFileSync(route.parserDir + '/json/' + name + '.json');
    }

    function renderWord(name) {
        return req.word(name);
    }

    function getContent(name) {
        let path = null;
        let hide = false;
        if (name.startsWith('#')) {
            hide = true;
            name = name.replace('#', '');
        }

        if (!path || !____0.isFileExistsSync(path)) {
            let arr = name.split('/');
            if (arr.length === 1) {
                path = ____0.path.join(____0.path.dirname(route.parserDir), 'site_files', ____0.path.extname(arr[0]).replace('.', ''), arr[0]);
            } else if (arr.length === 2) {
                path = ____0.path.join(____0.path.dirname(route.parserDir), 'site_files', ____0.path.extname(arr[1]).replace('.', ''), arr[0], arr[1]);
            } else if (arr.length === 3) {
                path = ____0.path.join(____0.path.dirname(route.parserDir), 'site_files', ____0.path.extname(arr[2]).replace('.', ''), arr[0], arr[1], arr[2]);
            }
        }

        if (!____0.isFileExistsSync(path)) {
            let arr = name.split('/');
            if (arr.length === 1) {
                path = ____0.path.join(route.parserDir, arr[0]);
            } else if (arr.length === 2) {
                path = ____0.path.join(____0.path.dirname(route.parserDir), 'apps', arr[0], 'site_files', ____0.path.extname(arr[1]).replace('.', ''), arr[1]);
            } else if (arr.length === 3) {
                path = ____0.path.join(____0.path.dirname(route.parserDir), 'apps', arr[0], 'site_files', ____0.path.extname(arr[2]).replace('.', ''), arr[1], arr[2]);
            }
        }

        if (!____0.isFileExistsSync(path)) {
            let arr = name.split('/');
            if (arr.length > 1) {
                ____0.apps.forEach((ap) => {
                    if (arr.length === 2 && ap.name == arr[0]) {
                        path = ____0.path.join(ap.path, 'site_files', ____0.path.extname(arr[1]).replace('.', ''), arr[1]);
                    } else if (arr.length === 2 && ap.name2 == arr[0]) {
                        path = ____0.path.join(ap.path, 'site_files', ____0.path.extname(arr[1]).replace('.', ''), arr[1]);
                    } else if (arr.length === 3 && ap.name == arr[0]) {
                        path = ____0.path.join(ap.path, 'site_files', ____0.path.extname(arr[2]).replace('.', ''), arr[1], arr[2]);
                    }
                });
            }
        }

        if (!____0.isFileExistsSync(path)) {
            ____0.log(path, 'PATH NOT EXISTS parser.getContent()');
            return '';
        }

        if (name.endsWith('.content.html')) {
            let txt = ____0.readFileSync(path);
            return txt;
        } else if (name.endsWith('.html')) {
            let txt = ____0.readFileSync(path);
            let $ = ____0.$.load(txt, null, false);
            $ = renderHtml($);
            if (hide) {
                return ____0.hide($.html());
            }
            return $.html();
        } else if (name.endsWith('.js')) {
            let txt = ____0.readFileSync(path);
            txt = parser.js(txt);
            if (hide) {
                txt = ____0.hide(txt);
            }
            return txt;
        } else if (name.endsWith('.css')) {
            let txt = ____0.readFileSync(path);
            txt = parser.css(txt);
            return txt;
        } else {
            let txt = ____0.readFileSync(path);
            if (hide) {
                txt = ____0.hide(txt);
            }
            return txt;
        }
    }

    function handleXList1($, el, data) {
        let property = $(el).attr('x-list1').split('.');
        $(el).removeAttr('x-list1');
        let list = null;
        let html2 = '';
        if (property.length > 0) {
            if (property[0] == '*') {
                list = data;
            } else {
                list = data[property[0]];
            }
        }
        if (list && property.length > 1) {
            list = list[property[1]];
        }
        if (list && property.length > 2) {
            list = list[property[2]];
        }
        if (Array.isArray(list)) {
            let matches = $.html(el).match(/##item1.*?##/g);
            list.forEach((item, i) => {
                $(el).attr('x-item1', i);
                let _html = $.html(el);
                if (matches) {
                    for (let i = 0; i < matches.length; i++) {
                        let p = matches[i].replace('##item1.', '').replace('##', '').split('.');
                        let v = null;
                        if (p.length > 0) {
                            if (p[0] == '*' || !p[0]) {
                                v = item;
                            } else {
                                v = item[p[0]];
                            }
                        }
                        if (p.length > 1 && v) {
                            v = v[p[1]];
                        }
                        if (p.length > 2 && v) {
                            v = v[p[2]];
                        }

                        _html = _html.replace(matches[i], v || '');
                    }
                }
                let $2 = ____0.$.load(_html);
                $2('[x-show-item1]').each(function (i, elem) {
                    let property = $(elem).attr('x-show-item1').split('.');
                    let out = null;
                    if (property.length > 0) {
                        if (property.length > 0) {
                            out = item[property[0]];
                        }

                        if (property.length > 1 && out) {
                            out = out[property[1]];
                        }

                        if (property.length > 2 && out) {
                            out = out[property[2]];
                        }

                        if (property.length > 3 && out) {
                            out = out[property[3]];
                        }

                        if (property.length > 4 && out) {
                            out = out[property[4]];
                        }

                        if (property.length > 5 && out) {
                            out = out[property[5]];
                        }
                    }
                    if (!out) {
                        $(this).remove();
                    } else {
                        $(this).removeAttr('x-show-item1');
                    }
                });
                $2('[x-list2]').each(function (i2, elem2) {
                    $(handleXList2($2, elem2, item)).insertAfter($(this));
                    $(this).remove();
                });
                html2 += $2.html();
            });
        }

        return html2;
    }

    function handleXList2($, el, data) {
        let property = $(el).attr('x-list2').split('.');
        $(el).removeAttr('x-list2');
        let list = null;
        let html2 = '';
        if (property.length > 0) {
            if (property[0] == '*') {
                list = data;
            } else {
                list = data[property[0]];
            }
        }
        if (list && property.length > 1) {
            list = list[property[1]];
        }
        if (Array.isArray(list)) {
            let matches = $.html(el).match(/##item2.*?##/g);
            list.forEach((item, i) => {
                $(el).attr('x-item2', i);
                let _html = $.html(el);
                if (matches) {
                    for (let i = 0; i < matches.length; i++) {
                        let p = matches[i].replace('##item2.', '').replace('##', '').split('.');
                        let v = null;
                        if (p.length > 0) {
                            if (p[0] == '*' || !p[0]) {
                                v = item;
                            } else {
                                v = item[p[0]];
                            }
                        }
                        if (p.length > 1 && v) {
                            v = v[p[1]];
                        }
                        if (p.length > 2 && v) {
                            v = v[p[2]];
                        }
                        _html = _html.replace(matches[i], v || '');
                    }
                }
                let $2 = ____0.$.load(_html);
                $2('[x-show-item2]').each(function (i, elem) {
                    let property = $(elem).attr('x-show-item2').split('.');
                    let out = null;
                    if (property.length > 0) {
                        if (property.length > 0) {
                            out = item[property[0]];
                        }

                        if (property.length > 1 && out) {
                            out = out[property[1]];
                        }

                        if (property.length > 2 && out) {
                            out = out[property[2]];
                        }

                        if (property.length > 3 && out) {
                            out = out[property[3]];
                        }

                        if (property.length > 4 && out) {
                            out = out[property[4]];
                        }

                        if (property.length > 5 && out) {
                            out = out[property[5]];
                        }
                    }
                    if (!out) {
                        $(this).remove();
                    } else {
                        $(this).removeAttr('x-show-item2');
                    }
                });
                html2 += $2.html();
            });
        }
        return html2;
    }

    function renderHtml($, log) {
        $('[x-setting]').each(function (i, elem) {
            let property = $(elem).attr('x-setting').split('.');
            let out = null;
            if (property.length > 0) {
                if (property.length > 0) {
                    out = ____0.setting[property[0]];
                }

                if (property.length > 1 && out) {
                    if (out) {
                        out = out[property[1]];
                    } else {
                        out = null;
                    }
                }
                if (property.length > 2 && out) {
                    if (out) {
                        out = out[property[2]];
                    } else {
                        out = null;
                    }
                }
                if (property.length > 3 && out) {
                    if (out) {
                        out = out[property[3]];
                    } else {
                        out = null;
                    }
                }
                if (property.length > 4 && out) {
                    if (out) {
                        out = out[property[4]];
                    } else {
                        out = null;
                    }
                }
            }
            if (!out) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-setting');
            }
        });

        $('[x-data]').each(function (i, elem) {
            let property = $(elem).attr('x-data').split('.');
            let out = null;
            if (property.length > 0) {
                if (property.length > 0) {
                    out = req.data[property[0]];
                }

                if (property.length > 1 && out) {
                    if (out) {
                        out = out[property[1]];
                    } else {
                        out = null;
                    }
                }
                if (property.length > 2 && out) {
                    if (out) {
                        out = out[property[2]];
                    } else {
                        out = null;
                    }
                }
                if (property.length > 3 && out) {
                    if (out) {
                        out = out[property[3]];
                    } else {
                        out = null;
                    }
                }
                if (property.length > 4 && out) {
                    if (out) {
                        out = out[property[4]];
                    } else {
                        out = null;
                    }
                }
            }
            if (!out) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-data');
            }
        });

        $('[x-permission]').each(function (i, elem) {
            if (!____0.security.isUserHasPermission(req, res, $(this).attr('x-permission'))) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-permission');
            }
        });

        $('[x-role]').each(function (i, elem) {
            if (!____0.security.isUserHasRole(req, res, $(this).attr('x-role'))) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-role');
            }
        });

        $('[x-permissions]').each(function (i, elem) {
            if (!____0.security.isUserHasPermissions(req, res, $(this).attr('x-permissions'))) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-permissions');
            }
        });

        $('[x-roles]').each(function (i, elem) {
            if (!____0.security.isUserHasRoles(req, res, $(this).attr('x-roles'))) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-roles');
            }
        });

        $('[x-lang]').each(function (i, elem) {
            if ($(this).attr('x-lang') !== req.session.language.id) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-lang');
            }
        });

        $('[x-feature]').each(function (i, elem) {
            let f = $(this).attr('x-feature');
            let not = !1;
            if (f.startsWith('!')) {
                f = f.replace('!', '');
                not = !0;
            }
            if (!req.features.some((ff) => ff.like(f)) && !not) {
                $(this).remove();
            } else if (req.features.some((ff) => ff.like(f)) && not) {
                $(this).remove();
            } else {
                $(this).removeAttr('x-feature');
            }
        });

        $('[x-features]').each(function (i, elem) {
            let fs = $(this).attr('x-features');
            if (fs.indexOf('||') > -1) {
                let del = !0;
                fs.split('||').forEach((f) => {
                    f = f.trim();
                    let not = !1;
                    if (f.startsWith('!')) {
                        f = f.replace('!', '');
                        not = !0;
                    }
                    if (req.features.some((ff) => ff.like(f)) && !not) {
                        del = !1;
                    }
                    if (!req.features.some((ff) => ff.like(f)) && not) {
                        del = !1;
                    }
                });

                if (del) {
                    $(this).remove();
                }
            } else if (fs.indexOf('&&') > -1) {
                let ok_list = [];
                fs.split('&&').forEach((f) => {
                    f = f.trim();
                    let d = !0;
                    if (f.startsWith('!')) {
                        f = f.replace('!', '');
                        d = !1;
                    }
                    if (!req.features.some((ff) => ff.like(f)) && !d) {
                        ok_list.push({});
                    }
                    if (req.features.some((ff) => ff.like(f)) && d) {
                        ok_list.push({});
                    }
                });
                if (ok_list.length !== fs.split('&&').length) {
                    $(this).remove();
                }
            } else {
                f = fs.trim();
                let d = !0;
                if (f.startsWith('!')) {
                    f = f.replace('!', '');
                    d = !1;
                }
                if (!req.features.some((ff) => ff.like(f)) && d) {
                    $(this).remove();
                }
                if (req.features.some((ff) => ff.like(f)) && !d) {
                    $(this).remove();
                }
            }
        });

        if (route.parser.like('*css*')) {
            $('style').each(function (i, elem) {
                $(this).html(parser.css($(this).html()));
            });
        }

        if (route.parser.like('*js*')) {
            $('script').each(function (i, elem) {
                $(this).html(parser.js($(this).html()));
            });
        }

        $($('[x-import]').get().reverse()).each(function (i, elem) {
            let file = $(this).attr('x-import');
            if (file.endsWith('.html')) {
                $(this).html(getContent(file) + $(this).html());
            } else if (file.endsWith('.css')) {
                $(this).text(getContent(file) + $(this).html());
            } else {
                $(this).text(getContent(file) + $(this).text());
            }
            $(this).removeAttr('x-import');
        });

        $($('[x-append]').get().reverse()).each(function (i, elem) {
            let file = $(this).attr('x-append');
            $(this).removeAttr('x-append');
            if (file.endsWith('.html')) {
                $(this).html($(this).html() + getContent(file));
            } else if (file.endsWith('.css')) {
                $(this).text($(this).html() + getContent(file));
            } else {
                $(this).text($(this).text() + getContent(file));
            }
            $(this).removeAttr('x-append');
        });

        $($('[x-replace]').get().reverse()).each(function (i, elem) {
            let file = $(this).attr('x-replace');

            $(getContent(file)).insertAfter($(this));
            $(this).remove();

            $(this).removeAttr('x-replace');
        });

        $('[x-list1]').each(function (i, elem) {
            $(handleXList1($, elem, req.data)).insertAfter($(this));
            $(this).remove();
        });
        $('[x-list2]').each(function (i, elem) {
            $(handleXList2($, elem, req.data)).insertAfter($(this));
            $(this).remove();
        });
        return $;
    }

    parser.handleMatches = function (txt) {
        let matches = txt.match(/##.*?##/g);
        if (matches) {
            for (let i = 0; i < matches.length; i++) {
                let v = matches[i];

                if (v.startsWith('##var.')) {
                    v = v.replace('##var.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderVar(v));
                } else if (v.startsWith('##user.')) {
                    v = v.replace('##user.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderUser(v));
                } else if (v.startsWith('##site.')) {
                    v = v.replace('##site.', '').replace('##', '');
                    txt = txt.replace(matches[i], render_site(v));
                } else if (v.startsWith('##req.')) {
                    v = v.replace('##req.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderRequest(v));
                } else if (v.startsWith('##session.')) {
                    v = v.replace('##session.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderSession(v));
                } else if (v.startsWith('##json.')) {
                    v = v.replace('##json.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderJson(v));
                } else if (v.startsWith('##setting.')) {
                    v = v.replace('##setting.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderSetting(v));
                } else if (v.startsWith('##params.')) {
                    v = v.replace('##params.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderParam(v));
                } else if (v.startsWith('##query.')) {
                    v = v.replace('##query.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderQuery(v));
                } else if (v.startsWith('##data.')) {
                    v = v.replace('##data.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderData(v));
                } else if (v.startsWith('##word.')) {
                    v = v.replace('##word.', '').replace('##', '');
                    txt = txt.replace(matches[i], renderWord(v));
                } else {
                }
            }
        }
        return txt;
    };

    parser.html = function (content) {
        let $ = ____0.$.load(content);
        $ = renderHtml($);
        txt = parser.handleMatches($.html());
        return txt;
    };
    parser.txt = function (content) {
        content = parser.handleMatches(content);
        return content;
    };

    parser.js = function (content) {
        let matches = content.match(/\/\*##.*?\*\//g);
        if (matches) {
            for (let i = 0; i < matches.length; i++) {
                let v = matches[i];
                v = v.replace('/*##', '').replace('*/', '');
                content = content.replace(matches[i], getContent(v));
            }
        }
        content = parser.handleMatches(content);
        return content;
    };

    parser.css = function (content) {
        content = parser.handleMatches(content);

        let matches = content.match(/var\(---.*?\)/g);
        if (matches) {
            for (let i = 0; i < matches.length; i++) {
                let v = matches[i];

                v = v.replace('var(---', '').replace(')', '');
                content = content.replace(matches[i], renderVar(v));
            }
        }

        let matches2 = content.match(/word\(---.*?\)/g);
        if (matches2) {
            for (let i = 0; i < matches2.length; i++) {
                let v = matches2[i];

                v = v.replace('word(---', '').replace(')', '');
                content = content.replace(matches2[i], renderWord(v));
            }
        }

        return content;
    };

    parser.json = function (content) {
        return content;
    };

    parser.renderHtml = renderHtml;
    return parser;
};
