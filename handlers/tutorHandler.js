
var Tutors = require('../models/tutors');
var Users = require('../models/users');
var configs = require('../config');
var jwt = require('jsonwebtoken');
const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
const uploadToS3 = require('../utils/uploadToS3');
const deleteFolderRecursive = require('../utils/deleteDirectoryContent');
var path = require('path')
var Path = path.join(__dirname, '../uploads');
var Sols = require('../models/sols');
var sendNotif = require('../utils/sendNotif');
const mailer = require('../utils/mailer');

module.exports = {

  addTutor: (req, res) => {
    var classes = JSON.parse(req.body.classes);
    var newTutor = new Tutors({
      phone_number: req.body.phone_number,
      email: req.body.email,
      level: req.body.level,
      name: req.body.name,
      subject: req.body.subject
    });
    for (let cl in classes) {
      newTutor.classes.push(classes[cl]);
    }
    newTutor.save((err) => {
      if (err) { return res.status(400).send(err); }
      res.send(newTutor.toAuthJSON());
    });
  },
  clearReceivedToday: () => {
    Tutors.update({ level: { $in: [0, 1, 2] } }, { $set: { received_today: 0, solved_today: 0 } }, { multi: true }, (err, numAffected) => {
      console.log(JSON.stringify(numAffected) + ' are updated');
    })
  },
  submitSol: (req, res) => {
    var solId = shortid.generate();
    var fileId = solId + '-com-' + shortid.generate();
    uploadToS3.upload(req.files[0], fileId + '.pdf', (err, message) => {
      if (err)
        return res.status(400).send(err);
      deleteFolderRecursive.delete(Path, (found) => {
      });
      saveSolToDb(req,res,solId,fileId);
      
    })

  },
  toAuthJSON: (tutor) => {
    return {
      email: user.email,
      password: user.password,
      name: user.name,
      solved_today: user.solved_today,
      last_posted: user.last_posted
    };
  }
};
saveSolToDb = (req,res,solId,fileId)=>{
  var newSol = new Sols({
    id:solId,
    doubtId:req.body.doubt_id,
    file:configs.aws.bucketBaseUri + fileId + '.pdf',
  });
  if(req.user.level==2)
  newSol.verified=true;
  newSol.save((err)=>{
    if(err)
    return res.status(400).send(err);
    if(req.user.level==2){
      Users.findOne({doubts:newSol.doubtId},{fcm_token:1},(err,user)=>{
        if(err)
        return res.status(400).send('doubt poster not found');
        sendNotif.send('Solution','Solution Posted for your doubt',user.fcm_token,newSol,(err,resp)=>{
          if(err)
          return res.status(400).send('could not send notification');
          updateSolInTutor(req,res,newSol,(err,resp)=>{
            if(err)
            return res.status(400).send(err);
            res.status(200).json({'newSol':newSol});
          });
          
        });
      });
      
    }else{
        sendForVerification(req,res,newSol,(err,resp)=>{
          if(err)
          return res.status(400).send(err);
          res.status(200).json({'verifier':resp,'newSol':newSol});
        });
    }
  });
}
sendForVerification=(req,res,sol,cb)=>{
  Tutors.findOne({
    subject:req.user.subject,
    classes:{$in:req.user.classes},
    level:2,
    available:true
  }).exec((err,tutor)=>{
    if(err||!tutor)
    return res.status(400).send('no tutor to verify');
    mailer.mail(tutor.email,{sol:sol},'Verifiy Solution',(err,resp)=>{
      if(err)
      return cb(err);
      cb(null,tutor)
      
    })
  })
}
updateSolInTutor=(req,res,sol,cb)=>{
  Tutors.update({email:req.user.email},
  {$push:{sols:sol.id},$inc:{solved_today:1},last_posted:new Date()},(err)=>{
    if(err)
    return cb(err);
    cb(null,'updated')
  })
}
