
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
      uploadToS3.upload(req.files[0], fileId + '.jpg', (err, message) => {
        if (err) {
          return res.status('400').send(err);
        }
        deleteFolderRecursive.delete(Path, (found) => {
        });
        saveDoubtToDb(req, res, doubtId, fileId);
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

    // send doubt to tutor
    findAndSendToTutor(newDoubt, (err, resp) => {
      if (err) { return res.status('400').send(err); }

      updateDoubtInUser(req,res,newDoubt);
      
    });


  });
};
updateDoubtInUser = (req,res,doubt)=>{
  Users.update(
    { _id: req.user },
    { $push: { doubts: doubt.id } },
    (err) => {
      if (err) { return res.status('400').send(err.errmsg); }
      res.json({ 'doubt': doubt, 'user': req.user });
    }
  );
}
findAndSendToTutor = (doubt, cb) => {
  Tutors.findOne({
    subject: doubt.subject,
    classes: doubt.class,
    solved_today: { $lt: configs.app.dailySolutionLimit },
    received_today: { $lt: configs.app.dailySolutionLimit },
    level: { $gt: 0 },
    available: true
  }).sort('level').exec((err, tutor) => {
    if (err) {
      return cb(err, null);
    }
    if (tutor) {
      mailer.mail(tutor.email,{doubt:doubt},'New Doubt', (err, resp) => {
        if (err) { return cb(err); }
        tutor.received_today += 1;
        tutor.last_received = new Date();
        var tutorDoubts = tutor.doubts;
        tutorDoubts.push(doubt.id);
        tutor.doubts = tutorDoubts;

        tutor.save((err) => {
          if (err)
            return cb(err, null);
          cb(null, resp);
        })
      });
    } else {
      // send to default tutor
      Tutors.findOne({ level: 0 }, (err, tutor2) => {
        if (err || !tutor2) {
          return cb(err, null);
        }
        mailer.mail(tutor2.email, {doubt:doubt},'New Doubt', (err, resp) => {
          if (err) { return cb(err); }
          tutor2.received_today += 1;
          tutor2.last_received = new Date();
          var tutorDoubts = tutor.doubts;
          tutorDoubts.push(doubt.id);
          tutor.doubts = tutorDoubts;
          tutor2.save((err) => {
            if (err)
              return cb(err, null);
            cb(null, resp);
          })
        });
      });
    }
  });
};
