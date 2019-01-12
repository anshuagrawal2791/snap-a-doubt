
var LecturePlans = require('../models/lecture_plans');
const uploadToS3 = require('../utils/uploadToS3');
const mailer = require('../utils/mailer');
const path = require('path');
var Path = path.join(__dirname, '../uploads');
const shortid = require('shortid');
var configs = require('../config');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
const deleteFolderRecursive = require('../utils/deleteDirectoryContent');
const NUM_IMAGES = 7
const IMAGES = ['image_introduction', 'image_hw_teachers', 'image_points', 'image_flow', 'image_helper', 'image_example', 'image_exercise']
module.exports = {
    getLec:(req,res)=>{
        if(!req.body.class||!req.body.subject)
        return res.status(400).send('fill all the details')
        LecturePlans.find({class:req.body.class,subject:req.body.subject},(err,resp)=>{
            if(err)
            return res.status(400).send(err)
            res.json(resp)
        })
    },
    getLecById:(req,res)=>{
        if(!req.body.lecture_plan_id)
        return res.status(400).send('please fill lecture id')
        LecturePlans.findOne({id:req.body.lecture_plan_id},(err,resp)=>{
            if(err)
            return res.status(400).send(err)
            return res.json(resp)
        })
    },
    addLecturePlan: (req, res) => {
        var lecId = 'LEC-' + shortid.generate()
        var newLec = new LecturePlans({
            id: lecId,
            created_by: req.user.email,
            lecture_name: req.body.lecture_name,
            class: req.body.class,
            subject: req.body.subject,
            description: req.body.description
        })
        var image_count = 0
        for (var i = 0; i < NUM_IMAGES; i++) {
            var cur_image_name = IMAGES[i]
            if (req.files[cur_image_name]) {
                image_count++
            }
        }
        if(image_count < NUM_IMAGES)
            return res.status(400).send('Upload all images');

        for (var i = 0; i < NUM_IMAGES; i++) {
            var cur_image_name = IMAGES[i]
            if (req.files[cur_image_name]) {
                var fileId = lecId + '-com-'+cur_image_name+'-'+ shortid.generate();
                newLec[cur_image_name]=configs.aws.bucketBaseUri + fileId + '.jpg';
                uploadToS3.upload(req.files[cur_image_name][0], fileId + '.jpg', (err, message) => {
                    if (err) {
                        final(null,null,err)
                    }
                    image_count--;
                    final(image_count,newLec,null)
                });
            }
        }
        final = (image_c,newLec,err)=>{
            if(err)
            return res.status(400).send(err)
            if (image_c==0){
                deleteFolderRecursive.delete(Path, (found) => {
                });
                newLec.save((err)=>{
                    if(err)
                    return res.status(400).send(err)
                    return res.json(newLec)
                })
                
            }

        }
        

    }
};


