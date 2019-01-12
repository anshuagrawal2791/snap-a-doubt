
var Users = require('../models/users');
var Sols = require('../models/sols');
var config = require('../config');
var jwt = require('jsonwebtoken');
var Doubts = require('../models/doubts');
var Classes = require('../models/classes');
const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
const mailer = require('../utils/mailer');
const uploadToS3 = require('../utils/uploadToS3');
const deleteFolderRecursive = require('../utils/deleteDirectoryContent');
const path = require('path');
var Path = path.join(__dirname, '../uploads');
var sendNotif = require('../utils/sendNotif');


module.exports = {

  addUser: (req, res) => {
    // var points= (req.body.referral_code)?config.app.referralReward2:0; // TODO update user value
    var newUser = new Users({
      phone_number: req.body.phone_number,
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      class: req.body.class,
      school: req.body.school,
      city: req.body.city,
      parent_name: req.body.parent_name,
      alternate_phone_number: req.body.alternate_phone_number,
      pin_code: req.body.pin_code,
      address: req.body.address,
      points: 0,
      fcm_token: req.body.fcm_token

    });
    saveUserToDb(req,res,newUser)
  },
  tokenSignIn: (req,res) => {
    Users.findOne({'email':req.body.email},(err,user)=>{
      if(err)
      return res.status(400).send(err);
      if(!user){
        return res.status(200).json({'resp':'new user'});
      }else{
        return res.json({'resp':'user exists','user':user.toAuthJSON()});
      }
    });
  },
  getSols: (req, res) => {
    // Sols.find({doubtId:{$in:req.user.doubts},verified:true},(err,sols)=>{
    //   if(err)
    //   return res.status(400).send(err);
    //   res.send(sols);
    // })
    var userDoubts = req.user.doubts;
    var resp = [];
    var errOccured;
    var processed = 0;
    var total = userDoubts.length;
    for (var i = 0; i < userDoubts.length; i++) {
      var doubtId = userDoubts[i];

      Doubts.findOne({ id: doubtId }, (err, doubt) => {
        if (err) {
          errOccured = err;
          checkDone();
        }
        else {
          var cur = {};
          cur.doubt = doubt;
          Sols.find({ 'doubtId': doubt.id, verified: true }, (err, sols) => {
            if (err) {
              errOccured = err;
              checkDone();
            }
            else {
              cur.sols = sols;
              resp.push(cur);
              checkDone();
            }
          });
        }
      });
    }
    var checkDone = () => {
      processed++;
      if (processed == total) {
        if (errOccured)
          return res.status(400).send(errOccured);
        res.send(resp);
      }
    }

  },
  updateUser: (req, res) => {
    Users.findOne({ email: req.user.email }, (err, user) => {
      if (err)
        return res.status(400).send(err);
      if (!user)
        return res.status(400).send('no user found');
      if (req.body.fcm_token) user.fcm_token = req.body.fcm_token;
      if (req.body.name) user.name = req.body.name;
      if (req.body.phone_number) user.phone_number= req.body.phone_number;
      if (req.body.class) user.class = req.body.class;
      if (req.body.school) user.school = req.body.school;
      if (req.body.city) user.city = req.body.city;
      if (req.body.parent_name) user.parent_name = req.body.parent_name;
      if (req.body.alternate_phone_number) user.alternate_phone_number = req.body.alternate_phone_number;
      if (req.body.pin_code) user.pin_code = req.body.pin_code;
      if (req.body.address) user.address = req.body.address;
      if (req.body.password)user.password=req.body.password;
      if(req.files.length>0){ // check if image is there to upload
          let fileId = user.id+'-com-'+shortid.generate();
          uploadToS3.upload(req.files[0], fileId + '.jpg', (err, message) => {
              if (err) {
                  return res.status(400).send(err);
              }
              deleteFolderRecursive.delete(Path, (found) => {
              });
              user.image = config.aws.bucketBaseUri+fileId+'.jpg'
              user.save((err) => {
                  if (err)
                      return res.status(400).send(err);
                  res.send(user.toAuthJSON());
              });
          });

      }else{
        user.save((err) => {
          if (err)
              return res.status(400).send(err);
          res.send(user.toAuthJSON());
        });
      }

    })
  },
  addFeedback: (req, res) => {
    Users.update({ email: req.user.email }, { $push: { feedbacks: req.body.feedback } }, (err) => {
      if (err)
        return res.status(400).send(err);
      mailer.mail(config.app.emailId,{feedback:req.body.feedback, user: req.user},'New Feedback', (err, resp) => {
        console.log(resp)
        console.log(err)
        res.json({ 'user': req.user });
      });
    })
  },
  toAuthJSON: (user) => {
    return {
      email: user.email,
      token: user.generateJWT(user),
      image: user.image,
      name: user.name,
      referral_code: user.referral_code,
      points: user.points,
      all_details: user
    };
  },
  generateJWT: (user) => {
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_KEY);
    return token;
  },
  scheduleClass: (req, res)=>{
    user = req.user
    if(!req.body.tutor_email)
        return res.status(400).send('missing tutor email');
    if(!req.body.scheduled_for)
        return res.status(400).send('missing scheduled date');

    try{
        var scheduled_date = new Date(req.body.scheduled_for)
    }catch (e) {
        return res.status(400).send(e);
    }
    var newClass = new Classes({
        id:'CLASS-' + shortid.generate(),
        student_email: user.email,
        tutor_email: req.body.tutor_email,
        scheduled_for: scheduled_date
    });
    newClass.save((err)=>{
        if(err)
            return res.status(400).send(err);
        return res.status(200).json({'class': newClass})
    })
  },
  sendClassNotifications: ()=>{
    console.log('sending class notifications')
    var cur_time = new Date()
    var one_hour_later = new Date()
    one_hour_later.setHours(one_hour_later.getHours() + 1);
    Classes.find({scheduled_for: {$gte: cur_time, $lte: one_hour_later}}, (err, classes)=>{
      classes.forEach((klass)=>{
        Users.findOne({email: klass.student_email}, (err, student)=>{
          if(err) {
            console.log(err)
            return;
          }
          sendNotif.send('Class Reminder', 'Your class is about to start', student.fcm, null, (err, resp) => {
            if (err){
              console.log('error sending notification to: '+ student.email)
              console.log(err)
            }else
              console.log('notification sent to: '+ student.email)
          });
        })
      })
    })
  }

};
saveUserToDb = (req, res, newUser) => {
  newUser.save((err) => {
    if (err) { return res.status('400').send(err.errmsg); }
    addRewards(req,res,newUser)
    res.send(newUser.toAuthJSON());
  });
};
addRewards = (req,res,newUser)=>{
  if (req.body.referral_code) {
    Users.findOne({ referral_code: req.body.referral_code }, (err, user) => {
      if (!err && user) {
        user.points += config.app.referralReward1;
        user.save((err) => {
          console.log(err);
        });
        newUser.points += config.app.referralReward2;
        newUser.save((err)=>{
          console.log(err)
        });
      } else {
        newUser.save((err)=>{
          console.log(err)
        });
      }
    });
  } else {
    newUser.save((err)=>{
      console.log(err)
    });
  }
}
