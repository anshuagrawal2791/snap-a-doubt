
var Users = require('../models/users');
var Sols = require('../models/sols');
var config = require('../config');
var jwt = require('jsonwebtoken');
var Doubts = require('../models/doubts');
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

    if (req.body.referral_code) {
      Users.findOne({ referral_code: req.body.referral_code }, (err, user) => {
        if (!err && user) {
          user.points += config.app.referralReward1;
          user.save((err) => {
            console.log(err);
          });
          newUser.points += config.app.referralReward2;
          saveUserToDb(req, res, newUser);
        } else {
          saveUserToDb(req, res, newUser);
        }
      });
    } else {
      saveUserToDb(req, res, newUser);
    }
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
      user.save((err) => {
        if (err)
          return res.status(400).send(err);
        res.send(user.toAuthJSON());
      });
    })
  },
  addFeedback: (req, res) => {
    Users.update({ email: req.user.email }, { $push: { feedbacks: req.body.feedback } }, (err) => {
      if (err)
        return res.status(400).send(err);
      res.json({ 'user': req.user });
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
  }
};
saveUserToDb = (req, res, newUser) => {
  newUser.save((err) => {
    if (err) { return res.status('400').send(err.errmsg); }
    res.send(newUser.toAuthJSON());
  });
};
