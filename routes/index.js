'use strict';

var path = process.cwd();
var userHandler = require('../handlers/userHandler');
var doubtHandler = require('../handlers/doubtHandler');
var tutorHandler = require('../handlers/tutorHandler');
var demoHandler = require('../handlers/demoHandler');
var questionHandler = require('../handlers/questionHandler');
var resultHandler = require('../handlers/resultHandler');
var blogHandler = require('../handlers/blogHandler');
var reqHandler = require('../handlers/requestHandler');
var lecturePlanHandler = require('../handlers/lecturePlanHandler');
var parentHandler = require('../handlers/parentHandler');
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
  app.use('/parent-auth', passport.authenticate('parent_jwt', {session: false}));
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
  app.put('/auth/user',uploads.array('image', 12), (req,res)=>{
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
  app.post('/tutor/login',verifyTutor,(req,res)=>{
    tutorHandler.login(req,res)
  })
  app.post('/tutor/update', uploads.array('image', 12),verifyTutor,(req,res)=>{
    tutorHandler.update(req,res)
  })
  app.post('/tutor/assign_student',verifyTutor,(req,res)=>[
    tutorHandler.assign_student(req,res)
  ])
  app.post('/tutor/assign_classes_and_subject',verifyTutor,(req,res)=>{
    tutorHandler.assign_classes_and_subject(req,res)
  })
  app.post('/admin/approve',verifyAdmin,(req,res)=>[
    reqHandler.approve(req,res)
  ])
  app.post('/tutor/get_students',verifyTutor,(req,res)=>{
    tutorHandler.get_students(req,res)
  })
  app.post('/tutor/submit_test',verifyTutor,(req,res)=>{
    tutorHandler.submit_test(req,res)
  })
  app.post('/tutor/get_tests',verifyTutor,(req,res)=>{
    tutorHandler.get_tests(req,res)
  })
  app.post('/tutor/lecture_plan/create',uploads.fields([{
    name: 'image_introduction', maxCount: 1
  }, {
    name: 'image_hw_teachers', maxCount: 1
  },{
    name: 'image_flow', maxCount: 1
  },{
    name: 'image_helper', maxCount: 1
  },{
    name: 'image_points', maxCount: 1
  },{
    name: 'image_exercise', maxCount: 1
  },{
    name: 'image_example', maxCount: 1
  }]),verifyTutor,(req,res)=>{
    lecturePlanHandler.addLecturePlan(req,res)
  })
  app.post('/tutor/get_lecture_plan',verifyTutor,(req,res)=>{
    lecturePlanHandler.getLec(req,res)
  })
  app.post('/tutor/get_lecture_plan_by_id',verifyTutor,(req,res)=>{
    lecturePlanHandler.getLecById(req,res)
  })
  app.post('/parent/register',(req,res)=>{
    parentHandler.addParent(req,res)
  })
  app.post('/parent/login',
    passport.authenticate('parent', { session: false }),
    function (req, res) {
      if (!req.user) { return res.status(400).send(err); }
      if (req.body.fcm_token){
        parentHandler.updateFcm(req)
      }
      res.send(parentHandler.toAuthJSON(req.user));
    });
  app.get('/parent-auth/check_token', (req, res) => {
    res.send(req.user);
  })
  app.post('/parent-auth/update',(req,res)=>{
    parentHandler.updateParent(req,res)
  })
  app.post('/admin/assign-student-to-parent',verifyAdmin,(req,res)=>[
    parentHandler.assign_student(req,res)
  ])
  app.post('/auth/schedule-class',(req,res)=>{
    userHandler.scheduleClass(req,res)
  })
  app.post('/tutor/session-report', verifyTutor, (req, res)=>{
    tutorHandler.addSessionReport(req, res);
  })
  app.post('/tutor/wall-post', verifyTutor, (req, res)=>{
    tutorHandler.addStudentWallPost(req, res);
  })
  app.post('/wall-posts/', passport.authenticate('parent-or-tutor', {session: false}), (req,res)=> {
    userHandler.getWallPosts(req, res)
  })
  app.post('/admin/demo', verifyAdmin,(req,res)=>{
    demoHandler.bookDemoByAdmin(req, res)
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
