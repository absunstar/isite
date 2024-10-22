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
};
