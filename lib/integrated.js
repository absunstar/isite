module.exports = function init(____0) {
  ____0.sendEmail = ____0.sendMail = function (mail, callback) {
    mail = { ...____0.options.mail, ...mail };
    if (mail.enabled) {
      if (mail.type === 'smpt') {
        ____0.sendSmptMail(mail, callback);
      } else {
        ____0.sendFreeMail(mail, callback);
      }
    } else {
      callback({ message: 'mail not enabled in site options' });
    }
  };

  ____0.telegramInit = function (_token, onNewMessage) {
    const token = _token || ____0.from123('28151274267416752654127427546213313647493756417147542323361941814637625228172373327862183774477626168234323932434158325736319191');
    const bot = new ____0.telegramBotApi(token, { polling: true });

    bot.on('message', function (msg) {
      if (onNewMessage) {
        onNewMessage(msg, bot);
      } else {
        bot.sendMessage(msg.chat.id, 'This Bot Not Implement Yet. \n For Help Call \n whats up: +966568118373 ');
      }
    });
    return bot;
  };

  ____0.telegramBotList = [];
  ____0.onPOST('/telegram/connect', (req, res) => {
    let response = {
      done: false,
      data: req.data,
    };
    if (req.data.token) {
      let bot = ____0.telegramBotList.find((b) => b.token == req.data.token)?.bot;
      if (!bot) {
        bot = ____0.telegramInit(req.data.token, (msg) => {
          console.log(msg);
        });
        ____0.telegramBotList.push({
          token: req.data.token,
          bot: bot,
        });
      }
      response.done = true;
    }

    res.json(response);
  });

  ____0.onPOST('/telegram/disconnect', (req, res) => {
    let response = {
      done: false,
      data: req.data,
    };
    if (req.data.token) {
      let index = ____0.telegramBotList.findIndex((b) => b.token == req.data.token);
      if (index !== -1) {
        ____0.telegramBotList = ____0.telegramBotList.filter((b) => b.token !== req.data.token);
        response.done = true;
        response.index = index;
      }
    }

    res.json(response);
  });

  ____0.onPOST('/telegram/send-message', (req, res) => {
    let response = {
      done: false,
      data: req.data,
    };
    if (req.data.token) {
      let bot = ____0.telegramBotList.find((b) => b.token == req.data.token)?.bot;
      if (!bot) {
        bot = ____0.telegramInit(req.data.token, (msg) => {
          console.log(msg);
        });
        ____0.telegramBotList.push({
          token: req.data.token,
          bot: bot,
        });
      }
      bot.sendMessage(req.data.chatID, req.data.message);
      response.done = true;
    }

    res.json(response);
  });
  
};
