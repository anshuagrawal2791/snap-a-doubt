var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var configs = require('../config');
var Question = new Schema({
  id: {type: String, index: true},
  class: { type: Number, min: 1, max: 13, required:true},
  module:{type:String,required:true},
  subject: {type: String, enum: configs.app.subjects,required:true}, // TODO make an enum of allowed subjects,
  type:{type:Number,required:true},
  question: {type:String,required:true},
  answer:{type:String,required:true},
  a:{type:String},
  b:{type:String},
  c:{type:String},
  d:{type:String},
  image_link: {type: String},
  tag1:{type:String},
  tag2:{type:String},
  meta:{type:String},
  publish_date:{type: Date,
    default: Date.now},
  
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', Question);
