exports = module.exports = function init(____0) {
    ____0.escapeRegExp = function (s = '') {
        if (typeof s !== 'string') s = String(s);
        return s.replace(/[\/\\^$*+?.()\[\]{}|]/g, '\\$&');
    };

    const REGEX_CACHE_MAX = 1024;
    const regexCache = new Map();
    function cachedRegExp(source, flags = 'ium') {
        // `g` is intentionally removed: RegExp#test with a cached global regexp is stateful.
        flags = String(flags || '').replace(/g/g, '');
        const key = flags + '\0' + source;
        let re = regexCache.get(key);
        if (re) {
            regexCache.delete(key);
            regexCache.set(key, re);
            return re;
        }
        re = new RegExp(source, flags);
        regexCache.set(key, re);
        if (regexCache.size > REGEX_CACHE_MAX) regexCache.delete(regexCache.keys().next().value);
        return re;
    }

    function testValue(value, reg, flag = 'gium') {
        try { return cachedRegExp(reg, flag).test(String(value)); } catch (_) { return false; }
    }

    function compileLikePattern(name) {
        const parts = String(name).split('|').filter(Boolean);
        if (!parts.length) return null;
        return parts.map((part) => {
            if (!part.includes('*')) return { exact: part.toLowerCase() };
            const source = '^' + part.split('*').map(____0.escapeRegExp).join('.*') + '$';
            return { re: cachedRegExp(source, 'ium') };
        });
    }

    const likeCache = new Map();
    function likeValue(value, name) {
        if (typeof name !== 'string') return false;
        const text = String(value);
        let compiled = likeCache.get(name);
        if (!compiled) {
            compiled = compileLikePattern(name);
            likeCache.set(name, compiled);
            if (likeCache.size > REGEX_CACHE_MAX) likeCache.delete(likeCache.keys().next().value);
        }
        if (!compiled) return false;
        const lower = text.toLowerCase();
        return compiled.some((p) => p.exact !== undefined ? lower === p.exact : p.re.test(text));
    }

    function containsValue(value, name) {
        if (typeof name !== 'string') return false;
        const text = String(value).toLowerCase();
        return name.split('|').some((part) => part && text.includes(part.toLowerCase()));
    }

    function objectText(value) {
        if (value === undefined || value === null) return '';
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
        if (value instanceof Date) return value.toISOString();
        try { return JSON.stringify(value); } catch (_) { return String(value); }
    }

    ____0.pattern = { test: testValue, like: likeValue, contains: containsValue, regexCache, likeCache };

    if (____0.options.proto.object) {
        if (!Object.prototype.test) Object.defineProperty(Object.prototype, 'test', { value: function (reg, flag = 'gium') { return testValue(objectText(this), reg, flag); } });
        if (!Object.prototype.like) Object.defineProperty(Object.prototype, 'like', { value: function (name) { return likeValue(objectText(this), name); } });
        if (!Object.prototype.contains) Object.defineProperty(Object.prototype, 'contains', { value: function (name) { return containsValue(objectText(this), name); } });
        if (!Object.prototype.contain) Object.defineProperty(Object.prototype, 'contain', { value: function (name) { return containsValue(objectText(this), name); } });
    }

    if (____0.options.proto.array) {
        if (!Object.prototype.hasOwnProperty.call(Array.prototype, 'test')) Object.defineProperty(Array.prototype, 'test', { value: function (reg, flag = 'gium') { return testValue(objectText(this), reg, flag); } });
        if (!Object.prototype.hasOwnProperty.call(Array.prototype, 'like')) Object.defineProperty(Array.prototype, 'like', { value: function (name) { return likeValue(objectText(this), name); } });
        if (!Object.prototype.hasOwnProperty.call(Array.prototype, 'contains')) Object.defineProperty(Array.prototype, 'contains', { value: function (name = '') { return containsValue(objectText(this), name); } });
        if (!Object.prototype.hasOwnProperty.call(Array.prototype, 'contain')) Object.defineProperty(Array.prototype, 'contain', { value: function (name = '') { return containsValue(objectText(this), name); } });
    }

    if (!Object.prototype.hasOwnProperty.call(String.prototype, 'test')) Object.defineProperty(String.prototype, 'test', { value: function (reg, flag = 'gium') { return testValue(this, reg, flag); } });
    if (!Object.prototype.hasOwnProperty.call(String.prototype, 'like')) Object.defineProperty(String.prototype, 'like', { value: function (name) { return likeValue(this, name); } });
    if (!Object.prototype.hasOwnProperty.call(String.prototype, 'contains')) Object.defineProperty(String.prototype, 'contains', { value: function (name = '') { return containsValue(this, name); } });
    if (!Object.prototype.hasOwnProperty.call(String.prototype, 'contain')) Object.defineProperty(String.prototype, 'contain', { value: function (name = '') { return containsValue(this, name); } });
};
