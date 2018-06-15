
var Blogs = require('../models/blogs');

const shortid = require('shortid');
var configs = require('../config');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

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
   

  
};



