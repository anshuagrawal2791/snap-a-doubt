
var Doubts = require('../models/doubts');
var Users = require('../models/users');
var Tutors = require('../models/tutors');
const uploadToS3 = require('../utils/uploadToS3');
const mailer = require('../utils/mailer');
const path = require('path');
var Path = path.join(__dirname, '../uploads');
const shortid = require('shortid');
var configs = require('../config');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
const deleteFolderRecursive = require('../utils/deleteDirectoryContent');

module.exports = {
  addDoubt: (req, res) => {
    var doubtId = shortid.generate();
    var fileId = doubtId + '-com-' + shortid.generate();
    if (req.files) {
      uploadToS3.upload(req.files[0], fileId, (err, message) => {
        if (err) {
          return res.status('400').send(err);
        }
        saveDoubtToDb(req, res, doubtId, fileId);
      });
      deleteFolderRecursive.delete(Path, (found) => {
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
  if (fileId) { newDoubt.image = configs.aws.bucketBaseUri + fileId + '.jpg'; }
  newDoubt.save((err) => {
    if (err) { return res.status('400').send(err.errmsg); }
    console.log('newdoubt saved');
    Users.update(
      { _id: req.user },
      { $push: { doubts: doubtId } },
      (err) => {
        if (err) { return res.status('400').send(err.errmsg); }

        /// TODO send email to tutor
        findAndSendToTutor(newDoubt, (err, tutor) => {
          if (err) { return res.status('400').send(err); }
          res.json({ 'doubt': newDoubt, 'tutor': tutor});
        });
      }
    );
  });
};
findAndSendToTutor = (doubt, cb) => {
  Tutors.findOne({
    subject: doubt.subject,
    classes: doubt.class,
    solved_today: {$lt: configs.app.dailySolutionLimit},
    received_today:{$lt: configs.app.dailySolutionLimit},
    level: {$gt: 0},
    available: true
  }).sort('level').exec((err, tutor) => {
    if (err) {
      return cb(err, null);
    }
    if (tutor) {
      console.log(tutor);
      mailer.mail(tutor.email, doubt, (err, resp) => {
        if (err) { return cb(err); }
        tutor.received_today+=1;
        tutor.save((err)=>{
            if(err)
            return cb(err,null);
            cb(null, resp);
        })
        
        // cb(null,tutor);
      });
    } else {
      Tutors.findOne({level: 0}, (err, tutor2) => {
        mailer.mail(tutor2.email, doubt, (err, resp) => {
          if (err) { return cb(err); }
          tutor2.received_today+=1;
        tutor2.save((err)=>{
            if(err)
            return cb(err,null);
            cb(null, resp);
        })
          // cb(null,tutor2);
        });
      });
    }
  });
};
