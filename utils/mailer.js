const mailer = require('nodemailer');
const configs = require('../config');
module.exports.mail = (recipient, data, cb) => {
  var transporter;
  if (process.env.NODE_ENV == 'test') {
    transporter = mailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 465,
      secure: true,
      auth: {
        user: '69271bffcbc1a9',
        pass: '754e9bb7253a62'
      },
      proxy: 'http://172.16.2.30:8080'
    });
  } else {
    transporter = mailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '69271bffcbc1a9',
        pass: '754e9bb7253a62'
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
