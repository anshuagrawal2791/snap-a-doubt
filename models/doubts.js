var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Doubt = new Schema({
    id: {type:String,index:true},
    question: String,
    subject: String,   // TODO make and enum of allowed subjects
    image: {type:String}

});

module.exports = mongoose.model('Doubt', Doubt);
