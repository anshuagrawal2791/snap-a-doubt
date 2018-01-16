'use strict';

var path = process.cwd();
var userHandler = require('../handlers/userHandler');
var doubtHandler = require('../handlers/doubtHandler');
const jwt = require('jsonwebtoken');
const url = require('url');
const multer  = require('multer');
var storage = multer.memoryStorage();
var uploads = multer({ dest: 'uploads/' });

module.exports = (app, passport) => {

    app.use('/auth',passport.authenticate('jwt',{session:false}));

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


    app.get('/auth/check_token',(req,res)=>{
        res.send('valid token');
    });

    app.post('/auth/doubt',uploads.array('photos',12),(req,res)=>{
        console.log(req.files); 
        console.log('insided /auth/doubt');
        doubtHandler.addDoubt(req,res);
    });
}