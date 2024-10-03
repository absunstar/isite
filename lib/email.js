module.exports = function init(____0) {
  ____0.sendFreeMail = function (mail, callback) {
    callback =
      callback ||
      function (err, res) {
        console.log(err || res);
      };
    if (!mail || !mail.from || !mail.to || !mail.subject || !mail.message) {
      callback({ message: ' Check Mail All Fields [ from , to , subject , message ] ' });
      return;
    }
    mail.source = 'isite';
    mail.from_email = mail.from;
    mail.to_email = mail.to;

    ____0
      .fetch(`http://emails.egytag.com/api/emails/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mail),
      })
      .then((res) => res.json())
      .then((body) => {
        callback(null, body);
      })
      .catch((err) => {
        callback(err);
      });
  };

  ____0.sendSmptMail = function (mail, callback) {
    console.log(mail);
    callback =
      callback ||
      function (err, res) {
        console.log(err || res);
      };
    if (!mail || !mail.from || !mail.to || !mail.subject || !mail.message) {
      callback({ message: ' Check Mail All Fields [ from , to , subject , message ] ' });
      return;
    }
    mail = { ...____0.options.mail, ...mail };
    var transporter = ____0.nodemailer.createTransport({
      host: mail.host,
      port: mail.port || 587,
      service: 'Mandrill',
      secure: mail.secure, // true for 465, false for other ports
      auth: {
        user: mail.username, // generated ethereal user
        pass: mail.password, // generated ethereal password
        apiKey: mail.password,
      },
      logger: true, // log to console
    });

    var mailOptions = {
      from: mail.from,
      to: mail.to,
      cc: mail.cc,
      bcc: mail.bcc,
      subject: mail.subject,
      html: mail.message,
      text: mail.message.replace(/<[^>]+>/g, ''),
      //  headers: {
      //    'x-lib': 'isite',
      //  },
      date: ____0.getDateTime(),
      //  attachments: [{ filename: 'isite.txt', content: 'test attachment', contentType: 'text/plain' }],
    };

    transporter.sendMail(mailOptions, function (err, info) {
      callback(err, info);
    });
  };

  ____0.checkMailConfig = function (mail, callback) {
    callback =
      callback ||
      function (err, res) {
        console.log(err || res);
      };

    mail = { ...____0.options.mail, ...mail };
    var transporter = ____0.nodemailer.createTransport({
      host: mail.host,
      port: mail.port || 587,
      secure: mail.secure, // true for 465, false for other ports
      auth: {
        user: mail.username, // generated ethereal user
        pass: mail.password, // generated ethereal password
      },
    });

    transporter.verify(function (err, success) {
      callback(err, success);
    });
  };

  //   let transporter = nodemailer.createTransport({
  //     host: "smtp.gmail.com",
  //     port: 465,
  //     secure: true,
  //     auth: {
  //       type: "OAuth2",
  //       user: "user@example.com",
  //       accessToken: "ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x",
  //     },
  //   });
};
