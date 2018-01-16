    AWS = require('aws-sdk'),
    fs = require('fs'),
    path = require('path');
const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
var config = require('../config');
AWS.config.loadFromPath(path.join(__dirname,'../aws-config.json'));
module.exports.upload = function (file, fileName, callback) {
    var s3 = new AWS.S3();
    var result = {
        error: 0,
        uploaded: []
    }
    fs.readFile(file.path, function (err, data) {
        if (err)
            callback(err);
        else {
            var params = { Bucket: config.aws.bucket, key: fileName + '.jpg', body: data };
            console.log('inside uploadtos3 params: '+params);

            // uncomment this

            // s3.putObject(params, function (err, data) {
            //     if (err)
            //         callback(err)
            //     else {
            //         callback(null,data.ETag);
            //     }
            // });

            // comment this out
            callback(null,"uploaded");
        }
    })
}
