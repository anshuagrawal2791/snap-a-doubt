'use strict';

var express = require('express');
var routes = require('./routes/index.js');
const mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');
var config = require('./config.js');

var app = express();
require('dotenv').load();
require('./passport/strategies')(passport);



mongoose.connect(config.db.uri).then(()=>{
    console.log('db connected');
}).catch(console.log);


mongoose.Promise = global.Promise;
app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use(bodyParser.urlencoded({extended:false}));


app.use(passport.initialize());

routes(app, passport);


var port = config.app.port;
app.listen(port,  function () {
    
	console.log('Node.js listening on port ' + port + '...');
});
