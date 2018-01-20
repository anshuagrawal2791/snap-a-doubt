

'use strict';

const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var jwt = require('jsonwebtoken');
var secret = process.env.JWT_KEY;
const rand = require('csprng');
var crypto = require('crypto');

var User = new Schema({
    phone_number: String,
    email: { type: String, unique: true, index: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'] },
    password: { type: String, required: true },
    salt: String,
    name: String,
    class: { type: Number, min: 1, max: 13 },
    school: String,
    city: String,
    parent_name: String,
    alternate_phone_number: String,
    pin_code: Number,
    address: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    referral_code:String,
    points:{type:Number, default:0},
    gcm_token:{type:String,required:true},
    modified_at: Date,
    image: { type: String, default: 'http://static.bleacherreport.net/images/redesign/avatars/default-user-icon-profile.png' }, // TODO update this
    doubts: { type: [String] },   // store the ids of questions
    verified: { type: Boolean, default: false }
});

//Middlewares


// to encrypt password
User.pre('save', function (next) {

    var user = this;
    user.modified_at = new Date();
    if (!user.isModified('password')) return next();
    var temp = rand(160, 36);
    var newpass = temp + user.password;
    var hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");
    user.salt = temp;
    user.password = hashed_password;
    user.referral_code= rand(24,24);
    next();
});

// // to validate password
User.methods.validate = (candidatePassword, cb) => {
    var user = this;
    let temp = user.salt;
    let hash_db = user.password;
    let newpass = temp + candidatePassword;
    let hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");
    cb(null, hashed_password == hash_db);
}


User.methods.generateJWT = function () {
    const token = jwt.sign({ id: this._id, email: this.email }, process.env.JWT_KEY);
    return token;
};

User.methods.toAuthJSON = function () {
    return {
        email: this.email,
        token: this.generateJWT(),
        image: this.image,
        name: this.name,
        referral_code : this.referral_code
    }
};

module.exports = mongoose.model('User', User);
