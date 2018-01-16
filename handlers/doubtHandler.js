
var Doubts = require('../models/doubts');
var Users = require('../models/users');
const multer  = require('multer');
const uploadToS3  = require('../utils/uploadToS3');
const fs = require('fs');
const path = require('path');
var Path = path.join(__dirname,'../uploads');
const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
const deleteFolderRecursive = require('../utils/deleteDirectoryContent');

module.exports={
    addDoubt:(req,res)=>{
        

        console.log('inside addDoubt ');
        var doubtId = shortid.generate();
        var fileId = doubtId+'-com-'+shortid.generate();
        

        uploadToS3.upload(req.files[0],fileId,(err,message)=>{
            if(err)
            return res.status('400').send(err.errmsg);
            console.log('uploaded to s3 '+message);

            deleteFolderRecursive.delete(Path,(found)=>{
                console.log(found);
            });

            var newDoubt = new Doubts({
                id:doubtId,
                question:req.body.question,
                subject:req.body.subject,
                image:fileId
            });

            newDoubt.save((err)=>{
                if(err)
                return res.status('400').send(err.errmsg);
                console.log('newdoubt saved');
                Users.update(
                    { _id: req.user}, 
                    { $push: { doubts: doubtId } },
                    (err)=>{
                        if(err)
                        return res.status('400').send(err.errmsg);


                        /// TODO send email to tutor



                        res.json({'doubt':newDoubt,'user':req.user});
                    }
                );
            });
        });

    }
}