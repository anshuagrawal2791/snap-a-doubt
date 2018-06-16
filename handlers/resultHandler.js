
var Results = require('../models/results');

const shortid = require('shortid');
var configs = require('../config');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

module.exports = {
    addResult : (req,res)=>{
        var resultId=shortid.generate();
        var userId = req.user.email;
        resps =[];
        ques=[];
        responses=JSON.parse(req.body.responses);
        questions=JSON.parse(req.body.questions)
        console.log(responses.length)
        for (i=0;i<responses.length;i++){
            console.log(i)
            resps.push(responses[i])
            ques.push(questions[i])
        }
        console.log(resps)
        var newResult = new Results({
         id:resultId,
         user_email : userId,
         module:req.body.module,
         total:req.body.total,
         attempted:req.body.attempted,
         correct:req.body.correct,
         questions:ques,
         responses:resps
        });
        newResult.save((err)=>{
            if(err)
            return res.status(400).send(err);
            res.json({'success':true,'result':newResult});
        })
    },
   

  
};



