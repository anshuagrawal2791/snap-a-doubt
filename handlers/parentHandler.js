
var Parents = require('../models/parents');
var Users = require('../models/users');
var Sols = require('../models/sols');
var config = require('../config');
var jwt = require('jsonwebtoken');
var Doubts = require('../models/doubts');
module.exports = {

  addParent: (req, res) => {
    var newUser = new Parents({
      phone_number: req.body.phone_number,
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      address: req.body.address,
      fcm_token: req.body.fcm_token

    });
    saveUserToDb(req,res,newUser)
  },
  updateFcm: (req)=>{
    req.user.fcm_token = req.body.fcm_token
    req.user.save()
  },
  updateParent: (req, res) => {
    Parents.findOne({ email: req.user.email }, (err, user) => {
      if (err)
        return res.status(400).send(err);
      if (!user)
        return res.status(400).send('no user found');
      if (req.body.fcm_token) user.fcm_token = req.body.fcm_token;
      if (req.body.name) user.name = req.body.name;
      if (req.body.phone_number) user.phone_number= req.body.phone_number;
      if (req.body.address) user.address = req.body.address;
      if (req.body.password)user.password=req.body.password;
      user.save((err) => {
        if (err)
          return res.status(400).send(err);
        res.send(user.toAuthJSON());
      });
    })
  },
  assign_student: (req,res)=>{
    Parents.findOne({email:req.body.parent_id},(err,parent)=>{
        if(err)
            return res.status(400).send(err)
        if(!parent)
            return res.status(400).send('parent not found')
        Users.findOne({email:req.body.student_id},(err,student)=>{
            if(err)
                return res.status(400).send(err)
            if(!student)
                return res.status(400).send('student not found')
            parent.student = req.body.student_id
            parent.save((err)=>{
                if(err)
                    return res.status(400).send(err)
                return res.send('successfully saved')
            })
        })
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
      name: user.name,
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
