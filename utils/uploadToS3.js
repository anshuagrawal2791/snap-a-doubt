var AWS = require('aws-sdk'),
  fs = require('fs'),
  path = require('path');
const shortid = require('shortid');
var proxy = require('proxy-agent');
require('dotenv').load();
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
var config = require('../config');

//AWS.config.loadFromPath(path.join(__dirname, '../aws-config.json'));
if (process.env.NODE_ENV !== 'dev'&&config.app.proxy) {
  // AWS.config.loadFromPath(path.join(__dirname, '../aws-config.json'));
  AWS.config.update({
    httpOptions: { agent: proxy('http://172.16.2.30:8080') }
  });
}
module.exports.upload = (file, fileName, callback) => {
  var s3 = new AWS.S3();
  fs.readFile(file.path, (err, data) => {
    if (err) { callback(err); } else {
      var params = { Bucket: config.aws.bucket, Key: fileName, Body: data };
      console.log('inside uploadtos3 params:---');
      console.log(params);

      s3.putObject(params, (err, data) => {
        console.log(err);
        console.log(data);
        if (err) { callback(err); } else {
          callback(null, data);
        }
      });
    }
  });
};
