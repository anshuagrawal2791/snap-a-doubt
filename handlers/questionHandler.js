
var Questions = require('../models/questions');
// var Users = require('../models/users');
// var Tutors = require('../models/tutors');
const uploadToS3 = require('../utils/uploadToS3');
const mailer = require('../utils/mailer');
const path = require('path');
var Path = path.join(__dirname, '../uploads');
const shortid = require('shortid');
var configs = require('../config');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
const deleteFolderRecursive = require('../utils/deleteDirectoryContent');

module.exports = {
    addQuestion : (req,res)=>{
        var questionId=shortid.generate();
        var fileId = questionId + '-com-' + shortid.generate();
        console.log('here')
        if(req.files.length>0&&(req.body.type==2||req.body.type==4)){ // check if image is there to upload
            uploadToS3.upload(req.files[0], fileId + '.jpg', (err, message) => {
                if (err) {
                  return res.status(400).send(err);
                }
                deleteFolderRecursive.delete(Path, (found) => {
                });
                saveQuestionToDb(req, res, questionId, fileId);
              });
        
        }else{
            saveQuestionToDb(req, res, questionId,null);

        }
    },
    getModules :(req,res)=>{
        if(!req.body.class||!req.body.subject)
        return res.status(400).send('provide all parameters');
        Questions.find({class:req.body.class,subject:req.body.subject},(err,resp)=>{
            if(err)
            return res.status(400).send(err);
            var mods =[];
            for(response in resp)
                mods.push(resp[response].module);
            res.send(mods);
        })
    },
    getQuestionsByModule:(req,res)=>{
        if(!req.body.module)
        return res.status(400).send('please provide module number')
        Questions.find({module:req.body.module},(err,resp)=>{
            if(err)
            return res.status(400).send(err);
            res.send(resp);
        })
    }

  
};
saveQuestionToDb=(req,res,questionId,fileId)=>{
    var newQuestion= new Questions({
        id:questionId,
        class:req.body.class,
        module:req.body.module,
        subject:req.body.subject,
        type:req.body.type,
        question:req.body.question,
        answer:req.body.answer,
        a:req.body.a,
        b:req.body.b,
        c:req.body.c,
        d:req.body.d,
        tag1:req.body.tag1,
        tag2:req.body.tag2,
        meta:req.body.meta,
        
    })
    if(fileId){newQuestion.image_link = configs.aws.bucketBaseUri+fileId+'.jpg'}
    console.log(newQuestion)

    newQuestion.save((err)=>{
        console.log('here')
        if(err){
            console.log(err)
            return res.status('400').send(err);
        }
        console.log('new question saved');
        res.json({'question':newQuestion,'success':'true'})
    })
}


