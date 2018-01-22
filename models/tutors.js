
'use strict';

const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var jwt = require('jsonwebtoken');
var secret = process.env.JWT_KEY;
const rand = require('csprng');
var crypto = require('crypto');
var configs = require('../config');
var Tutor = new Schema({

  phone_number: String,
  email: { type: String, unique: true, index: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'] },
  password: { type: String,default:rand(24,24)},
  level: {type: Number, required: true},
  solutions: {type: [String]},
  name: String,
  classes: { type: [Number]},
  last_posted: {type:Date,default:new Date()},
  solved_today: {type: Number, default: 0},
  received_today:{type:Number,default:0},
  last_received:{type:Date,default:new Date()},
  created_at: {
    type: Date,
    default: Date.now
  },
  sols:{type:[String]},
  doubts:{type:[String]},
  modified_at: Date,
  subject: {type: String, enum: configs.app.subjects},
  available: {type: Boolean, default: true}
});

// Middlewares

Tutor.pre('save', function (next) {
  var user = this;
  user.modified_at = new Date();
  next();
});

Tutor.methods.toAuthJSON = function () {
  return {
    email: this.email,
    password: this.password,
    name: this.name,
    solved_today: this.solved_today,
    last_posted: this.last_posted
  };
};

module.exports = mongoose.model('Tutor', Tutor);
