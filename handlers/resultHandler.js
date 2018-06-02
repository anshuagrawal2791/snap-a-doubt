
var Results = require('../models/results');

const shortid = require('shortid');
var configs = require('../config');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

module.exports = {
    addResult : (req,res)=>{
        var resultId=shortid.generate();
        var userId = req.user.email;
        var newResult = new Results({
         id:resultId,
         user_email : userId,
         module:req.body.module,
         total:req.body.total,
         attempted:req.body.attempted,
         correct:req.body.correct
        });
        newResult.save((err)=>{
            if(err)
            return res.status(400).send(err);
            res.json({'success':true,'result':newResult});
        })
    },
   

  
};



