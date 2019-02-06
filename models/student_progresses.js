var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var configs = require('../config');
var StudentProgress = new Schema({
    id: {type: String, index: true,required:true},
    student_email:{type:String,index:true,required:true},
    chapter_name:{type:String,required:true},
    status:{type:String,required:true},
    subject: {type: String, enum: configs.app.subjects,required:true},
    created_at: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('StudentProgress', StudentProgress);
