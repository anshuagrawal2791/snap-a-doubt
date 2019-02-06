var Requests = require('../models/requests')
var Tutors = require('../models/tutors')
const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
const mailer = require('../utils/mailer');
const configs = require('../config');
var sendNotif = require('../utils/sendNotif');


module.exports = {
    approve: (req, res) => {
        if (!req.body.reqId)
            return res.status(400).send('enter request id')
        Requests.findOne({ id: req.body.reqId }, (err, request) => {
            if (err)
                return res.status(400).send(err)
            if (!request)
                return res.status(400).send('no request found')
            if(request.approved)
                return res.status(400).send('already approved')
            if (request.type == 1) {
                assignStudentToTutor(req, res, request)
            } else if (request.type == 2) {
                addClassesAndSubject(req,res, request)
            } else {
                return res.status(400).send('invalid request')
            }
        })
    },
    get_requests: (req, res) => {
        let perPage = 10, page=0;
        if(req.body.nPerPage)
            perPage = req.body.nPerPage;
        if(req.body.page)
            page = Math.max(page, req.body.page);
        Requests.find({},{},{skip: perPage*page, limit:perPage*1, sort:{created_at:'desc'}}, (err, requests) => {
            if (err)
                return res.status(400).send(err)

            return res.status(400).json({'requests': requests, 'page': page, 'nPerPage':perPage});

        })
    },

}
assignStudentToTutor = (req, res, request) => {
    Tutors.update({ email: request.tutor_email }, { $addToSet: { students: request.student_email } }, (err, resp) => {
        if (err)
            return res.status(400).send(err)
        request.approved = true;
        request.save((err) => {
            if (err)
                return res.status(400).send(err)
            Tutors.findOne({email:request.tutor_email},(err,tutor)=>{
                sendNotif.send('Request Approved', 'Student added to your account', tutor.fcm, null, (err, resp) => {
                    if (err){
                        console.log(err)
                    }
                    return res.status(200).json({'resp':resp,'err':err,'tutor':tutor,'success':true});
                });
            })
            
            
        })
    })
}
addClassesAndSubject = (req,res,request)=>{
    Tutors.update({email:request.tutor_email},{$addToSet:{classes:{$each:request.tutor_classes}},$set:{subject:request.tutor_subject}},(err,resp)=>{
        if (err)
            return res.status(400).send(err)
        request.approved = true
        request.save((err) => {
            if (err)
                return res.status(400).send(err)
            Tutors.findOne({email:request.tutor_email},(err,tutor)=>{
                sendNotif.send('Request Approved', 'Student added to your account', tutor.fcm, null, (err, resp) => {
                    if (err){
                        console.log(err)
                        return res.status(400).json({'error':err,'tutor':tutor,'success':true});
                    }
                    return res.status(400).json({'resp':resp,'tutor':tutor,'success':true});
                });
            })
        })
    })
}