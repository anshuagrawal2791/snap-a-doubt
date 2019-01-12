var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var configs = require('../config');
var Post = new Schema({
  id: {type: String, index: true,required:true},
  student_email:{type:String, required:true},
  subject: {type: String, enum: configs.app.subjects,required:true}, // TODO make an enum of allowed subjects,
  comment:{type:String,required:true},
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', Post);
