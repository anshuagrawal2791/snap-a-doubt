
var Tutors = require('../models/tutors');
var config = require('../config');
var jwt = require('jsonwebtoken');
module.exports = {

    addTutor: (req, res) => {
        var classes = JSON.parse(req.body.classes);
        var newTutor = new Tutors({
            phone_number: req.body.phone_number,
            email: req.body.email,
            level: req.body.level,
            name: req.body.name,
            subject:req.body.subject
        });
        for (let cl in classes) {
            newTutor.classes.push(classes[cl]);
        }
        newTutor.save((err)=>{
            if(err)
            return res.status(400).send(err);
            res.send(newTutor.toAuthJSON());
        })
    },
    toAuthJSON: (tutor) => {
        return {
            email: user.email,
            password: user.password,
            name: user.name,
            solved_today: user.solved_today,
            last_posted: user.last_posted
        };
    }
};

