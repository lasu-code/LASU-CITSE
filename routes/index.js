const path = require('path');
const express = require('express');
const router = express.Router();
const passport = require("passport");
const multer = require("multer");
const fse = require('fs-extra');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require("bcrypt-nodejs");

let User = require('../models/users');
let News = require('../models/news');
let Slider = require('../models/slider');
let Page = require('../models/page');
let Contact = require('../models/contact');
let Settings = require('../models/settings');

let controller = require('../controllers/frontendControllers')
let mailController = require('../controllers/mailControllers');
let n = require('../config/cmsNav');
const keys = require("../config/keys");
global.usrInfo = {};
let oldImage = '';

// HANDLE IMAGES
// -----
// Set multer storage config
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
})
// Set multer runtime options
const multerOpts = {
    storage: storage,
    //limits: {fileSize: 10},
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}
//check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Get ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error Occured: Upload Images Only!'))
    }
}
// Multer execute
const upload = multer(multerOpts);


// AUTH MIDDLEWARE, HELPER FUNCTIONS
// -----
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated() || req.user) {
        global.usrInfo.pos = req.user.position;
        global.usrInfo.name = req.user.name;

        return next()
    } else {
        console.error('Login to continue')
        req.flash('error', 'Login to continue!')
        res.redirect('/login')
    }
}

function adminLoggedIn(req, res, next) {
    if (req.isAuthenticated() && req.user.position == "head") {
        global.usrInfo.pos = req.user.position;
        global.usrInfo.name = req.user.name;

        return next()
    } else {
        console.error('Login to continue')
        req.flash('error', 'Permission denied!')
        res.redirect('/dashboard')
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get old image path
async function getOldImage(req, res, next) {
    oldImage = await Page.findOne({ tag: req.params.tag.trim() })
    return next()
}
async function getOldSliderImage(req, res, next) {
    if (oldImage != null) {
        oldImage = await Slider.findOne({ _id: isUpdate })
    }
    return next();
}

// remove old uploaded image
function removeOldImage() {
    if (oldImage) {
        fse.remove('\public' + oldImage.postImage)
            .catch(err => {
                console.error(err)
            })
    }
}


// DASHBOARD ROUTES
// -----
// Access Control
router.get('/login', function (req, res, next) {
    let success = req.flash('success');
    let error = req.flash('error')

    res.render('backend/login', { success, error })
})

router.post('/login/admin', passport.authenticate('local.loginAdmin', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}))

router.get('/signup', function (req, res, next) {
    res.render('backend/signup')
})

router.get('/logout', function (req, res, next) {
    req.logout();
    global.usrInfo = {};
    res.redirect('/login');
})

router.get('/dashboard', isLoggedIn, function (req, res, next) {
    res.render('backend/dashboard');
});

// router.get('/dashboard/speech', isLoggedIn,(req, res, next)=>{
//     res.render('backend/speech', {})
// })

// -----
// Admin
router.get('/dashboard/authorizeadmins', adminLoggedIn, function (req, res, next) {
    User.find({ }).then((result) => {
        if (result) {
            res.render('backend/authorize', { result })
        } else {
            res.render('backend/authorize')
        }
    })
})

router.post('/createAccount', function (req, res, next) {
    let newUser = new User();

    newUser.name = req.body.name;
    newUser.email = req.body.email;
    newUser.password = newUser.generateHash(req.body.password);
    newUser.position = req.body.position;

    newUser.save().then((result) => {
        if (result) {
            res.redirect('/dashboard/authorizeadmins')
        } else if (!result) {
            res.send('error')
        }
    })
})

//HANDLE FORGOT PASSWORD
router.get('/forgot', function (req, res, next) {
    let info = req.flash('info');
    res.render('backend/forgot', { info })
})

router.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {

            let smtpTransport = nodemailer.createTransport({
                service: "gmail",
                secure: false,
                port: 25,
                auth: {
                    user: "phawazzzy@gmail.com",
                    pass: keys.keys.password
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            var mailOptions = {
                to: req.body.email,
                from: 'phawazzzy@gmail.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('info', 'An e-mail has been sent to ' + req.body.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

//ROUTE TO GET RESET PAGE
router.get('/reset/:token', function (req, res) {
    let success = req.flash('success');
    let error = req.flash('error');
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {

        if (!user) {
            req.flash('error');
            return res.redirect('/forgot');
        }
        res.render('backend/reset', { token: req.params.token, success, error });
    });
});

router.post('/reset/:token', async function (req, res, next) {
    await User.findOne({ resetPasswordToken: req.params.token }).then((result) => {
        let smtpTransport = nodemailer.createTransport({
            service: "gmail",
            secure: false,
            port: 25,
            auth: {
                user: "phawazzzy@gmail.com",
                pass: keys.keys.password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        var mailOptions = {
            to: result.email,
            from: 'phawazzzy@gmail.com',
            subject: 'Your password has been changed',
            text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + result.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function (err) {
            done(err);
        });
    })

    User.findOneAndUpdate({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },
    {
        $set: {
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)), resetPasswordToken: undefinedresetPasswordExpires = undefined
        }
    }, { new: true },
    (err, doc) => {
        if (err) {
            console.log("Something wrong when updating data!");
        }
        console.log(doc);
        req.flash('success', 'Success! Your password has been changed. Login to continue');
        res.redirect('/login')
    });

})



//END FORGOT PASSWORD

router.delete('/deleteadmin', function (req, res, next) {
    User.deleteOne({ _id: req.body.id }).then((result) => {
        if (result) {
            if (result) {
                res.redirect('/dashboard/authorizeadmins')
            } else {
                console.log('err')
            }
        }
    })

})

router.get('/dashboard/messages', adminLoggedIn, mailController.messages)

router.post('/reply', mailController.reply);

router.get('/dashboard/settings', adminLoggedIn, function (req, res) {
    let upload = req.flash('upload');

    res.render('backend/settings', { upload, usrInfo, page: "settings" })
})

router.post('/postdashboard/settings', upload.single('siteLogo'), (req, res, next) => {
    pageData = {
        tag: req.body.tag,
        siteName: req.body.siteName,
    }

    if (req.file) {
        pageData.siteLogo = req.file.path.substring(6)
    }
    Settings.findOneAndUpdate({ tag: 'settings' }, pageData, { upsert: true })
        .catch((err) => { console.error(`Error occured during POST(/dashboard/settings): ${err}`); })
        .then(() => {
            req.flash('upload', 'PAGE - Content Updated Successful!');
            res.redirect('/dashboard/settings');
        })
})

router.post('/reply', mailController.reply);


// Vc Speech
//------

router.route('/dashboard/speech')
    .all(isLoggedIn, function (req, res, next) {
        oldImage = null
        return next()
    })
    .get(function (req, res, next) {
        let upload = req.flash('upload');
        let failure = req.flash('flash');

        res.render('backend/speech', {upload, failure, content: {} })
    })
    .post(getOldSliderImage, upload.single('postImage'), (req, res) => {
        removeOldImage();
        pageData = {
            name: req.body.name,
            text_on_img: req.body.text_on_img,
            img_link: req.body.img_link,
            img_link_text: req.body.img_link_text,
            is_active: true,
            postImage: req.file.path.substring(6)
        }

        Slider.create(pageData)
            .catch((err) => { console.error(`Error occured during POST(/dashboard/speech): ${err}`); })
            .then(() => {
                req.flash('upload', `VC's speech Creation Successful!`);
                res.redirect('/dashboard/speech');
            })
    })


// -----
// Slider
router.route('/dashboard/slider')
    .all(isLoggedIn)
    .get(function (req, res, next) {
        let failure = req.flash('failure');
        let success = req.flash('success');
        let uploaded = req.flash('uploaded');

        Slider.find({}).then((result) => {
            if (result) {
                res.render('backend/slider', { result, failure, success, uploaded })
            } else {
                res.render('backend/slider')
            }
        })
    })

router.route('/dashboard/slider/add')
    .all(isLoggedIn, function (req, res, next) {
        oldImage = null
        return next()
    })
    .get(function (req, res, next) {
        let upload = req.flash('upload');
        let failure = req.flash('flash');

        res.render('backend/slider-form', {upload, failure, content: {} })
    })
    .post(getOldSliderImage, upload.single('postImage'), (req, res) => {
        removeOldImage();
        pageData = {
            name: req.body.name,
            text_on_img: req.body.text_on_img,
            img_link: req.body.img_link,
            img_link_text: req.body.img_link_text,
            is_active: true,
            postImage: req.file.path.substring(6)
        }

        Slider.create(pageData)
            .catch((err) => { console.error(`Error occured during POST(/dashboard/slider): ${err}`); })
            .then(() => {
                req.flash('upload', `Slider Creation Successful!`);
                res.redirect('/dashboard/slider');
            })
    })

router.post("/uploadslider", function (req, res) {
    upload(req, res, (err) => {
        if (err) {
            //res.render('students', {msg : err})
            res.send(err)
        } else {
            console.log(req.files);
            Slider.findOne({ name: "slider" }).then(function (result) {
                if (result) {
                    req.flash('failure', "Sorry You can only update sliders not create new ones");
                    res.redirect("/dashboard/slider");
                } else if (!result) {
                    let newSlider = new Slider();
                    newSlider.slider1.name = req.files['slider1'][0].fieldname;
                    newSlider.slider1.path = '/uploads/' + req.files['slider1'][0].filename;
                    newSlider.slider2.name = req.files['slider2'][0].fieldname;
                    newSlider.slider2.path = '/uploads/' + req.files['slider2'][0].filename;
                    newSlider.slider3.name = req.files['slider3'][0].fieldname;
                    newSlider.slider3.path = '/uploads/' + req.files['slider3'][0].filename;
                    newSlider.name = "slider";

                    newSlider.save().then((result) => {
                        if (result) {
                            console.log(result)
                            req.flash('uploaded', "Slider has been uploaded successfully");
                            res.redirect("/dashboard/slider");
                        } else {
                            res.send("err")
                        }
                    })

                    // console.log("sorry cannot save new data")
                }
                // res.send("test")
            })
        }
    })
})

router.put("/update/uploadslider", function (req, res) {

    upload(req, res, (err) => {
        if (err) {
            //res.render('students', {msg : err})
            res.send(err)
        } else {
            console.log(req.files);
            Slider.findOneAndUpdate(
                { "name": "slider" },
                {
                    $set: {
                        "slider1.name": req.files['slider1'][0].fieldname,
                        "slider1.path": '/uploads/' + req.files['slider1'][0].filename,
                        "slider2.name": req.files['slider2'][0].fieldname,
                        "slider2.path": '/uploads/' + req.files['slider2'][0].filename,
                        "slider3.name": req.files['slider3'][0].fieldname,
                        "slider3.path": '/uploads/' + req.files['slider3'][0].filename,
                    }
                },
                { new: true })
                .then((result) => {
                    if (result) {
                        req.flash('success', "Slider has been updated");
                        res.redirect("/dashboard/slider")
                    } else {
                        res.send("error")
                    }
                })
            // res.send("test")
        }
    })
})

// -----
// News
router.get('/dashboard/news', function (req, res, next) {
    let upload = req.flash('upload');

    News.find({}).then((doc) => {
        if (doc) {
            res.render('backend/news', { upload, doc, page: 'news', activeParent: 'news' })
            console.log(doc)
        } else {
            res.render('backend/news')
        }
    })
})

router.post("/handlenews", function (req, res, next) {

    upload(req, res, (err) => {
        if (err) {

            //res.render('students', {msg : err})
            res.send(err)
        } else {
            console.log(req.files)

            let newNews = new News();

            newNews.title = req.body.title;
            newNews.writer = req.body.writer;
            newNews.department = req.body.department;
            newNews.content = req.body.content;
            newNews.newImg = '/uploads/' + req.files["newImg"][0].filename;

            newNews.save().then((result) => {
                if (result) {
                    console.log(result)
                    req.flash('upload', "News has been uploaded successfully");
                    res.redirect('dashboard/news');
                } else {
                    res.send("err")
                }
            })
        }
    })
})

// -----
// Staff    -   NOT USED
router.get('/dashboard/staffs', function (req, res, next) {
    let upload = req.flash('upload');
    let failure = req.flash('failure')
    res.render('backend/staff', { upload, failure })
})

router.get('/dashboard/adminSettings', function (req, res, next) {
    let success = req.flash('succes');
    let failure = req.flash('failure')
    res.render('backend/adminSettings', {success, failure, email: req.user.email})
})

router.put('/dashboard/adminSettings/email', function (req, res, next) {
    if (req.body.dbEmail == req.user.email ) {
        User.findByIdAndUpdate({ _id: req.user._id }, { email: req.body.newEmail })
            .exec()
            .then(() => {
                res.redirect('/dashboard');
            })
            .catch((err) => {
                console.log(err);
            })
    }
    else{
        req.flash('info', "Incorrect Email!");
        res.redirect('/dashboard/adminSettings');
    }
})

router.put('/dashboard/adminSettings/password', function (req, res, next) {
    bcrypt.compare(req.body.dbPass, req.user.password, function (req, res, err) {
        if (err) {
            console.log(err)
        }
        if (res) {
            User.findByIdAndUpdate({ _id: req.user._id }, { email: req.body.newPass })
                .exec()
                .then(() => {
                    res.redirect('/dashboard');
                })
                .catch((err) => {
                    console.log(err);
                })
        }
        else {
            console.log('unmatch');
            res.redirect('/dashboard/adminSettings');

        }
    });
})

router.delete('/dashboard/adminSettings/delete', function (req, res, next) {

    
    bcrypt.compare(req.body.password, req.user.password, function (req, res, err) {
        if (err) {
            console.log(err)
        }
        if (res){
            User.findByIdAndRemove({ _id: req.user._id })
                .exec()
                .then(() => {
                    res.redirect('/login');
                })
                .catch((err) => {
                    console.log(err);
                })
        }
        else {
            console.log('unmatch');
            res.redirect('/dashboard/adminSettings');
            
        }
    });

})

router.post('/poststaff', function (req, res, next) {
    upload(req, res, (err) => {
        if (err) {

            //res.render('students', {msg : err})
            res.send(err)
        } else {
            console.log(req.files);
            Page.findOne({ name: "staff" }).then(function (result) {
                if (result) {

                    req.flash('failure', "Sorry You can only update not create new ones");
                    res.redirect('dashboard/staff');


                } else if (!result) {

                    let newPage = new Page();

                    newPage.name = req.body.name;
                    newPage.content = req.body.content;
                    newPage.newImg = '/uploads/' + req.files["newImg"][0].filename;

                    newPage.save().then((result) => {
                        if (result) {
                            console.log(result)
                            req.flash('upload', "Staff page has been uploaded successfully");
                            res.redirect('dashboard/staff');
                        } else {
                            res.send("err")
                        }
                    })

                    // console.log("sorry cannot save new data")
                }
                //    // res.send("test")
            })
        }
    })
})

// -----
// Contact
router.route('/dashboard/contact-us')
    .all(isLoggedIn)
    .get((req, res, next) => {
        let req_url = req.originalUrl;
        let upload = req.flash('upload');
        let failure = req.flash('failure');
        Contact.find({})
            .then((data) => {
                res.render('backend/contact-us', { upload, failure, req_url, content: data[0], page: 'contact-us', activeParent: 'about' })
            })
            .catch((err) => {
                console.error(`Error occured during GET(/dashboard/contact-us): ${err}`);
            })
    })
    .post((req, res, next) => {
        pageData = {
            address: req.body.address,
            phone: req.body.phone,
            email: req.body.email,
            mapLongitude: req.body.mapLongitude,
            mapLatitude: req.body.mapLatitude,
            is_active: true,
            // _id = (req.body.id) ? req.body.id : ''
        }

        Contact.findOneAndUpdate({}, pageData, { upsert: true })
            .catch((err) => { console.error(`Error occured during POST(/dashboard/contact-us): ${err}`); })
            .then(() => {
                req.flash('upload', `PAGE (Contact Us) - Content Update Successful!`);
                res.redirect('/dashboard/contact-us');
            })
    })

// -----
// About pages
// Education pages
// Research pages
// Recruitment pages
// Management pages
router.route('/dashboard/:tag')
    .all(isLoggedIn)
    .get((req, res, next) => {
        let req_url = req.originalUrl;
        let upload = req.flash('upload');
        let failure = req.flash('failure');
        let page_tag = req.params.tag.trim();
        let page_obj = n[page_tag.replace(/(-)+/gi, '_')];

        Page.findOne({ tag: page_tag })
            .then((content) => {
                res.render('backend/template-one', { upload, failure, req_url, page: page_tag, content, activeParent: page_obj.parent, title: page_obj.title, usrInfo })
            })
            .catch((err) => {
                console.error(`Error occured during GET(/dashboard/${page_tag}): ${err}`);
            })
    })
    .post(getOldImage, upload.single('postImage'), (req, res, next) => {

        removeOldImage();

        let page_tag = req.params.tag.trim();
        pageData = {
            tag: page_tag,
            name: req.body.name,
            summary: req.body.summary,
            content: req.body.content,
            postImageCaption: req.body.postImageCaption,
            meta_key: req.body.meta_key,
            meta_desc: req.body.meta_desc,
            is_active: true
        }
        if (req.file) {
            pageData.postImage = req.file.path.substring(6)
        }

        Page.findOneAndUpdate({ tag: page_tag }, pageData, { upsert: true })
            .catch((err) => { console.error(`Error occured during POST(/dashboard/${page_tag}): ${err}`); })
            .then(() => {
                req.flash('upload', `PAGE (${capitalize(page_tag)}) - Content Update Successful!`);
                res.redirect('/dashboard/' + page_tag);
            })
    })


// WEBSITE ROUTES
// -----
router.get('/', controller.homePage);
router.get('/services', controller.servicesPage);
router.get('/contact', controller.contactPage);
router.post('/post_contact', controller.post_contactPage);
router.get('/team', controller.teamPage);
router.get('/news-lists/:id', controller.newsPage);
router.get('/news-lists', controller.newsListsPage);
router.get('/:page_name', controller.renderPage);
router.post('/subscribe', controller.subscribe)

module.exports = router;
