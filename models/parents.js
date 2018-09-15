
'use strict';

const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SALT_WORK_FACTOR = 10;
var jwt = require('jsonwebtoken');
var secret = process.env.JWT_KEY;
const rand = require('csprng');
var crypto = require('crypto');
var configs = require('../config');
var Parent = new Schema({

  phone_number: String,
  email: { type: String, unique: true, index: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'] },
  password: { type: String,required:true},
  salt: String,
  fcm_token : {type : String},
  name: String,
  student:{type:String},
  address: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  modified_at: Date,
});

// Middlewares

Parent.pre('save', function (next) {
    var user = this;
    user.modified_at = new Date();
    if (!user.isModified('password')) return next();
    var temp = rand(160, 36);
    var newpass = temp + user.password;
    var hashed_password = crypto.createHash('sha512').update(newpass).digest('hex');
    user.salt = temp;
    user.password = hashed_password;
    next();
});
Parent.methods.generateJWT = function () {
    const token = jwt.sign({ id: this._id, email: this.email }, process.env.JWT_KEY);
    return token;
  };
Parent.methods.toAuthJSON = function () {
  return {
    email: this.email,
    password: this.password,
    name: this.name,
  };
};

module.exports = mongoose.model('Parent', Parent);
