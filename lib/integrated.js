module.exports = function init(____0) {
  ____0.sendEmail =____0.sendMail = function (mail, callback) {
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
};
