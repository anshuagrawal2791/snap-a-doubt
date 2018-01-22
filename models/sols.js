var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var configs = require('../config');
var Sol = new Schema({
  id: {type: String, index: true},
  doubtId: {type:String,required:true},
  file: {type: String,required:true},
  created_at: {
    type: Date,
    default: Date.now
  },
  remarks:String,
  verified :{type:Boolean,default:false}
});

module.exports = mongoose.model('Sol', Sol);
