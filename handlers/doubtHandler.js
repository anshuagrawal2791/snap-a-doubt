

var Doubts = require('../models/doubts');
var Users = require('../models/users');
const multer = require('multer');
const uploadToS3 = require('../utils/uploadToS3');
const fs = require('fs');
const path = require('path');
var Path = path.join(__dirname, '../uploads');
const shortid = require('shortid');
var configs = require('../config');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
const deleteFolderRecursive = require('../utils/deleteDirectoryContent');

module.exports = {
  addDoubt: (req, res) => {
    console.log('inside addDoubt ');
    var doubtId = shortid.generate();
    var fileId = doubtId + '-com-' + shortid.generate();
    // console.log('----------');
    // console.log(req.body);
    // console.log(req.files);
    if (req.files) {
      console.log('image uploaded with doubt');
      uploadToS3.upload(req.files[0], fileId, (err, message) => {
        if (err) {
          return res.status('400').send(err);
        }
        console.log('uploaded to s3 ' + JSON.stringify(message));

        saveDoubtToDb(req, res, doubtId, fileId);
      });
      deleteFolderRecursive.delete(Path, (found) => {
        console.log(found);
      });
    } else {
      saveDoubtToDb(req, res, doubtId, null);
    }
  }
};
saveDoubtToDb = (req, res, doubtId, fileId) => {
  var newDoubt = new Doubts({
    id: doubtId,
    question: req.body.question,
    subject: req.body.subject,
    class: req.user.class
  });
  if (fileId) { newDoubt.image = configs.aws.bucketBaseUri+fileId+'.jpg'; }
  newDoubt.save((err) => {
    if (err) { return res.status('400').send(err.errmsg); }
    console.log('newdoubt saved');
    Users.update(
      { _id: req.user },
      { $push: { doubts: doubtId } },
      (err) => {
        if (err) { return res.status('400').send(err.errmsg); }

        /// TODO send email to tutor

        res.json({ 'doubt': newDoubt, 'user': req.user });
      }
    );
  });
};
