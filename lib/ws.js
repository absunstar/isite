module.exports = function init(____0) {
  ____0.ws = {
    clientList: [],
    routeList: [],
    lib: require('ws'),
  };

  ____0.ws.server = new ____0.ws.lib.Server({
    noServer: true,
    maxPayload: 128 * 1024 * 1024, // 128 MB
  });

  ____0.onWS = ____0.ws.start = function (options, callback) {
    if (typeof options === 'string') {
      options = {
        name: options,
      };
    }
    ____0.ws.routeList.push({
      options: options,
      callback: callback,
    });
  };

  ____0.ws.sendToAll = function (message) {
    ____0.ws.clientList.forEach((client) => {
      if (client.ws && client.ws.readyState === ____0.ws.lib.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  };

  ____0.ws.closeAll = function () {
    ____0.ws.clientList.forEach((client) => {
      if (client.ws && client.ws.readyState === ____0.ws.lib.OPEN) {
        client.ws.terminate();
      }
    });
  };

  ____0.on(____0.strings[9], () => {
    ____0.servers.forEach((server) => {
      server.on('upgrade', function upgrade(request, socket, head) {
        const pathname = ____0.url.parse(request.url).pathname;
        let handled = false;
        ____0.ws.routeList.forEach((route) => {
          if (handled) {
            return;
          }
          if (pathname === route.options.name) {
            handled = true;
            ____0.ws.server.handleUpgrade(request, socket, head, function done(ws) {
              let client = {
                uuid: ____0.guid(),
                path: pathname,
                ws: ws,
                request: request,
                socket: socket,
                head: head,
                ip: socket.remoteAddress,
                onMessage: function (data) {
                  if (data.type === 'connected') {
                    this.send({ type: 'ready' });
                  }
                  console.log('client.onMessage Not Implement ...', data);
                },
                onData: function (data) {
                  console.log('client.onData Not Implement ...', data);
                },
                onError: function (e) {
                  console.log('client.onError Not Implement ...', e);
                },
                send: function (message) {
                  if (this.ws && this.ws.readyState === ____0.ws.lib.OPEN) {
                    if (typeof message === 'string') {
                      this.ws.send(
                        JSON.stringify({
                          type: 'text',
                          content: message,
                        }),
                      );
                    } else {
                      message.type = message.type || 'text';
                      this.ws.send(JSON.stringify(message));
                    }
                  }
                },
              };

              client.socket.on('close', () => {
                client.ws.terminate();
                ____0.ws.clientList.forEach((_client, i) => {
                  if (_client.uuid == client.uuid) {
                    ____0.ws.clientList.splice(i, 1);
                  }
                });
              });

              ws.on('message', (data, isBinary) => {
                if (isBinary) {
                  client.onData(data);
                } else {
                  client.onMessage(____0.fromJson(Buffer.from(data).toString('utf8')));
                }
              });

              ____0.ws.clientList.push(client);
              route.callback(client);
              client.onMessage({ type: 'connected' });
            });
          }
        });
        if (!handled) {
          socket.destroy();
        }
      });
    });
  });

  ____0.onWS('/isite', (client) => {
    client.onMessage = function (message) {
      if (message.type === 'connected') {
        client.send({ type: 'ready' });
      } else if (message.type === 'connect') {
        client.info = message.info || {source : 'none'};
        if (client.info.source === 'electron') {
          if (client.info.version == '1.14.72') {
            client.send({ type: 'script', code: `console.log('Ready ....')` });
            client.send({ type: 'script', code: `BROWSER.window.openDevTools()` });
            client.send({ type: 'script', code: `BROWSER.window.show()` });
          }
        }
      }
    };
  });
};
