const mailer = require('nodemailer');
const configs = require('../config');
module.exports.mail = (recipient, data,subject, cb) => {
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
    return cb(null,{'message':'sent to '+recipient,'data':data});
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
    subject: subject,
    text: JSON.stringify(data)
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
