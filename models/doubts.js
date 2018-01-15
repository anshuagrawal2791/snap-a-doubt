var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Doubt = new Schema({
    
    question: String,
    subject: String,   // TO


    phone_number: Number,
    email: { type: String, unique: true },
    password: { type: String, required: true },
    salt: String,
    name: String,
    class: { type: Number, min: 1, max: 13 },
    school: String,
    city: String,
    parent_name: String,
    alternate_phone_number: String,
    pin_code: Number,
    address: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    modified_at: Date,
    questions: {type: [String]},   // store the ids of questions
    verified: { type: Boolean, default: false }
});

module.exports = mongoose.model('Doubt', Doubt);
