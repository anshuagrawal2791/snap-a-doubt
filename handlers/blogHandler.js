
var Blogs = require('../models/blogs');

const shortid = require('shortid');
var configs = require('../config');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
const uploadToS3 = require('../utils/uploadToS3');
const mailer = require('../utils/mailer');
const path = require('path');
var Path = path.join(__dirname, '../uploads');
const deleteFolderRecursive = require('../utils/deleteDirectoryContent');

module.exports = {
    getBlogs : (req,res)=>{
        if(!req.body.class)
            return res.status(400).send('provide class')
        if(req.body.subject){
            Blogs.find({class:req.body.class,subject:req.body.subject},(err,resp)=>{
                if(err){
                    return res.status(400).send(err)
                }else{
                    res.send(resp)
                }
            })
        }else{
            Blogs.find({class:req.body.class},(err,resp)=>{
                if(err){
                    return res.status(400).send(err)
                }else{
                    res.send(resp)
                }
            })
        }
    },
    addBlog:(req,res)=>{
        if(!req.body.subject||!req.body.class||!req.body.title||!req.body.description)
            return res.status(400).send("fill all the required fields")
        var blogId = shortid.generate();
        var fileId = blogId+'-com-'+shortid.generate();
        if(req.files.length>0){ // check if image is there to upload
            uploadToS3.upload(req.files[0], fileId + '.jpg', (err, message) => {
                if (err) {
                  return res.status(400).send(err);
                }
                deleteFolderRecursive.delete(Path, (found) => {
                });
                saveBlogToDb(req, res, blogId,fileId);
              });
        
        }else{
            saveBlogToDb(req, res,blogId,null);

        }
    }
   

  
};
saveBlogToDb=(req,res,blogId,fileId)=>{
    var newBlog = new Blogs({
        id:blogId,
        class:req.body.class,
        subject:req.body.subject,
        title:req.body.title,
        description:req.body.description,
        
    })
    
    if(req.body.type){
        newBlog.type=req.body.type
    }
    if(req.body.tags){
        tags = JSON.parse(req.body.tags)
        t=[]
        for(i=0;i<tags.length;i++)
            t.push(tags[i])
        newBlog.tags=t;
    }
    if(fileId){newBlog.image_link = configs.aws.bucketBaseUri+fileId+'.jpg'}
    console.log(newBlog)

    newBlog.save((err)=>{
        console.log('here')
        if(err){
            console.log(err)
            return res.status('400').send(err);
        }
        console.log('new blogsaved');
        res.json({'blog':newBlog,'success':'true'})
    })
}



