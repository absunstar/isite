site.print = site.printHTML = function (options) {
  options = options || {};

  if (typeof options === 'string') {
    options = {
      selector: options,
    };
  }

  if (!options.selector) {
    console.error('No Selector sets ...');
    return false;
  }
  if (!options.ip) {
    options.ip = '127.0.0.1';
  }
  if (!options.port) {
    options.port = '60080';
  }

  let content = '';
  window.document.querySelectorAll('link[rel=stylesheet]').forEach((l) => {
    content += l.outerHTML;
  });

  window.document.querySelectorAll('style').forEach((s) => {
    content += s.outerHTML;
  });

  if (options.links) {
    options.links.forEach((link) => {
      content += '<link rel="stylesheet" href="' + link + '" type="text/css" >';
    });
  }

  if (options.preappends) {
    options.preappends.forEach((el) => {
      el = window.document.querySelector(el);
      if (el) {
        content += el.outerHTML;
      }
    });
  }

  document.querySelectorAll(options.selector + ' input').forEach((el) => {
    el.setAttribute('value', el.value);
  });

  document.querySelectorAll(options.selector + ' textarea').forEach((el) => {
    el.innerText = el.value;
  });

  document.querySelectorAll(options.selector).forEach((el) => {
    let display = el.style.display;
    el.style.display = 'block';
    content += el.outerHTML;
    el.style.display = display;
  });

  if (options.appends) {
    options.appends.forEach((el) => {
      el = window.document.querySelector(el);
      if (el) {
        content += el.outerHTML;
      }
    });
  }

  site.postData(
    { url: '/api/print', data: { content: content } },
    (response) => {
      if (response.done) {
        if (options.printer) {
          fetch(response.url, {
            mode: 'cors',
            method: 'get',
          })
            .then((res) => res.text())
            .then((html) => {
              site.postData(
                {
                  url: `http://${options.ip}:${options.port}/print`,
                  data: {
                    html: html,
                    type: 'html',
                    printer: options.printer,
                    width: options.width ?? 320,
                  },
                },
                (res) => {
                  console.log(res);
                },
              );
            })
            .catch((err) => {
              console.error(err);
              error(err);
            });
        } else {
          window.open(response.url);
        }
      }
    },
    (error) => {
      console.log(error);
    },
  );

  return !0;
};

site.printAsImage = function (options, callback) {
  options = options || {};

  if (typeof options === 'string') {
    options = {
      selector: options,
    };
  }
  if (!options.selector) {
    console.error('No Selector sets ...');
    return false;
  }
  if (!options.ip) {
    options.ip = '127.0.0.1';
  }
  if (!options.port) {
    options.port = '60080';
  }
  if (!options.type) {
    options.type = 'image';
  }

  let node = typeof options.selector === 'string' ?  document.querySelector(options.selector) : options.selector ;
  if (!node) {
    console.error('No Node Selector ');
    return false;
  }
  domtoimage
    .toJpeg(node, { quality: 0.95, bgcolor: '#ffffff' })
    .then(function (dataUrl) {
      var img = new Image();
      img.src = dataUrl;
      if (callback) {
        callback(img);
      }
      options.dataUrl = dataUrl;
      site.printDataUrl(options);
    })
    .catch(function (erro) {
      console.error(error);
    });
};

site.printDataUrl = function (options) {
  site.postData(
    { url: '/api/print', data: { content: options.dataUrl, type: options.type } },
    (response) => {
      if (response.done) {
        if (options.printer) {
          fetch(response.url, {
            mode: 'cors',
            method: 'get',
          })
            .then((res) => res.text())
            .then((html) => {
              site.postData(
                {
                  url: `http://${options.ip}:${options.port}/print`,
                  data: {
                    html: html,
                    type: 'html',
                    printer: options.printer,
                    width: options.width ?? 320,
                  },
                },
                (res) => {},
              );
            })
            .catch((err) => {
              error(err);
            });
        } else {
          window.open(response.url);
        }
      }
    },
    (error) => {
      console.log(error);
    },
  );
};
