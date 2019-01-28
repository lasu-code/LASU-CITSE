const path = require('path');
const express = require('express');
const router = express.Router();
const passport = require("passport");
const multer =require("multer");
// const methodOverride = require("method-override");
let subscribe = require('../models/subscribe')
var mail = require('../mailTemplate');

var receiver = 'fawas.kareem170115028@st.lasu.edu.ng';
var username = 'phawazzzy';
var name = 'kareem fawas olamilkan';
let button = mail.sendPasswordReset(receiver, username, name);




let User = require('../models/users');
let News = require('../models/news');
let Slider = require('../models/slider');
let Page = require('../models/page');
let Contact = require('../models/contact');

let controller = require('../controllers/frontendControllers')
let mailController = require('../controllers/mailControllers');
let n = require('../config/cmsNav');


// HANDLE IMAGES
// -----
// Set multer storage config
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb){
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
})
// Set multer runtime options
const multerOpts = {
    storage: storage ,
    //limits: {fileSize: 10},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}
//check file type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Get ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname){
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
        return next()
    } else {
        console.error('Login to continue')
        req.flash('error', 'Login to continue!')
        res.redirect('/login')
    }
}

function adminLoggedIn(req, res, next) {
    if (req.isAuthenticated() && req.user.position == "head") {
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

// DASHBOARD ROUTES
// -----
// Access Control
router.get('/login', function (req, res, next) {
    res.render('backend/login')
})

router.post('/login/admin', passport.authenticate('local.loginAdmin', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}))

router.get('/signup', function(req, res, next){
    res.render('backend/signup')
})

router.get('/logout', function (req, res, next) {
    req.logout()
    res.redirect('/login')
})

router.get('/dashboard', isLoggedIn, function(req, res, next){
    res.render('backend/dashboard')
});

router.get('/dashboard/subscriberList', function(req, res, next){
    subscribe.find({}).then((result) =>{
        console.log(result.email)
        for (var i=0; i< result.length; i++){
            result[i]['serial'] = i
        }
        console.log(result)

        if (result){
    res.render('backend/subscribers', {result, button})
        } else
    res.render('backend/subscribers', {result, button})
        
    })

})


// -----
// Admin
router.get('/dashboard/authorizeadmins', adminLoggedIn, function(req, res, next){
    User.find({position: "member"}).then((result)=>{
        if (result){
            res.render('backend/authorize', {result})
        }else{
            res.render('backend/authorize')
        }
    })
})

router.post('/createAccount', passport.authenticate('local.registerAdmin',{
    successRedirect: '/dashboard/authorizeadmins',
    failureRedirect: '/',
    failureFlash: true
}))

router.delete('/deleteadmin', function(req, res, next){
    User.deleteOne({ _id: req.body.id }).then((result)=>{
        if(result){
            if (result){
                res.redirect('/dashboard/authorizeadmins')
            }else{
                console.log('err')
            }
        }
    })

})

router.get('/dashboard/slider/add', function (req, res, next) {
    let upload = req.flash('upload');
    let failure = req.flash('flash');
    
    res.render('backend/slider4', {upload, failure, content: {} })
})

router.get('/dashboard/messages', adminLoggedIn, mailController.messages)

router.post('/reply', mailController.reply);

// -----
// Slider
router.get('/dashboard/slider', function(req, res, next){
    let failure = req.flash('failure');
    let success = req.flash('success');
    let uploaded = req.flash('uploaded');
    let test = "test";

    Slider.find({}).then((result)=>{
        if (result){
            res.render('backend/slider', {result, failure, success, uploaded})
        }else{
            res.render('backend/slider')
        }
    })
})

router.post("/uploadslider", function (req, res){
    upload(req, res, (err) => {
        if (err){
            //res.render('students', {msg : err})
            res.send(err)
        }else{
            console.log(req.files);
            Slider.findOne({name: "slider"}).then(function(result){
                if (result){
                    req.flash('failure', "Sorry You can only update sliders not create new ones");
                    res.redirect("/dashboard/slider");
                } else if(!result){
                    let newSlider = new Slider();
                    newSlider.slider1.name = req.files['slider1'][0].fieldname;
                    newSlider.slider1.path = '/uploads/' + req.files['slider1'][0].filename;
                    newSlider.slider2.name = req.files['slider2'][0].fieldname;
                    newSlider.slider2.path = '/uploads/' + req.files['slider2'][0].filename;
                    newSlider.slider3.name = req.files['slider3'][0].fieldname;
                    newSlider.slider3.path = '/uploads/'+ req.files['slider3'][0].filename;
                    newSlider.name = "slider";

                    newSlider.save().then((result)=>{
                        if(result){
                            console.log(result)
                            req.flash('uploaded', "Slider has been uploaded successfully");
                            res.redirect("/dashboard/slider");
                        }else{
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

router.put("/update/uploadslider", function (req, res){
    upload(req, res, (err) => {
        if (err){
            //res.render('students', {msg : err})
            res.send(err)
        }else{
            console.log(req.files);
            Slider.findOneAndUpdate(
                {"name": "slider"},
                {$set:{
                    "slider1.name": req.files['slider1'][0].fieldname,
                    "slider1.path": '/uploads/' + req.files['slider1'][0].filename,
                    "slider2.name": req.files['slider2'][0].fieldname,
                    "slider2.path": '/uploads/' + req.files['slider2'][0].filename,
                    "slider3.name": req.files['slider3'][0].fieldname,
                    "slider3.path": '/uploads/' + req.files['slider3'][0].filename,
                    }
                },
                {new: true})
            .then((result)=>{
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
router.get('/dashboard/news', function(req, res, next){
    let upload = req.flash('upload');

    News.find({}).then((doc)=>{
        if (doc){
            res.render('backend/news', {upload, doc})
            console.log(doc)
        }else{
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

router.post('/poststaff', function(req, res, next){
    upload(req, res, (err) => {
        if (err){

            //res.render('students', {msg : err})
            res.send(err)
        }else{
            console.log(req.files);
            Page.findOne({name: "staff"}).then(function(result){
                if (result){

                    req.flash('failure', "Sorry You can only update not create new ones");
                    res.redirect('dashboard/staff');


                }else if(!result){

                    let newPage = new Page();

                    newPage.name = req.body.name;
                    newPage.content = req.body.content;
                    newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;

                    newPage.save().then((result)=>{
                        if(result){
                            console.log(result)
                            req.flash('upload', "Staff page has been uploaded successfully");
                            res.redirect('dashboard/staff');
                        }else{
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
// Slider
// router.get('/dashboard/slider/add', isLoggedIn, (req, res, next) => {
//     res.render('backend/slider4');
// })

// -----
// Contact
router.route('/dashboard/contact-us')
        .all((req, res, next) => {
            isLoggedIn(req, res, next);
        })
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
        .all((req, res, next) => {
            isLoggedIn(req, res, next);
        })
        .get((req, res, next) => {
            let req_url = req.originalUrl;
            let upload = req.flash('upload');
            let failure = req.flash('failure');
            let page_tag = req.params.tag.trim();
            let page_obj = n[page_tag.replace(/(-)+/gi, '_')];
            Page.findOne({tag: page_tag})
                .then((content) => {
                    res.render('backend/template-one', { upload, failure, req_url, page: page_tag, content, activeParent: page_obj.parent, title: page_obj.title })
                })
                .catch((err) => {
                    console.error(`Error occured during GET(/dashboard/${page_tag}): ${err}`);
                })
        })
        .post(upload.single('postImage'), (req, res, next) => {
            let page_tag = req.params.tag.trim();
            pageData = {
                tag: page_tag,
                name: req.body.name,
                summary: (req.body.summary) ? req.body.summary : req.body.content,
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
router.get('/news', controller.newsPage);
router.get('/:page_name', controller.renderPage);
router.post('/subscribe', controller.subscribe)

router.get('/subscriberList', function(req, res, next){
    res.render('backend/subscribers')
})

module.exports = router;
