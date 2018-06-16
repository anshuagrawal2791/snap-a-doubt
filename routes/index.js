'use strict';

var path = process.cwd();
var userHandler = require('../handlers/userHandler');
var doubtHandler = require('../handlers/doubtHandler');
var tutorHandler = require('../handlers/tutorHandler');
var demoHandler = require('../handlers/demoHandler');
var questionHandler = require('../handlers/questionHandler');
var resultHandler = require('../handlers/resultHandler');
var blogHandler = require('../handlers/blogHandler');
const jwt = require('jsonwebtoken');
const url = require('url');
const multer = require('multer');
var storage = multer.memoryStorage();
var uploads = multer({ dest: 'uploads/' });
var Users = require('../models/users');
var Tutors = require('../models/tutors');
var configs = require('../config');
module.exports = (app, passport) => {
  app.use('/auth', passport.authenticate('jwt', {session: false}));
  app.use('/admin', verifyAdmin);
  app.get('/', (req, res) => {
    res.send('ok');
  });
  app.route('/signup')
    .post((req, res) => {
      userHandler.addUser(req, res);
    });

  app.post('/login',
    passport.authenticate('local', { session: false }),
    function (req, res) {
      if (!req.user) { return res.status(400).send(err); }
      res.send(userHandler.toAuthJSON(req.user));
    });
  app.post('/tokensignin',(req,res)=>{
    console.log('ond')
    if(!req.body.email||!req.body.token){
      return res.status(400).send('send email and token'); 
    }
    userHandler.tokenSignIn(req,res);
  });
  app.get('/auth/check_token', (req, res) => {
    res.send('valid token');
  });

  app.post('/auth/doubt', uploads.array('photos', 12), (req, res) => {
    console.log(req.files);
    console.log('insided /auth/doubt');
    doubtHandler.addDoubt(req, res);
  });
  app.post('/auth/demo',(req,res)=>{
    demoHandler.add(req,res);
  });
  app.post('/auth/feedback',(req,res)=>{
    if(!req.body.feedback)
    return res.status(400).send('enter feedback');
    userHandler.addFeedback(req,res);
  });
  app.get('/auth/sols',(req,res)=>{
    userHandler.getSols(req,res);
  });

  app.post('/admin/tutor/create', (req, res) => {
    tutorHandler.addTutor(req, res);
  });

  app.post('/tutor/solution/submit',uploads.array('solution', 12),verifyTutor,(req,res)=>{
      if(!req.files){
        return res.status(400).send('Please attach file');
      }
      if(!req.body.doubt_id)
      return res.status(400).send('enter doubt id');
      
      tutorHandler.submitSol(req,res);
  });
  app.post('/tutor/solution/verify',verifyLevelTwoTutor,(req,res)=>{
    //console.log(req);
    if(!req.body.sol_id)
    return res.status(400).send('enter solution id');
    if(typeof req.body.correct=='undefined' || req.body.correct=='')
    return res.status(400).send('enter if the solution is correct');
    tutorHandler.verifySol(req,res);
  });
  app.put('/auth/user',(req,res)=>{
    userHandler.updateUser(req,res);
  });
  app.post('/tutor/question',uploads.array('image', 12),verifyTutor,(req,res)=>{
    questionHandler.addQuestion(req,res);
  })
  app.post('/auth/get_modules',(req,res)=>{
    questionHandler.getModules(req,res);
  })
  app.post('/auth/get_questions',(req,res)=>{
    questionHandler.getQuestionsByModule(req,res);
  })
  app.post('/auth/result',(req,res)=>{
    resultHandler.addResult(req,res);
  })
  app.post('/blogs',(req,res)=>{
    blogHandler.getBlogs(req,res);
  })
  app.post('/blogs/add',uploads.array('image', 12),(req,res)=>{
    blogHandler.addBlog(req,res);
  })
};

var verifyAdmin = function (req, res, next) {
  if (req.body.admin_key) {
    var password = req.body.admin_key;
    if (password == configs.app.adminKey) {
      next();
    } else {
      res.status(403).send('unauthorized');
    }
  } else {
    res.status(403).send('unauthorized');
  }
};
var verifyTutor = function(req,res,done){
  //console.log(req.body);
  Tutors.findOne({email:req.body.email},function(err,tutor){
    //console.log(tutor);
    if (err) { res.status(403).send('unauthorized'); }
    if (!tutor) {
      return res.status(403).send('unauthorized');
    }
    if (req.body.password!=tutor.password) {
      return res.status(403).send('unauthorized');
    }
    req.user=tutor;
    return done(null, tutor);
  })
}
var verifyLevelTwoTutor = function(req,res,done){
  console.log(req.body);
  Tutors.findOne({email:req.body.email},function(err,tutor){
    console.log(tutor);
    if (err) { res.status(403).send('unauthorized'); }
    if (!tutor) {
      return res.status(403).send('unauthorized');
    }
    if (req.body.password!=tutor.password||tutor.level!=2) {
      return res.status(403).send('unauthorized');
    }
    req.user=tutor;
    return done(null, tutor);
  })
}
