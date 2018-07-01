
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
    addLecturePlan: (req, res) => {
        console.log(req.files)

        var lecId = 'LEC-' + shortid.generate()
        var newLec = new LecturePlans({
            id: lecId,
            created_by: req.user.email,
            lecture_name: req.body.lecture_name,
            class: req.body.class,
            subject: req.body.subject
        })
        var image_count = 0
        for (var i = 0; i < NUM_IMAGES; i++) {
            var cur_image_name = IMAGES[i]
            if (req.files[cur_image_name]) {
                image_count++
            }
        }
        console.log(image_count)
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
            console.log('image count now is '+image_c)
            if (image_c==0){
                deleteFolderRecursive.delete(Path, (found) => {
                });
                return res.json(newLec)
            }

        }
        

    }
};


