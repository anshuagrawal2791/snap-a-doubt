var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var configs = require('../config');
var Result = new Schema({
  id: {type: String, index: true,required:true},
  user_email:{type:String,index:true,required:true},
  module:{type:Number, required:true},
  total:{type:Number,required:true},
  attempted:{type:Number,required:true},
  correct:{type:Number,required:true},
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', Result);
