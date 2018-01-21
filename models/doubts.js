var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var configs = require('../config');
var Doubt = new Schema({
  id: {type: String, index: true},
  question: String,
  subject:{type:String,enum:configs.app.subjects}, // TODO make an enum of allowed subjects
  image: {type: String},
  class: { type: Number, min: 1, max: 13 },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doubt', Doubt);
