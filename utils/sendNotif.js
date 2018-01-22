'use strict';
const request = require('request');
const configs = require('../config');


exports.send = (topic,message,to,metadata,callback)=>{

	// let options = {
	// 	method: 'POST',
	// 	url: 'https://gcm-http.googleapis.com/gcm/send',
	// 	headers: {
	// 		'Content-Type':'application/json',
	// 		'Authorization': 'key='+configs.GCM_API_KEY
	// 	},
	// 	body : JSON.stringify({ "data": {
			
	// 		"topic": topic,
	// 		"message": message,
	// 		"metadata": metadata
	// 	},
	// 	"to" : to
	// })
	// };

	// request.post(options,(error,response,body)=>{
	// 	console.log(error);
	// 	console.log(response.statusCode);
	// 	// console.log(response);

	// 	if (!error && response.statusCode == 200) {
    // 		callback(true); // Show the HTML for the Google homepage. 
	// 	}	
	// 	else
	// 		callback(false);

		
    // });
    callback(null,'notif sent');

};