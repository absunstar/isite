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
        l.href = site.handle_url(l.href);
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
                            options.html = html;
                            options.type = 'html';
                            site.postData(
                                {
                                    url: `http://${options.ip}:${options.port}/print`,
                                    data: options,
                                },
                                (res) => {
                                    console.log(res);
                                },
                                (err) => {
                                    console.log(err);
                                },
                            );
                        })
                        .catch((err) => {
                            console.error(err);
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

site.printAsImageBusy = false;

site.printAsImage = function (options, callback) {
    if (site.printAsImageBusy) {
        setTimeout(() => {
            site.printAsImage(options, callback);
        }, 1000);
        return false;
    }

    site.printAsImageBusy = true;
    options = options || {};

    if (typeof options === 'string') {
        options = {
            selector: options,
        };
    }
    if (!options.selector) {
        console.error('No Selector sets ...');
        site.printAsImageBusy = false;
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

    let node = typeof options.selector === 'string' ? document.querySelector(options.selector) : options.selector;
    if (!node) {
        console.error('No Node Selector ');
        site.printAsImageBusy = false;
        return false;
    }

    domtoimage
        .toPng(node, { quality: 1, bgcolor: '#ffffff' })
        .then(function (dataUrl) {
            var img = new Image();
            img.src = dataUrl;
            if (callback) {
                callback(img);
            }
            options.content = dataUrl;
            site.printDataUrl(options);
            site.printAsImageBusy = false;
        })
        .catch(function (error) {
            console.error(error);
            site.printAsImageBusy = false;
        });
};

site.printDataUrl = function (options) {
    site.postData(
        { url: '/api/print', data: options },
        (response) => {
            if (response.done) {
                if (options.printer) {
                    fetch(response.url, {
                        mode: 'cors',
                        method: 'get',
                    })
                        .then((res) => res.text())
                        .then((html) => {
                            options.html = html;
                            options.type = 'html';
                            site.postData(
                                {
                                    url: `http://${options.ip}:${options.port}/print`,
                                    data: options,
                                },
                                (res) => {},
                            );
                        })
                        .catch((err) => {
                            console.error(err);
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
