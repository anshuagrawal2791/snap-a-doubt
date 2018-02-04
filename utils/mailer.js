const mailer = require('nodemailer');
const configs = require('../config');
module.exports.mail = (recipient, data,subject, cb) => {
  console.log('inside mailer ');
  var transporter;
  if (process.env.NODE_ENV == 'test'&&configs.app.proxy) {
    console.log('insdide proxy')
    transporter = mailer.createTransport({
      host: configs.app.emailHost,
      port: 465,
      secure:true,
      auth: {
        user: configs.app.emailId,
        pass: configs.app.emailPassword
      },
      proxy: 'http://172.16.2.30:8080'
    });
   // return cb(null,{'message':'sent to '+recipient,'data':data});
  } else {
    transporter = mailer.createTransport({
      host: configs.app.emailHost,
      port: 465,
      secure:true,
      auth: {
        user: configs.app.emailId,
        pass: configs.app.emailPassword
      }
    });
  }
  // to test
  recipient='anshuagrawal2791@gmail.com';
  var mailOptions = {
    from: 'support@vegatva.com',
    to: recipient,
    subject: subject,
    text: JSON.stringify(data)
  };
  console.log(recipient);
  transporter.sendMail(mailOptions, function (error, info) {
    console.log('inside send mail')
    console.log(error);
    console.log(info);
    if (error) {
      return cb(error, null);
    } else {
      return cb(null, info);
    }
  });
};
