exports = module.exports = function init(____0) {
    ____0.escapeRegExp = function (s = '') {
        if (typeof s !== 'string') {
            s = s.toString();
        }
        return s.replace(/[\/\\^$*+?.()\[\]{}]/g, '\\$&');
    };

    if (____0.options.proto.object) {
        if (!Object.prototype.test) {
            Object.defineProperty(Object.prototype, 'test', {
                value: function (reg, flag = 'gium') {
                    if (this === undefined || this === null) {
                        return !1;
                    }
                    let txt = '';

                    if (this.endsWith) {
                        txt = this.toString();
                    } else if (this.endsWith) {
                        txt = this.toISOString;
                    } else {
                        txt = JSON.stringify(this);
                    }

                    try {
                        return new RegExp(reg, flag).test(txt);
                    } catch (error) {
                        return !1;
                    }
                },
            });
        }
        if (!Object.prototype.like) {
            Object.defineProperty(Object.prototype, 'like', {
                value: function (name) {
                    if (!name) {
                        return !1;
                    }
                    if (name.indexOf('*') !== -1) {
                        name = name.split('*');
                        name.forEach((n, i) => {
                            name[i] = ____0.escapeRegExp(n);
                        });
                        name = name.join('.*');
                    } else {
                        name = ____0.escapeRegExp(name);
                    }
                    return this.test('^' + name + '$', 'gium');
                },
            });
        }
        if (!Object.prototype.contains) {
            Object.defineProperty(Object.prototype, 'contains', {
                value: function (name) {
                    return name.split('|').some((n) => n && ____0.toJson(this).test('^.*' + ____0.escapeRegExp(n) + '.*$', 'gium'));
                },
            });
        }
        if (!Object.prototype.contain) {
            Object.defineProperty(Object.prototype, 'contain', {
                value: function (name) {
                    return name.split('|').some((n) => n && ____0.toJson(this).test('^.*' + ____0.escapeRegExp(n) + '.*$', 'gium'));
                },
            });
        }
    }

    if (____0.options.proto.array) {
        if (!Array.prototype.test) {
            Array.prototype.test = function (reg, flag = 'gium') {
                if (this === undefined || this === null) {
                    return !1;
                }

                try {
                    let txt = JSON.stringify(this);
                    return new RegExp(reg, flag).test(txt);
                } catch (error) {
                    return !1;
                }
            };
        }
        if (!Array.prototype.like) {
            Array.prototype.like = function (name) {
                if (typeof name !== 'string') {
                    return !1;
                }
                if (name.indexOf('*') !== -1) {
                    name = name.split('*');
                    name.forEach((n, i) => {
                        name[i] = ____0.escapeRegExp(n);
                    });
                    name = name.join('.*');
                } else {
                    name = ____0.escapeRegExp(name);
                }
                return this.test('^' + name + '$', 'gium');
            };
        }
        if (!Array.prototype.contains) {
            Array.prototype.contains = function (name = '') {
                return name.split('|').some((n) => n && ____0.toJson(this).test('^.*' + ____0.escapeRegExp(n) + '.*$', 'gium'));
            };
        }
        if (!Array.prototype.contain) {
            Array.prototype.contain = function (name = '') {
                return name.split('|').some((n) => n && ____0.toJson(this).test('^.*' + ____0.escapeRegExp(n) + '.*$', 'gium'));
            };
        }
    }

    if (!String.prototype.test) {
        String.prototype.test = function (reg, flag = 'gium') {
            try {
                return new RegExp(reg, flag).test(this);
            } catch (error) {
                return !1;
            }
        };
    }

    if (!String.prototype.like) {
        String.prototype.like = function (name) {
            if (typeof name !== 'string') {
                return !1;
            }
            let r = !1;
            name.split('|').forEach((n) => {
                n = n.split('*');
                n.forEach((w, i) => {
                    n[i] = ____0.escapeRegExp(w);
                });
                n = n.join('.*');
                if (this.test('^' + n + '$', 'gium')) {
                    r = !0;
                }
            });
            return r;
        };
    }

    if (!String.prototype.contains) {
        String.prototype.contains = function (name = '') {
            return name.split('|').some((n) => n && this.test('^.*' + ____0.escapeRegExp(n) + '.*$', 'gium'));
        };
    }
    if (!String.prototype.contain) {
        String.prototype.contain = function (name = '') {
            return name.split('|').some((n) => n && this.test('^.*' + ____0.escapeRegExp(n) + '.*$', 'gium'));
        };
    }
};
