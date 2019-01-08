var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Class = new Schema({
    id: {type: String, index: true,required:true},
    tutor_email:{type:String,required:true},
    student_email:{type:String, required:true},
    status:{type: String},
    scheduled_for:{type: Date, required:true},
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Class', Class);
