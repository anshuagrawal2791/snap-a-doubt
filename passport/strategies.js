'use strict';

var User = require('../models/users');
var Parents = require('../models/parents');
var Tutors = require('../models/tutors');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const config = require('../config');
module.exports = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function (username, password, done) {
    User.findOne({ email: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!validPassword(password, user)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
  ));
  passport.use('parent', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function (username, password, done) {
    Parents.findOne({ email: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!validPassword(password, user)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
  ));
  passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_KEY
  },
  function (jwtPayload, cb) {
    // console.log('inside jwt passport ');
    // console.log(jwtPayload.email);
    return User.findOne({ email: jwtPayload.email })
      .then(user => {
        return cb(null, user);
      })
      .catch(err => {
        return cb(err);
      });
  }
  ));
  passport.use('parent_jwt', new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_KEY
  },
  function (jwtPayload, cb) {
    // console.log('inside jwt passport ');
    // console.log(jwtPayload.email);
    return Parents.findOne({ email: jwtPayload.email })
      .then(parent => {
        return cb(null, parent);
      })
      .catch(err => {
        return cb(err);
      });
  }
  ));
  passport.use('tutor',new LocalStrategy({
    usernameField:'email',
    passwordField:'password'
  },function(username,password,done){
    console.log('here');
    Tutors.findOne({email:username},(err,tutor)=>{
      if (err) { return done(err); }
      if (!tutor) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (password!=tutor.password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, tutor);
    })
  }));

  function validPassword (password, user) {
    let temp = user.salt;
    let hash_db = user.password;
    let newpass = temp + password;
    let hashed_password = crypto.createHash('sha512').update(newpass).digest('hex');
    return hashed_password == hash_db;
  }
};
