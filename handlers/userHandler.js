
var Users = require('../models/users');

module.exports={
    addUser:(req,res)=>{
        var newUser = new Users({
            phone_number:req.body.phone_number,
            email:req.body.email,
            password:req.body.password,
            name:req.body.name,
            class:req.body.class,
            school:req.body.school,
            city:req.body.city,
            parent_name:req.body.parent_name,
            alternate_phone_number:req.body.alternate_phone_number,
            pin_code:req.body.pin_code,
            address:req.body.address,

        });

        newUser.save((err)=>{
            if(err)
            return res.status('400').send(err.errmsg);
            Users.findOne({email:newUser.email},(err,user)=>{
                res.send(newUser.toAuthJSON());
            })
            
        })
    }
}