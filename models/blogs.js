var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var configs = require('../config');
var Blog = new Schema({
  id: {type: String, index: true,required:true},
  subject: {type: String, enum: configs.app.subjects,required:true}, // TODO make an enum of allowed subjects,
  class: { type: Number, min: 1, max: 13, required:true},
  title:{type:String,required:true},
  image_link: {type: String},
  description:{type:String,required:true},
  type:{type:Number,default:0},
  tags:{type:[String]},
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Blog', Blog);
