exports = module.exports = function init(_p_) {
  function escape(s) {
    if (!s) {
      return '';
    }
    if (typeof s !== 'string') {
      s = s.toString();
    }
    return s.replace(/[\/\\^$*+?.()\[\]{}]/g, '\\$&');
  }

  if (_p_.options.proto.object) {
    if (!Object.prototype.test) {
      Object.defineProperty(Object.prototype, 'test', {
        value: function (reg, flag = 'gium') {
          if (this === undefined || this === null) {
            return false;
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
            return false;
          }
        },
      });
    }
    if (!Object.prototype.like) {
      Object.defineProperty(Object.prototype, 'like', {
        value: function (name) {
          if (!name) {
            return false;
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
            return false;
          }
          return this.test('^.*' + escape(name) + '.*$', 'gium');
        },
      });
    }
  }

  if (!String.prototype.test) {
    Object.defineProperty(String.prototype, 'test', {
      value: function (reg, flag = 'gium') {
        try {
          return new RegExp(reg, flag).test(this);
        } catch (error) {
          return false;
        }
      },
    });
  }

  if (!String.prototype.like) {
    Object.defineProperty(String.prototype, 'like', {
      value: function (name) {
        if (!name) {
          return false;
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

  if (!String.prototype.contains) {
    Object.defineProperty(String.prototype, 'contains', {
      value: function (name) {
        if (!name) {
          return false;
        }
        return this.test('^.*' + escape(name) + '.*$', 'gium');
      },
    });
  }
};
