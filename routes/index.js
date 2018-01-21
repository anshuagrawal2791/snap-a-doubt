'use strict';

var path = process.cwd();
var userHandler = require('../handlers/userHandler');
var doubtHandler = require('../handlers/doubtHandler');
var tutorHandler = require('../handlers/tutorHandler');
const jwt = require('jsonwebtoken');
const url = require('url');
const multer = require('multer');
var storage = multer.memoryStorage();
var uploads = multer({ dest: 'uploads/' });
var Users = require('../models/users');
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

  app.get('/auth/check_token', (req, res) => {
    res.send('valid token');
  });

  app.post('/auth/doubt', uploads.array('photos', 12), (req, res) => {
    console.log(req.files);
    console.log('insided /auth/doubt');
    doubtHandler.addDoubt(req, res);
  });

  app.post('/admin/tutor/create', (req, res) => {
    tutorHandler.addTutor(req, res);
  });
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
