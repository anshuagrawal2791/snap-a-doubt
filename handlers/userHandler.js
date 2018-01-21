
var Users = require('../models/users');
var config = require('../config');
var jwt = require('jsonwebtoken');
module.exports = {

    addUser: (req, res) => {

        // var points= (req.body.referral_code)?config.app.referralReward2:0; // TODO update user value
        var newUser = new Users({
            phone_number: req.body.phone_number,
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            class: req.body.class,
            school: req.body.school,
            city: req.body.city,
            parent_name: req.body.parent_name,
            alternate_phone_number: req.body.alternate_phone_number,
            pin_code: req.body.pin_code,
            address: req.body.address,
            points: 0,
            gcm_token: req.body.gcm_token

        });


        if (req.body.referral_code) {
            Users.findOne({ referral_code: req.body.referral_code }, (err, user) => {
                if (!err && user) {
                    user.points += config.app.referralReward1;
                    user.save((err) => {
                        console.log(err);
                    });
                    newUser.points += config.app.referralReward2;
                    saveUserToDb(req, res, newUser);
                }
                else {
                    saveUserToDb(req, res, newUser);
                }
            })
        } else {
            saveUserToDb(req, res, newUser);
        }

    },
    saveUserToDb: (req, res, newUser) => {
        newUser.save((err) => {
            if (err)
                return res.status('400').send(err.errmsg);
            Users.findOne({ email: newUser.email }, (err, user) => {
                if (err)
                    res.status('400').send(err.errmsg);
                res.send(newUser.toAuthJSON());
            });

        });
    },
    toAuthJSON: (user) => {
        return {
            email: user.email,
            token: user.generateJWT(user),
            image: user.image,
            name: user.name,
            referral_code: user.referral_code,
            points: user.points
        }

    },
    generateJWT: (user) => {
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_KEY);
        return token;
    }
}