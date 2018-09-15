var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var configs = require('../config');
var TestResult = new Schema({
  id: {type: String, index: true,required:true},
  student_email:{type:String,index:true,required:true},
  score:{type:Number,required:true},
  total:{type:Number,required:true},
  retention_rate:{type:String,required:true},
  subject: {type: String, enum: configs.app.subjects},
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TestResult', TestResult);
