module.exports = function init(____0) {
  ____0.proxyList = [];
  ____0.startProxy = function (options = { name: 'internal Proxy', port: 55555 }) {
    try {
      let index = ____0.proxyList.findIndex((p) => p.options.port === options.port);
      if (index === -1) {
        let child = ____0.child_process.fork('./proxy', [], { cwd: ____0.localDir });
        child.send({ type: 'start', options: options });
        ____0.proxyList.push({
          child: child,
          options: options,
        });
        return ____0.proxyList[____0.proxyList.length - 1];
      } else {
        ____0.proxyList[index].options = { ...____0.proxyList[index].options, ...options };
        ____0.proxyList[index].child.send(____0.proxyList[index].options);
        return ____0.proxyList[index];
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  ____0.closeProxy = function (options = { name: 'internal Proxy', port: 55555 }) {
    let index = ____0.proxyList.findIndex((p) => p.options.port === options.port);
    if (index !== -1) {
      let child = ____0.proxyList[index].child;
      child.send({ type: 'close', options: options });
      ____0.proxyList.splice(index, 1);
      return true;
    }
    return false;
  };
  ____0.onGET('/x-api/start-proxy', (req, res) => {
    let options = { timeout: 1000 * 60 * 5, ...req.query };
    options.port = parseInt(req.query.port || 55555);
    options.timeout = parseInt(options.timeout);

    options.xip = req.ip;
    let response = { done: false, options: options };

    let index = ____0.proxyList.findIndex((p) => p.options.port === options.port);
    if (index !== -1) {
      response.exists = true;
    }

    let proxy = ____0.startProxy(options);

    if (proxy) {
      response.done = true;

      clearTimeout(proxy.timeout);
      proxy.options.startDate = new Date();
      proxy.options.endDate = new Date(proxy.options.startDate.getTime() + options.timeout);
      proxy.timeout = setTimeout(() => {
        ____0.closeProxy(options);
      }, options.timeout);

      proxy.options.liveSeconds = options.timeout / 1000 + ' seconds';
      proxy.options.liveMinutes = options.timeout / 1000 / 60 + ' minutes';
      proxy.options.liveHours = options.timeout / 1000 / 60 / 60 + ' hours';
      response.options = proxy.options;
    }

    res.json(response);
  });
  ____0.onGET('/x-api/close-proxy', (req, res) => {
    let options = { ...req.query };
    options.port = parseInt(req.query.port || 55555);
    let response = {};

    let index = ____0.proxyList.findIndex((p) => p.options.port === options.port);
    if (index === -1) {
      response.exists = false;
    }
    response.done = ____0.closeProxy(options);
    response.options = options;
    res.json(response);
  });
  ____0.onGET('/x-api/proxy-list', (req, res) => {
    res.json({ done: true, count: ____0.proxyList.length, list: ____0.proxyList.map((p) => ({ options: p.options })) });
  });
};
