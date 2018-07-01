var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var configs = require('../config');
var LecturePlan = new Schema({
  id: {type: String, index: true,required:true},
  class: { type: Number, min: 1, max: 13 ,required:true},
  subject: {type: String, enum: configs.app.subjects,required:true},
  lecture_name:{type:String,required:true},
  image_introduction : {type:String, required:true},
  image_hw_teachers : {type:String, required:true},
  image_flow:{type:String,required:true},
  image_helper:{type:String,required:true},
  image_example:{type:String,required:true},
  image_exercise:{type:String,required:true},
  image_points:{type:String,required:true},
  created_by : {type:String,required:true},
  created_at: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('LecturePlan', LecturePlan);
