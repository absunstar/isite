module.exports = function init(____0) {
  ____0.proxyList = [];
  ____0.proxyByPort = new Map();
  ____0.startProxy = function (options = { name: 'internal Proxy', port: 55555 }) {
    try {
      const existing = ____0.proxyByPort.get(Number(options.port));
      if (!existing) {
        let child = ____0.child_process.fork('./proxy', [], { cwd: ____0.localDir });
        child.send({ type: 'start', options: options });
        const entry = { child: child, options: options };
        ____0.proxyList.push(entry);
        ____0.proxyByPort.set(Number(options.port), entry);
        return entry;
      } else {
        existing.options = { ...existing.options, ...options };
        existing.child.send(existing.options);
        return existing;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  ____0.closeProxy = function (options = { name: 'internal Proxy', port: 55555 }) {
    const entry = ____0.proxyByPort.get(Number(options.port));
    if (entry) {
      let child = entry.child;
      if (entry.timeout) clearTimeout(entry.timeout);
      child.send({ type: 'close', options: options });
      const index = ____0.proxyList.indexOf(entry);
      if (index !== -1) ____0.proxyList.splice(index, 1);
      ____0.proxyByPort.delete(Number(options.port));
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

    if (____0.proxyByPort.has(Number(options.port))) response.exists = true;

    let proxy = ____0.startProxy(options);

    if (proxy) {
      response.done = true;

      clearTimeout(proxy.timeout);
      proxy.options.startDate = new Date();
      proxy.options.endDate = new Date(proxy.options.startDate.getTime() + options.timeout);
      proxy.timeout = setTimeout(() => {
        ____0.closeProxy(options);
      }, options.timeout);
      if (proxy.timeout.unref) proxy.timeout.unref();

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

    if (!____0.proxyByPort.has(Number(options.port))) response.exists = false;
    response.done = ____0.closeProxy(options);
    response.options = options;
    res.json(response);
  });
  ____0.onGET('/x-api/proxy-list', (req, res) => {
    res.json({ done: true, count: ____0.proxyList.length, list: ____0.proxyList.map((p) => ({ options: p.options })) });
  });
};
