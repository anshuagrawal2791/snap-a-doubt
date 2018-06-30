var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var configs = require('../config');
var Request = new Schema({
  id: {type: String, index: true,required:true},
  type:{type: Number}, // type 1 for assigning student, type 2 for assigning class and subject
  tutor_email:{type:String,required:true},
  student_email:{type:String},
  tutor_classes:{type:[Number]},
  tutor_subject:{type: String, enum: configs.app.subjects},
  approved:{type:Boolean,default:false},
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Request', Request);
