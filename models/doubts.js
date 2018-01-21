var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Doubt = new Schema({
  id: {type: String, index: true},
  question: String,
  subject: String, // TODO make an enum of allowed subjects
  image: {type: String},
  class: { type: Number, min: 1, max: 13 },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doubt', Doubt);
