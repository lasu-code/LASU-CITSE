
let mongoose = require('mongoose')
let message = require('../models/message')
let Slider = require('../models/slider');
let nodemailer = require('nodemailer');


exports.homePage = function (req, res, next) {
    Slider.find({}).then((result)=>{
        if (result){
    res.render('frontend/index', {result});
      }else{
    res.render('frontend/index');          
      }
    })
};

exports.servicesPage = function (req, res, next) {
    res.render('extras/services', {});
};

exports.contactPage = function (req, res, next) {
    res.render('frontend/contact', {});
};

exports.newsPage = function (req, res, next) {
    res.render('extras/news', {});
};

exports.teamPage = function (req, res, next) {
    res.render('frontend/team', {});
};

exports.jecPage = function (req, res, next) {
    res.render('frontend/jec', {});
};

exports.visionPage = function (req, res, next) {
    res.render('frontend/vision', {});
};

exports.missionPage = function (req, res, next) {
    res.render('frontend/mission', {});
};

exports.objectivesPage = function (req, res, next) {
    res.render('frontend/objectives', {});
};

exports.retentionPage = function (req, res, next) {
    res.render('frontend/retention', {});
};

exports.recruitmentPage = function (req, res, next) {
    res.render('frontend/recruitment', {});
};

exports.staffPage = function (req, res, next) {
    res.render('frontend/staff', {});
};

exports.operationsPage = function (req, res, next) {
    res.render('frontend/operations', {});
};

exports.educationPage = (req, res, next)=>{
    res.render('frontend/education', {})
};

exports.learningPage = (req, res, next)=>{
    res.render('frontend/learning', {})
};

exports.teachingPage = (req, res, next)=>{
    res.render('frontend/teaching', {});
};

exports.skillsPage = (req, res, next)=>{
    res.render('frontend/skills', {})
};

exports.innovationPage = (req, res, next)=>{
    res.render('frontend/innovation', {})
};

exports.innovationAssPage = (req, res, next)=>{
    res.render('frontend/innovationAss', {})
};

exports.onlineCoursePage = (req, res, next)=>{
    res.render('frontend/onlineCourse', {})
};

exports.researchPlanPage = (req, res, next)=>{
    res.render('frontend/researchPlan', {})
}

exports.industrailPage = (req, res, next)=>{
    res.render('frontend/industrail', {})
};

exports.partnershipPage = (req, res, next)=>{
    res.render('frontend/partnership', {})
}
exports.implementationPage = function (req, res, next) {
    res.render('frontend/implementation', {});
}

exports.post_contactPage =(req, res, next)=>{
    let messageData = {
        name: req.body.name,
        email: req.body.email,
        message: req.body.message
        
    }
    let newData = new message(messageData);
    newData.save()
    res.render('frontend/contact', {})

    // let Transport = nodemailer.createTransport({
    //     service: "gmail",
    //     secure: false,
    //     port: 25, 
    //     auth: {
    //       user: "phawazzzy@gmail.com",
    //       pass: keys.keys.password
    //     },
    //     tls: {
    //       rejectUnauthorized: false
    //     }
    //   });
  
    //   //sending email with SMTP, configuration using SMTP settings
    //   let mailOptions = {
    //     from: req.body.email, //sender adress
    //     to: "<phawazzzy@gmail.com>", 
    //     subject: req.body.subject ,
    //     message: req.body.message 
    //   };
  
    //   Transport.sendMail(mailOptions, (error, info)=>{
    //     if (error){
    //       console.log(error);
    //       console.log(mailOptions.message);
          
    //       //res.send("email could not send due to error:" + error);
    //     }else{
    //       console.log(info);
    //       console.log(mailOptions.message);
          
    //      // res.send("email has been sent successfully");
    //     }
    //     res.redirect("/contact")
    //   });
}

exports.newsPage = (req,res,next)=>{
    res.render('extras/news', {})
}
