const webServer = require('./index')({ name: 'Local Proxy', apps: false, mongodb: { enabled: false }, require: { features: [] } });

var regex_hostport = /^([^:]+)(:([0-9]+))?$/;

webServer.options.ipList = [];

var getHostPortFromString = function (hostString, defaultPort) {
  var host = hostString;
  var port = defaultPort;

  var result = regex_hostport.exec(hostString);
  if (result != null) {
    host = result[1];
    if (result[2] != null) {
      port = result[3];
    }
  }

  return [host, port];
};

webServer.on('ready', () => {
  if (webServer.server) {
    webServer.server.addListener('connect', function (req, socket, bodyhead) {
      let ip = socket.remoteAddress?.replace('::ffff:', '') || '';
      if (!ip || !webServer.options.ipList.some((info) => info.ip === ip)) {
        console.log('Socket Block IP : ' + ip + ' : ' + req.url);
        return socket.end();
      }
      console.log('Socket Allow IP : ' + ip + ' : ' + req.url);
      var hostPort = getHostPortFromString(req.url, 443);
      var hostDomain = hostPort[0];
      var port = parseInt(hostPort[1]);
      console.log('Socket connecting :: ' + hostDomain + ':' + port);
      var proxySocket = new webServer.net.Socket();

      proxySocket.connect(port, hostDomain, function () {
        proxySocket.write(bodyhead);
        socket.write('HTTP/' + req.httpVersion + ' 200 Connection established\r\n\r\n');
      });

      proxySocket.on('connect', function () {
        console.log('Socket connected :: ' + hostDomain);
      });

      proxySocket.on('data', function (chunk) {
        socket.write(chunk);
      });

      proxySocket.on('end', function () {
        socket.end();
      });

      proxySocket.on('error', function () {
        socket.write('HTTP/' + req.httpVersion + ' 500 Connection error\r\n\r\n');
        socket.end();
      });

      socket.on('data', function (chunk) {
        proxySocket.write(chunk);
      });

      socket.on('end', function () {
        proxySocket.end();
      });

      socket.on('error', function () {
        proxySocket.end();
      });
    });
  } else {
    process.exit();
  }
});

let http_agent = new webServer.http.Agent({
  keepAlive: true,
});
let https_agent = new webServer.https.Agent({
  keepAlive: true,
});

webServer.onALL('*', (req, res) => {
  let ip = req.remoteAddress?.replace('::ffff:', '') || '';
  if (!ip || !webServer.options.ipList.some((info) => info.ip === ip)) {
    console.log('Http Block IP : ' + ip + ' : ' + req.url);
    return res.end();
  }
  console.log('Http Allow IP : ' + ip + ' : ' + req.url);
  webServer
    .fetch(req.url, {
      method: req.method,
      headers: req.headers,
      body: req.method.like('*get*|*head*') ? null : req.bodyRaw,
      agent: function (_parsedURL) {
        if (_parsedURL.protocol == 'http:') {
          return http_agent;
        } else {
          return https_agent;
        }
      },
    })
    .then((response) => {
      response.body.pipe(res);
    })
    .catch((err) => console.log(err));
});

process.on('message', (message) => {
  if (typeof message.options === 'object') {
    webServer.options = { ...webServer.options, ...message.options };
    if (message.options.xip) {
      let index = webServer.options.ipList.findIndex((info) => info.ip === message.options.xip);
      if (index === -1) {
        webServer.options.ipList.push({
          ip: message.options.xip,
          date: new Date(),
        });
      } else {
        webServer.options.ipList[index].date = new Date();
      }
    }
  }

  if (message.type == 'start') {
    webServer.run();
  }
  if (message.type == 'close') {
    process.exit();
  }
});
