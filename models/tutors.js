
'use strict';

const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var jwt = require('jsonwebtoken');
var secret = process.env.JWT_KEY;
const rand = require('csprng');
var crypto = require('crypto');

var Tutor = new Schema({


  phone_number: String,
  email: { type: String, unique: true, index: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'] },
  password: { type: String},
  level:{type:Number,required:true},
  solutions:{type:[String]},
  name: String,
  classes: { type: [Number]},
  last_posted:Date,
  solved_today:{type:Number, default:0},
  created_at: {
    type: Date,
    default: Date.now
  },
  modified_at:Date,
  subject:String,
  available:{type:Boolean,default:true}
});

// Middlewares

Tutor.pre('save', function (next) {
  var user = this;
  user.modified_at = new Date();
  user.password=rand(24, 24);
  next();
});


Tutor.methods.toAuthJSON = function () {
  return {
    email: this.email,
    password:this.password,
    name: this.name,
    solved_today:this.solved_today,
    last_posted:this.last_posted
  };
};

module.exports = mongoose.model('Tutor', Tutor);
