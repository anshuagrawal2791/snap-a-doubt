var Demos = require('../models/demos');
const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
const mailer = require('../utils/mailer');
const configs = require('../config');


module.exports = {
    add: (req, res) => {
        // console.log(req.user);
        var newDemo = new Demos({
            id: shortid.generate(),
            user_email: req.user.email,
            number_of_students: req.body.number_of_students,
            class: req.body.class,
            board: req.body.board,
            school: req.body.school,
            remarks: req.body.remarks,
            name_of_primary_student: req.body.name_of_primary_student,
            address: req.body.address,
            landmark: req.body.landmark,
            longitude: req.body.longitude,
            latitude: req.body.latitude,
            accuracy: req.body.accuracy,
            meta: req.body.meta,
            phone: req.body.phone
        });
        newDemo.save((err) => {
            if (err)
                return res.status('400').send(err);
            mailer.mail(configs.app.emailId, { demo: newDemo }, 'New Demo Booking', (err, resp) => {
                if (err) { return res.status(400).send(err); }
                mailer.mail(req.user.email, configs.app.demoBookingMessage, 'New Demo Booking', (err, resp) => {
                    if (err) { return res.status(400).send(err); }
                    res.send("booking done");
                });
            });
        });
    },
    bookDemoByAdmin: (req, res)=>{
        if(!req.body.tutor_email)
            return res.status(400).send('tutor email is required')
      var newDemo = new Demos({
        id: shortid.generate(),
        user_email: configs.app.emailId,
        number_of_students: req.body.number_of_students,
        class: req.body.class,
        board: req.body.board,
        school: req.body.school,
        remarks: req.body.remarks,
        name_of_primary_student: req.body.name_of_primary_student,
        address: req.body.address,
        landmark: req.body.landmark,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        accuracy: req.body.accuracy,
        meta: req.body.meta,
        phone: req.body.phone,
        assigned_to: req.body.tutor_email
      });
      newDemo.save((err) => {
        if (err)
          return res.status('400').send(err);
        mailer.mail(configs.app.emailId, { demo: newDemo }, 'New Demo Booking', (err, resp) => {
          if (err) { return res.status(400).send(err); }
          mailer.mail(req.body.tutor_email, configs.app.demoBookingMessage, 'New Demo Booking', (err, resp) => {
            if (err) { return res.status(400).send(err); }
            res.send("booking done");
          });
        });
      });
    }
}