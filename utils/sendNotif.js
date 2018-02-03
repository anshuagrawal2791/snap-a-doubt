'use strict';
const request = require('request');
const configs = require('../config');
const FCM = require('fcm-node');
var proxy = require('proxy-agent');
exports.send = (topic, message, to, metadata, callback) => {

	var serverKey = configs.app.fcmKey;
	var fcm = new FCM(serverKey);
	to = (to)?to:'e-OsECZjhHU:APA91bEjQG-psv3O0mCJrkKeWOdFsjAfFMFYlBrTXK0wqHWoZoVTnP9Re3g_eGQjLcBULEIQLJTEMllWjTPP9YbtocFqlfret9DCZHwpMcnkQPiUZhem26E6rDqW2__xarITFSNpconC';
	var message = {
		'to': to,
		"data": {
			"topic": topic,
			"message": message,
			"metadata": metadata
		},
		
	}
	console.log('sending notif');
	fcm.send(message,(err,resp)=>{
		if(err)
			return callback(err);
		callback(null,resp);
	});

};