var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var configs = require('../config');
var SessionReport = new Schema({
  id: {type: String, index: true,required:true},
  student_email:{type:String, required:true},
  chapter_name:{type:String,required:true},
  homework:{type:String,required:true},
  start_time:{type: Date, required:true},
  end_time:{type: Date, required:true},
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SessionReport', SessionReport);
