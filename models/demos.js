var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var configs = require('../config');
var Demo = new Schema({
    id:{type:String,index:true},
  user_id:{type:String,index:true},
  number_of_students:{type:Number,required:true},
  class: { type: Number, min: 1, max: 13 },
  board:{type:String,required:true},
  school:{type:String,required:true},
  remarks:{type:String,required:true},
    name_of_primary_student:{type:String,required:true},
    address:{type:String,required:true},
    landmark:{type:String,required:true},
    longitude:{type:Number,required:true},
    latitude:{type:Number,required:true},
    accuracy:{type:Number,required:true},
    meta:{type:String,required:true}



});

module.exports = mongoose.model('Demos', Demo);
