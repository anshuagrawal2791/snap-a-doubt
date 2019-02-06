var Tutors = require('../models/tutors');
var Users = require('../models/users');
var Parents = require('../models/parents');
var Requests = require('../models/requests');
var TestResults = require('../models/test_results');
var SessionReports = require('../models/session_reports');
var WallPosts = require('../models/wall_posts');
var StudentProgresses = require('../models/student_progresses');
var configs = require('../config');
var jwt = require('jsonwebtoken');
const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
const uploadToS3 = require('../utils/uploadToS3');
const deleteFolderRecursive = require('../utils/deleteDirectoryContent');
var path = require('path')
var Path = path.join(__dirname, '../uploads');
var Sols = require('../models/sols');
var sendNotif = require('../utils/sendNotif');
const mailer = require('../utils/mailer');
const rand = require('csprng');
module.exports = {
    login: (req, res) => {
        Tutors.findOne({email: req.user.email}, function (err, tutor) {
            //console.log(tutor);
            if (err) {
                res.status(403).send('unauthorized');
            }
            if (!tutor) {
                return res.status(403).send('no tutor found');
            }
            if (req.body.fcm) {
                tutor.fcm = req.body.fcm
            }
            tutor.save((err) => {
                if (err) {
                    return res.status(400).send('error while saving fcm token')
                }
                return res.json(tutor)
            })
        })
    },
    update: (req, res) => {
        if (req.body.phone_number)
            req.user.phone_number = req.body.phone_number;
        if (req.body.new_password)
            req.user.password = req.body.new_password
        if (req.body.fcm)
            req.user.fcm = req.body.fcm;
        if (req.body.name)
            req.user.name = req.body.name;

        if (req.files.length > 0) { // check if image is there to upload
            let fileId = req.user.id + '-com-' + shortid.generate();
            uploadToS3.upload(req.files[0], fileId + '.jpg', (err, message) => {
                if (err) {
                    return res.status(400).send(err);
                }
                deleteFolderRecursive.delete(Path, (found) => {
                });
                req.user.image = configs.aws.bucketBaseUri + fileId + '.jpg'
                req.user.save((err) => {
                    if (err) {
                        res.status(403).send(err);
                    }
                    return res.json(req.user)
                })
            });

        } else {
            req.user.save((err) => {
                if (err) {
                    res.status(403).send(err);
                }
                return res.json(req.user)
            })
        }
    },
    assign_student: (req, res) => {
        if (!req.body.student_email)
            return res.send('please enter student email')
        Users.findOne({email: req.body.student_email}, (err, user) => {
            if (err)
                return res.status(400).send(err)
            if (!user)
                return res.status(400).send('no student found')
            else {
                var reqId = 'REQ-1-' + shortid.generate()
                var newReq = new Requests({
                    id: reqId,
                    type: 1,
                    student_email: req.body.student_email,
                    tutor_email: req.user.email
                });
                newReq.save((err) => {
                    if (err)
                        return res.status(400).send('error creating request')
                    return res.json(newReq)
                })
            }
        })
    },
    assign_classes_and_subject: (req, res) => {
        if (!req.body.classes)
            return res.status(400).send('please enter classes')
        if (!req.body.subject)
            return res.status(400).send('please enter subject')
        var reqId = 'REQ-2-' + shortid.generate()
        var newReq = new Requests({
            id: reqId,
            type: 2,
            tutor_email: req.user.email,
            tutor_subject: req.body.subject
        })
        var classes = JSON.parse(req.body.classes);
        for (let cl in classes) {
            newReq.tutor_classes.push(classes[cl])
        }
        newReq.save((err) => {
            if (err)
                return res.status(400).send(err)
            return res.json(newReq)
        })
    },
    get_students: (req, res) => {
        Tutors.findOne({email: req.user.email}, (err, tutor) => {
            if (err)
                return res.status(400).send(err);
            student_emails = tutor.students;
            Users.find({email: tutor.students}, 'name email class', (err, students) => {
                if (err)
                    return res.status(400).send(err);
                return res.json({'students': students});
            });
        })
    },
    addSessionReport: (req, res) => {
        if (!req.body.student_email || !req.body.start_time || !req.body.end_time || !req.body.chapter_name || !req.body.homework)
            return res.status(400).send('please fill all the details');
        const tutor = req.user;
        if (!tutor.students.includes(req.body.student_email))
            return res.status(403).send('not authorized to submit this student\'s data. Assign student first');
        try {
            var start_time = new Date(req.body.start_time);
            var end_time = new Date(req.body.end_time);
        } catch (e) {
            return res.status(400).send(e);
        }
        if (start_time > end_time)
            return res.status(400).send('start time cannot be greater than end time');
        var newSessionReport = new SessionReports({
            id: 'SESSION-REPORT-' + shortid.generate(),
            student_email: req.body.student_email,
            chapter_name: req.body.chapter_name,
            homework: req.body.homework,
            start_time: start_time,
            end_time: end_time
        });

        newSessionReport.save((err) => {
            if (err)
                return res.status(400).send(err)
            Parents.findOne({student: req.body.student_email}, (err, parent) => {
                if (parent && parent.fcm_token) {
                    sendNotif.send('Session Report', 'New session report posted for your child', parent.fcm_token, newSessionReport, (err, resp) => {
                        console.log(resp);
                        console.log(err)
                    });
                }
            });
            Users.findOne({email: req.body.student_email}, (err, student) => {
                if (student && student.fcm_token)
                    sendNotif.send('Session Report', 'New session report posted for you', student.fcm_token, newSessionReport, (err, resp) => {
                        console.log(resp);
                        console.log(err);
                    });
            });
            res.json(newSessionReport)

        })

    },
    addStudentWallPost: (req, res) => {
        tutor = req.user;
        if (!req.body.student_email || !req.body.subject || !req.body.comment)
            return res.status(400).send('please fill all the details');
        if (!tutor.students.includes(req.body.student_email))
            return res.status(403).send('not authorized to submit this student\'s data. Assign student first');

        var newWallPost = new WallPosts({
            id: 'WALL-POST-' + shortid.generate(),
            student_email: req.body.student_email,
            subject: req.body.subject,
            comment: req.body.comment,
        });

        newWallPost.save((err) => {
            if (err)
                return res.status(400).send(err)
            Parents.findOne({student: req.body.student_email}, (err, parent) => {
                if (parent && parent.fcm_token) {
                    sendNotif.send('Wall Post', 'New wall post posted for your child', parent.fcm_token, newWallPost, (err, resp) => {
                        console.log(resp);
                        console.log(err)
                    });
                }
            });
            Users.findOne({email: req.body.student_email}, (err, student) => {
                if (student && student.fcm_token)
                    sendNotif.send('Wall Post', 'New wall post posted for you', student.fcm_token, newWallPost, (err, resp) => {
                        console.log(resp);
                        console.log(err);
                    });
            });
            res.json(newWallPost)
        })

    },
    addStudentProgress: (req, res)=>{
        tutor = req.user;
        if (!req.body.student_email || !req.body.subject || !req.body.status || !req.body.chapter_name)
            return res.status(400).send('please fill all the details');
        if (!tutor.students.includes(req.body.student_email))
            return res.status(403).send('not authorized to submit this student\'s data. Assign student first');

        var newStudentProgress = new StudentProgresses({
            id: 'STUD-PROG-' + shortid.generate(),
            student_email: req.body.student_email,
            subject: req.body.subject,
            status: req.body.status,
            chapter_name: req.body.chapter_name
        });

        newStudentProgress.save((err) => {
            if (err)
                return res.status(400).send(err)
            Parents.findOne({student: req.body.student_email}, (err, parent) => {
                if (parent && parent.fcm_token) {
                    sendNotif.send('Student Progress', 'New progress posted for your child', parent.fcm_token, newStudentProgress, (err, resp) => {
                        console.log(resp);
                        console.log(err)
                    });
                }
            });
            Users.findOne({email: req.body.student_email}, (err, student) => {
                if (student && student.fcm_token)
                    sendNotif.send('Student Progress', 'New progress posted for you', student.fcm_token, newStudentProgress, (err, resp) => {
                        console.log(resp);
                        console.log(err);
                    });
            });
            res.json(newStudentProgress)
        })

    },
    submit_test: (req, res) => {
        if (!req.body.score || !req.body.total || !req.body.retention_rate || !req.body.student_email || !req.body.subject)
            return res.status(400).send('please fill all the details')
        if (!req.user.students.includes(req.body.student_email))
            return res.status(403).send('not authorized to submit this student\'s data. Assign student first')
        var testId = 'TEST-' + shortid.generate()
        var newTestRes = new TestResults({
            id: testId,
            student_email: req.body.student_email,
            score: req.body.score,
            total: req.body.total,
            retention_rate: req.body.retention_rate,
            subject: req.body.subject
        });
        newTestRes.save((err) => {
            if (err)
                return res.status(400).send(err)
            Parents.findOne({student: req.body.student_email}, (err, parent) => {
                if (err)
                    return res.status(400).send(err)
                else {
                    if (parent && parent.fcm_token) {
                        sendNotif.send('Test Result', 'New test result posted for your child', parent.fcm_token, newTestRes, (err, resp) => {
                            console.log(resp)
                            console.log(err)
                            res.json(newTestRes)
                        });
                    }
                    else {
                        res.json(newTestRes)
                    }
                }

            })
        })

    },
    get_tests: (req, res) => {
        TestResults.find({student_email: {$in: req.user.students}}, (err, resp) => {
            if (err)
                return res.status(400).send(err)
            res.json(resp)
        })
    },
    addTutor: (req, res) => {
        var classes = JSON.parse(req.body.classes);
        var newTutor = new Tutors({
            phone_number: req.body.phone_number,
            email: req.body.email,
            level: req.body.level,
            name: req.body.name,
            subject: req.body.subject,
            password: rand(24, 24)
        });
        for (let cl in classes) {
            newTutor.classes.push(classes[cl]);
        }
        newTutor.save((err) => {
            if (err) {
                return res.status(400).send(err);
            }
            res.send(newTutor.toAuthJSON());
        });
    },
    clearReceivedToday: () => {
        console.log('clearing received today')
        Tutors.update({level: {$in: [0, 1, 2]}}, {
            $set: {
                received_today: 0,
                solved_today: 0,
                verfied_today: 0
            }
        }, {multi: true}, (err, numAffected) => {
            console.log(JSON.stringify(numAffected) + ' are updated');
        })
    },
    submitSol: (req, res) => {
        var solId = shortid.generate();
        var fileId = solId + '-com-' + shortid.generate();
        uploadToS3.upload(req.files[0], fileId + '.pdf', (err, message) => {
            if (err)
                return res.status(400).send(err);
            deleteFolderRecursive.delete(Path, (found) => {
            });
            saveSolToDb(req, res, solId, fileId);

        })

    },
    verifySol: (req, res) => {
        var solId = req.body.sol_id;
        Sols.findOne({id: solId}, (err, sol) => {
            if (err)
                return res.status(400).send(err);
            if (req.body.correct == 'true') {
                sol.verified = true;
                sol.save((err) => {
                    if (err)
                        return res.status(400).send(err);
                    Users.findOne({doubts: sol.doubtId}, {fcm_token: 1}, (err, user) => {
                        if (err)
                            return res.status(400).send('doubt poster not found');
                        sendNotif.send('Solution', 'Solution Posted for your doubt', user.fcm_token, sol, (err, resp) => {
                            if (err)
                                return res.status(400).send(err);
                            Tutors.update({email: req.user.email},
                                {$push: {verified_sols: solId}, $inc: {verified_today: 1}}, (err) => {
                                    if (err)
                                        return res.status(400).send(err);
                                    res.status(200).send(sol);
                                })
                        });
                    });
                })
            } else {
                sol.verified = false;
                sol.save((err) => {
                    if (err)
                        return res.status(400).send(err);
                    Tutors.findOne({sols: solId}, (err, tutor) => {
                        if (err)
                            return res.status(400).send(err);
                        else if (!tutor) {
                            return res.status(400).send('couldn\'t find tutor who solved this');
                        }
                        else {
                            mailer.mail(tutor.email, {
                                sol: sol,
                                'remarks': req.body.remarks
                            }, 'Solution Rejected', (err, resp) => {
                                if (err)
                                    return res.status(400).send(err)
                                res.json({'sentTo: ': tutor, 'sol': sol});

                            })
                        }
                    });
                })

            }
        })
    },
    toAuthJSON: (tutor) => {
        return {
            email: user.email,
            password: user.password,
            name: user.name,
            solved_today: user.solved_today,
            last_posted: user.last_posted
        };
    }
};
saveSolToDb = (req, res, solId, fileId) => {
    var newSol = new Sols({
        id: solId,
        doubtId: req.body.doubt_id,
        file: configs.aws.bucketBaseUri + fileId + '.pdf',
    });
    if (req.user.level == 2) newSol.verified = true;
    newSol.save((err) => {
        if (err)
            return res.status(400).send(err);
        if (req.user.level == 2) {
            Users.findOne({doubts: newSol.doubtId}, {fcm_token: 1}, (err, user) => {
                if (err)
                    return res.status(400).send('doubt poster not found');
                sendNotif.send('Solution', 'Solution Posted for your doubt', user.fcm_token, newSol, (err, resp) => {
                    if (err)
                        return res.status(400).send(err);
                    updateSolInTutor(req, res, newSol, (err, resp) => {
                        if (err)
                            return res.status(400).send(err);
                        res.status(200).json({'newSol': newSol});
                    });

                });
            });

        } else {
            sendForVerification(req, res, newSol, (err, resp1) => {
                if (err)
                    return res.status(400).send(err);
                updateSolInTutor(req, res, newSol, (err, resp) => {
                    if (err)
                        return res.status(400).send(err);
                    res.status(200).json({'verifier': resp1, 'newSol': newSol});
                })

            });
        }
    });
}
sendForVerification = (req, res, sol, cb) => {
    Tutors.findOne({
        subject: req.user.subject,
        classes: {$in: req.user.classes},
        level: 2,
        available: true,
        verified_today: {$lt: configs.app.dailyVerificationLimit}
    }).sort('verified_today').exec((err, tutor) => {
        if (err)
            return res.status(400).send(err);
        else if (tutor) {
            mailer.mail(tutor.email, {sol: sol}, 'Verifiy Solution', (err, resp) => {
                if (err)
                    return cb(err);
                cb(null, tutor)

            })
        } else {
            console.log('no verifier found');
            Tutors.findOne({level: 0}, (err, tutor2) => {
                if (err || !tutor2) {
                    return cb(err, null);
                }
                mailer.mail(tutor2.email, {sol: sol}, 'Verify Solution', (err, resp) => {
                    if (err) {
                        return cb(err);
                    }
                    cb(null, tutor2);
                });
            });
        }

    })
}
updateSolInTutor = (req, res, sol, cb) => {
    Tutors.update({email: req.user.email},
        {$push: {sols: sol.id}, $inc: {solved_today: 1}, last_posted: new Date()}, (err) => {
            if (err)
                return cb(err);
            cb(null, 'updated')
        })
}
