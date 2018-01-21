const mailer = require('nodemailer');
const configs = require('../config');
module.exports.mail = (recipient, data, cb) => {
  var transporter;
  if (process.env.NODE_ENV == 'test') {
    transporter = mailer.createTransport({
      host: configs.app.emailHost,
      port: 2525,
      auth: {
        user: configs.app.emailId,
        pass: configs.app.emailPassword
      },
      proxy: 'http://172.16.2.30:8080'
    });
  } else {
    transporter = mailer.createTransport({
      host: configs.app.emailHost,
      port: 2525,
      auth: {
        user: configs.app.emailId,
        pass: configs.app.emailPassword
      }
    });
  }
  var mailOptions = {
    from: 'snap-a-doubt@gmail.com',
    to: recipient,
    subject: 'New Doubt',
    text: data.toString()
  };
//   console.log(data.toString());
  transporter.sendMail(mailOptions, function (error, info) {
    console.log(error);
    console.log(info);
    if (error) {
      return cb(error, null);
    } else {
      return cb(null, info);
    }
  });
};
