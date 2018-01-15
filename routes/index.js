'use strict';

var path = process.cwd();
var userHandler = require('../handlers/userHandler');
const jwt = require('jsonwebtoken');
const url = require('url');


module.exports = (app, passport) => {

    app.get('/', (req, res) => {
        res.send('ok');
    })
    app.route('/signup')
        .post((req, res) => {
            userHandler.addUser(req, res);
        });

    app.post('/login',
        passport.authenticate('local', { session: false }),
        function (req, res) {
            console.log(req.user);
            var payLoad = {};
            payLoad.id=req.user._id;
            payLoad.email=req.user.email;
            console.log(payLoad);
            const token = jwt.sign(payLoad, process.env.JWT_KEY);
            // console.log(req.user);
            if (!req.user)
                res.send(err);
            res.json({ 'token': token });
        });


    app.get('/auth/check_token',passport.authenticate('jwt', { session: false }),(req,res)=>{
        res.send('valid token')
    });
}