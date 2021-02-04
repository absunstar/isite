exports = module.exports = function init(___0) {
  function escape(s) {
    if (!s) {
      return '';
    }
    if (typeof s !== 'string') {
      s = s.toString();
    }
    return s.replace(/[\/\\^$*+?.()\[\]{}]/g, '\\$&');
  }

  if (___0.options.proto.object) {
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
              name[i] = escape(n);
            });
            name = name.join('.*');
          } else {
            name = escape(name);
          }
          return this.test('^' + name + '$', 'gium');
        },
      });
    }
    if (!Object.prototype.contains) {
      Object.defineProperty(Object.prototype, 'contains', {
        value: function (name) {
          if (!name) {
            return !1;
          }
          return this.test('^.*' + escape(name) + '.*$', 'gium');
        },
      });
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
      if (!name) {
        return !1;
      }
      let r = !1;
      name.split('|').forEach((n) => {
        n = n.split('*');
        n.forEach((w, i) => {
          n[i] = escape(w);
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
    String.prototype.contains = function (name) {
      let r = !1;
      if (!name) {
        return r;
      }
      name.split('|').forEach((n) => {
          if(n && this.test('^.*' + escape(n) + '.*$', 'gium')){
            r = !0
          }
      })
      return r;
    };
  }
};
