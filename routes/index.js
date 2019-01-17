const path = require('path');
var express = require('express');
var router = express.Router();
let passport = require("passport");
const multer =require("multer");
let User = require('../models/users');
let Slider = require('../models/slider');
let News = require('../models/news');
const methodOverride = require("method-override");
const controller = require('../controllers/frontendControllers.js')
let dashboardController = require('../controllers/dashboard-controllers.js');
let Page = require('../models/page');


// HANDLE IMAGES 

const  storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function(req, file, cb){
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
})


const upload = multer({
  storage: storage ,
  //limits: {fileSize: 10},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).fields([{name: "slider1"},{name: "slider2"},{name: "slider3"},{name: "newImg"}])

//check file type 
function checkFileType(file, cb){
  //Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // check ext
  const extname = filetypes.test(path.extname
  (file.originalname).toLowerCase());
  //check mime
  const mimetype = filetypes.test(file.mimetype)

  if(mimetype && extname){
    return cb(null, true);
  }else {
    cb('Error: images Only!')
  }
}


/* GET home page. */
router.get('/', controller.homePage);
router.get('/services', controller.servicesPage);

router.get('/contact', controller.contactPage);

router.get('/team', controller.teamPage);
router.get('/justification-for-establishing-the-centre', controller.jecPage);
router.get('/vision', controller.visionPage);
router.get('/mission', controller.missionPage);
router.get('/objectives', controller.objectivesPage);
router.get('/retention-and-support', controller.retentionPage);
router.get('/student-recruitment', controller.recruitmentPage);
router.get('/staff-development', controller.staffPage);
router.get('/centre-operations', controller.operationsPage);
router.get('/education', controller.educationPage);
router.get('/learning', controller.learningPage);
router.get('/teaching', controller.teachingPage);
router.get('/skills', controller.skillsPage);
router.get('/innovation', controller.innovationPage);
router.get('/innovation', controller.innovationPage);
router.get('/innovationAss', controller.innovationAssPage);
router.get('/onlineCourse', controller.onlineCoursePage);
router.get('/researchPlan', controller.researchPlanPage);
router.get('/industrial', controller.industrailPage);
router.get('/partnership', controller.partnershipPage);
router.get('/news', controller.newsPage);
router.post('/reply', dashboardController.reply)


router.post('/post_contact', controller.post_contactPage);

router.get('/implementation-timeline', controller.implementationPage); 

router.get('/dashboard', adminLoggedIn, function(req, res, next){
  res.render('backend/dashboard')
});

router.get('/dashboard/messages',adminLoggedIn, dashboardController.messages)

router.get('/login', dashboardController.login)
router.get('/signup', function(req, res, next){
    res.render('backend/signup')
})

router.get('/dashboard/authorizeadmins', isLoggedIn, function(req, res, next){
  User.find({position: "member"}).then((result)=>{
    if (result){
       res.render('backend/authorize', {result})
    }else{
       res.render('backend/authorize')      
    }
  })
})

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

//slider
router.get('/dashboard/slider', function(req, res, next){
      let failure = req.flash('failure');
      let success = req.flash('success');     
      let uploaded = req.flash('uploaded');   
      let test = "test";  

   Slider.find({}).then((result)=>{
    if (result){
       res.render('backend/slider', {result, failure, success, uploaded})
      console.log(result)
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

        
         }else if(!result){
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
               req.flash('uploaded', "Slidder has been uploaded successfully");             
             res.redirect("/dashboard/slider");
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


router.put("/update/uploadslider", function (req, res){

  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Slider.findOneAndUpdate({"name": "slider"},
       {$set:{"slider1.name": req.files['slider1'][0].fieldname,
        "slider1.path": '/uploads/' + req.files['slider1'][0].filename,
        "slider2.name": req.files['slider2'][0].fieldname,
      "slider2.path": '/uploads/' + req.files['slider2'][0].filename,
     "slider3.name": req.files['slider3'][0].fieldname,
     "slider3.path": '/uploads/' + req.files['slider3'][0].filename,
    
    }},
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



router.post('/createAccount', passport.authenticate('local.registerAdmin',{
  successRedirect: '/dashboard/authorizeadmins',
  failureRedirect: '/',
  failureFlash: true
}))

router.post('/login/admin', passport.authenticate('local.loginAdmin',{
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}))

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

router.get('/dashboard/vision', function (req, res, next) {
  let upload = req.flash('upload');
    let failure = req.flash('failure');
      let success = req.flash('success');            
    
    Page.find({name: 'vision'}).then(function(result){
      if (result){
        console.log(result)
      res.render('backend/vision', { upload, failure, result, success })
      }else{
      res.render('backend/vision', { upload, failure })        
      }
    })


})

router.post('/postvision', function(req, res, next){
    upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "vision"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update Vision not create new ones");
             res.redirect("/dashboard/vision");

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Vision has been uploaded successfully");             
             res.redirect('dashboard/vision');
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

router.put("/updatevision", function (req, res){
    upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOneAndUpdate({name: "vision"},
       {$set:{
        newImg: '/uploads/' + req.files['newImg'][0].filename,
        content: req.body.content,      
        
    }},
     {new: true})
      .then((result)=>{
          if (result) {
               req.flash('success', "Vision Page has been updated");            
            res.redirect("/dashboard/vision")
          } else {
            res.send("error")
          }
      })
       
      
     // res.send("test")
    }
  })

})


router.get('/dashboard/justification', function (req, res, next) {
  let upload = req.flash('upload');
    let failure = req.flash('failure');
    let success = req.flash('success');            
    
    Page.find({name: 'justification'}).then(function(result){
      if (result){
        console.log(result)
     res.render('backend/justification', { upload, failure, result, success }) 

      }else{
     res.render('backend/justification', { upload, failure, success }) 
        
      }
    })
  
})

router.post('/postjustification', function(req, res, next){
 upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "justification"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/justification');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Justification has been uploaded successfully");             
             res.redirect('dashboard/justification');
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


router.put("/updatejustification", function (req, res){

  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOneAndUpdate({"name": "justification"},
       {$set:{
        newImg: '/uploads/' + req.files['newImg'][0].filename,
        content: req.body.content,      
        
    }},
     {new: true})
      .then((result)=>{
          if (result) {
               req.flash('success', "Justification Page has been updated");            
            res.redirect("/dashboard/justification")
          } else {
            res.send("error")
          }
      })
       
      
     // res.send("test")
    }
  })
})

router.get('/dashboard/mission', function (req, res, next) {
    let upload = req.flash('upload');
    let failure = req.flash('failure');
    let success = req.flash('success');            
    
    Page.find({name: 'mission'}).then(function(result){
      if (result){
        console.log(result)
     res.render('backend/mission', { upload, failure, result, success }) 

      }else{
     res.render('backend/mission', { upload, failure, success }) 
        
      }
    })
})

router.post('/postmission', function(req, res, next){
        upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "mission"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/mission');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Mission has been uploaded successfully");             
             res.redirect('dashboard/mission');
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


router.put("/updatemission", function (req, res){

  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOneAndUpdate({"name": "mission"},
       {$set:{
        newImg: '/uploads/' + req.files['newImg'][0].filename,
        content: req.body.content,      
        
    }},
     {new: true})
      .then((result)=>{
          if (result) {
               req.flash('success', "Mission Page has been updated");            
            res.redirect("/dashboard/mission")
          } else {
            res.send("error")
          }
      })
       
      
     // res.send("test")
    }
  })
})

router.get('/dashboard/objectives', function (req, res, next) {
    let upload = req.flash('upload');
    let failure = req.flash('failure');
    let success = req.flash('success');            
    
    Page.find({name: 'objectives'}).then(function(result){
      if (result){
        console.log(result)
     res.render('backend/objectives', { upload, failure, result, success }) 

      }else{
     res.render('backend/objectives', { upload, failure, success }) 
        
      }
    })
})

router.post('/postobjectives', function(req, res, next){
      upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "objectives"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/objectives');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Objectives has been uploaded successfully");             
             res.redirect('dashboard/objectives');
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

router.put("/updateobjectives", function (req, res){

  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOneAndUpdate({name: "objectives"},
       {$set:{
        newImg: '/uploads/' + req.files['newImg'][0].filename,
        content: req.body.content,      
        
    }},
     {new: true})
      .then((result)=>{
          if (result) {
               req.flash('success', "Objectives Page has been updated");            
            res.redirect("/dashboard/objectives")
          } else {
            res.send("error")
          }
      })
       
      
     // res.send("test")
    }
  })
})


router.get('/dashboard/contact-us', function (req, res, next) {
   let upload = req.flash('upload');
    let failure = req.flash('failure');
    let success = req.flash('success');            
    
    Page.find({name: 'contactus'}).then(function(result){
      if (result){
        console.log(result)
     res.render('backend/contact-us', { upload, failure, result, success }) 

      }else{
     res.render('backend/contact-us', { upload, failure, success }) 
        
      }
    })
     
})

router.post('/postcontactus', function(req, res, next){
        upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "contactus"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/contact-us');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Contact-us has been uploaded successfully");             
             res.redirect('dashboard/contact-us');
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

router.put("/updatecontactus", function (req, res){

  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOneAndUpdate({name: "contactus"},
       {$set:{
        newImg: '/uploads/' + req.files['newImg'][0].filename,
        content: req.body.content,      
        
    }},
     {new: true})
      .then((result)=>{
          if (result) {
               req.flash('success', "Contact-Us Page has been updated");            
            res.redirect("/dashboard/contact-us")
          } else {
            res.send("error")
          }
      })
       
      
     // res.send("test")
    }
  })
})


router.get('/dashboard/education', function (req, res, next) {
  let upload = req.flash('upload');
  let failure = req.flash('failure');
  

      res.render('backend/education', { upload, failure })
    
})

router.post('/posteducation', function(req, res, next){
 upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "education"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/education');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Education has been uploaded successfully");             
             res.redirect('dashboard/education');
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

router.get('/dashboard/teaching', function (req, res, next) {
  let upload = req.flash('upload');
  let failure = req.flash('failure');
  
      res.render('backend/teaching', { upload, failure})
     
})

router.post('/postteaching', function(req, res, next){
 upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "teaching"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/teaching');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Teaching page has been uploaded successfully");             
             res.redirect('dashboard/teaching');
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

router.get('/dashboard/learning-activities', function (req, res, next) {
  let upload = req.flash('upload');
  let failure = req.flash('failure');  

      res.render('backend/learning-activities', { upload, failure })
    
})

router.post('/postlearning-activites', function(req, res, next){
  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "learning-activites"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/learning-activities');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Learning-activities pages has been uploaded successfully");             
             res.redirect('dashboard/learning-activities');
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

router.get('/dashboard/skills-gap', function (req, res, next) {
  let upload = req.flash('upload');
  let failure = req.flash('failure');  

      res.render('backend/gaps', { upload, failure })
})

router.post('/postgaps', function(req, res, next){
upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "gaps"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/skills-gap');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Skills-gaps page has been uploaded successfully");             
             res.redirect('dashboard/skills-gap');
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

router.get('/dashboard/innovations-a', function (req, res, next) {
  let upload = req.flash('upload');
  let failure = req.flash('failure');  

      res.render('backend/innovations-a', { upload, failure })

})

router.post('/postinnovations-a', function(req, res, next){
upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "innovations-a"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/innovations-a');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Skill-gaps page has been uploaded successfully");             
             res.redirect('dashboard/innovations-a');
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

router.get('/dashboard/innovations-p', function (req, res, next) {
  let upload = req.flash('upload');
  let failure = req.flash('failure');  

      res.render('backend/innovations-p', { upload, failure })
    
})

router.post('/postinnovations-p', function(req, res, next){
upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "innovations-p"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/innovations-p');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Innovations in Assessment page has been uploaded successfully");             
             res.redirect('dashboard/innovations-p');
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


router.get('/dashboard/online-courses', function (req, res, next) {
  let upload = req.flash('upload');
  let failure = req.flash('failure');  

      res.render('backend/online-courses', { upload, failure })

})

router.post('/postonline-courses', function(req, res, next){
upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "online-courses"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/online-courses');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Online-Courses page has been uploaded successfully");             
             res.redirect('dashboard/online-courses');
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


router.get('/dashboard/ISP', function (req, res, next) {
    let upload = req.flash('upload');
    let failure = req.flash('failure');
    let success = req.flash('success');            
    
    Page.find({name: 'isp'}).then(function(result){
      if (result){
        console.log(result)
     res.render('backend/ISP', { upload, failure, result, success }) 

      }else{
     res.render('backend/ISP', { upload, failure, success }) 
        
      }
    })
})

router.post('/postisp', function(req, res, next){
  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "isp"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/ISP');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Industrial/Sectorial Partnership page has been uploaded successfully");             
             res.redirect('dashboard/ISP');
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

router.put("/updateisp", function (req, res){

  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOneAndUpdate({name: "isp"},
       {$set:{
        newImg: '/uploads/' + req.files['newImg'][0].filename,
        content: req.body.content,      
        
    }},
     {new: true})
      .then((result)=>{
          if (result) {
               req.flash('success', "Industrial/Sectorial Partnership Page has been updated");            
            res.redirect("/dashboard/isp")
          } else {
            res.send("error")
          }
      })
       
      
     // res.send("test")
    }
  })
})


router.get('/dashboard/partnership', function (req, res, next) {
    let upload = req.flash('upload');
    let failure = req.flash('failure');
    let success = req.flash('success');            
    
    Page.find({name: 'partnership'}).then(function(result){
      if (result){
        console.log(result)
     res.render('backend/partnership', { upload, failure, result, success }) 

      }else{
     res.render('backend/partnership', { upload, failure, success }) 
        
      }
    })
})

router.post('/postpartnership', function(req, res, next){
  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "partnership"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/partnership');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Partnership with Academic Institutions page has been uploaded successfully");             
             res.redirect('dashboard/partnership');
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

router.put("/updatepartnership", function (req, res){

  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOneAndUpdate({name: "partnership"},
       {$set:{
        newImg: '/uploads/' + req.files['newImg'][0].filename,
        content: req.body.content,      
        
    }},
     {new: true})
      .then((result)=>{
          if (result) {
               req.flash('success', "Partnership Page has been updated");            
            res.redirect("/dashboard/partnership")
          } else {
            res.send("error")
          }
      })
       
      
     // res.send("test")
    }
  })
})


router.get('/dashboard/research-plan', function (req, res, next) {
    let upload = req.flash('upload');
    let failure = req.flash('failure');
    let success = req.flash('success');            
    
    Page.find({name: 'research-plan'}).then(function(result){
      if (result){
        console.log(result)
     res.render('backend/research-plan', { upload, failure, result, success }) 

      }else{
     res.render('backend/research-plan', { upload, failure, success }) 
        
      }
    })
     
 })

router.post('/postresearch-plan', function(req, res, next){
  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "research-plan"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/research-plan');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Research Plan page has been uploaded successfully");             
             res.redirect('dashboard/research-plan');
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

router.put("/updateresearch-plan", function (req, res){

  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOneAndUpdate({name: "research-plan"},
       {$set:{
        newImg: '/uploads/' + req.files['newImg'][0].filename,
        content: req.body.content,      
        
    }},
     {new: true})
      .then((result)=>{
          if (result) {
               req.flash('success', "Research-Plan Page has been updated");            
            res.redirect("/dashboard/research-plan")
          } else {
            res.send("error")
          }
      })
       
      
     // res.send("test")
    }
  })
})

router.get('/dashboard/retention-support', function (req, res, next) {
    let upload = req.flash('upload');
    let failure = req.flash('failure');
    let success = req.flash('success');            
    
    Page.find({name: 'retention-support'}).then(function(result){
      if (result){
        console.log(result)
     res.render('backend/retention-support', { upload, failure, result, success }) 

      }else{
     res.render('backend/retention-support', { upload, failure, success }) 
        
      }
    })
     
})

router.post('/postretention-support', function(req, res, next){
  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "retention-support"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/retention-support');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Retention and Support page has been uploaded successfully");             
             res.redirect('dashboard/retention-support');
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

router.put("/updateretention-support", function (req, res){

  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOneAndUpdate({name: "retention-support"},
       {$set:{
        newImg: '/uploads/' + req.files['newImg'][0].filename,
        content: req.body.content,      
        
    }},
     {new: true})
      .then((result)=>{
          if (result) {
               req.flash('success', "Retention and Support Page has been updated");            
            res.redirect("/dashboard/retention-support")
          } else {
            res.send("error")
          }
      })
       
      
     // res.send("test")
    }
  })
})

router.get('/dashboard/student-recruitment', function (req, res, next) {
    let upload = req.flash('upload');
    let failure = req.flash('failure');
    let success = req.flash('success');            
    
    Page.find({name: 'student-recruitment'}).then(function(result){
      if (result){
        console.log(result)
     res.render('backend/student-recruitment', { upload, failure, result, success }) 

      }else{
     res.render('backend/student-recruitment', { upload, failure, success }) 
        
      }
    })
  
})

router.post('/poststudent-recruitment', function(req, res, next){
   upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "student-recruitment"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/student-recruitment');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Student Recruitment page has been uploaded successfully");             
             res.redirect('dashboard/student-recruitment');
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

router.put("/updatestudent-recruitment", function (req, res){

  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOneAndUpdate({name: "student-recruitment"},
       {$set:{
        newImg: '/uploads/' + req.files['newImg'][0].filename,
        content: req.body.content,      
        
    }},
     {new: true})
      .then((result)=>{
          if (result) {
               req.flash('success', "Student Recruitment Page has been updated");            
            res.redirect("/dashboard/student-recruitment")
          } else {
            res.send("error")
          }
      })
       
      
     // res.send("test")
    }
  })
})

router.get('/dashboard/centre-operations', function (req, res, next) {
  let upload = req.flash('upload');
    let failure = req.flash('failure');
    let success = req.flash('success');            
    
    Page.find({name: 'centre-operations'}).then(function(result){
      if (result){
        console.log(result)
     res.render('backend/centre-operations', { upload, failure, result, success }) 

      }else{
     res.render('backend/centre-operations', { upload, failure, success }) 
        
      }
    })
})

router.post('/postcentre-operations', function(req, res, next){
   upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "centre-operations"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/centre-operations');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Centre Operations page has been uploaded successfully");             
             res.redirect('dashboard/centre-operations');
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


router.put("/updatecentre-operations", function (req, res){

  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOneAndUpdate({name: "centre-operations"},
       {$set:{
        newImg: '/uploads/' + req.files['newImg'][0].filename,
        content: req.body.content,      
        
    }},
     {new: true})
      .then((result)=>{
          if (result) {
               req.flash('success', "Centre Operation Page has been updated");            
            res.redirect("/dashboard/centre-operations")
          } else {
            res.send("error")
          }
      })
       
      
     // res.send("test")
    }
  })
})

router.get('/dashboard/implementation-table', function (req, res, next) {
  let upload = req.flash('upload');
    let failure = req.flash('failure');
    let success = req.flash('success');            
    
    Page.find({name: 'implementation'}).then(function(result){
      if (result){
        console.log(result)
     res.render('backend/implementation-table', { upload, failure, result, success }) 

      }else{
     res.render('backend/implementation-table', { upload, failure, success }) 
        
      }
    })
})

router.post('/postimplementation', function(req, res, next){
   upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOne({name: "implementation"}).then(function(result){
   if (result){ 
        
               req.flash('failure', "Sorry You can only update not create new ones");
             res.redirect('dashboard/implementation-table');

        
         }else if(!result){

  let newPage = new Page();

           newPage.name = req.body.name;
           newPage.content = req.body.content;
           newPage.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newPage.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "Implementation Table page has been uploaded successfully");             
             res.redirect('dashboard/implementation-table');
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


router.put("/updateimplementation", function (req, res){

  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOneAndUpdate({name: "implementation"},
       {$set:{
        newImg: '/uploads/' + req.files['newImg'][0].filename,
        content: req.body.content,      
        
    }},
     {new: true})
      .then((result)=>{
          if (result) {
               req.flash('success', "Implementation Table Page has been updated");            
            res.redirect("dashboard/implementation-table")
          } else {
            res.send("error")
          }
      })
       
      
     // res.send("test")
    }
  })
})

router.get('/dashboard/staff', function (req, res, next) {
  let upload = req.flash('upload');
    let failure = req.flash('failure');
    let success = req.flash('success');            
    
    Page.find({name: 'staff'}).then(function(result){
      if (result){
        console.log(result)
     res.render('backend/staff', { upload, failure, result, success }) 

      }else{
     res.render('backend/staff', { upload, failure, success }) 
        
      }
    })
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


router.put("/updatestaff", function (req, res){

  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
      console.log(req.files);
      Page.findOneAndUpdate({name: "staff"},
       {$set:{
        newImg: '/uploads/' + req.files['newImg'][0].filename,
        content: req.body.content,      
        
    }},
     {new: true})
      .then((result)=>{
          if (result) {
               req.flash('success', "Staff Page has been updated");            
            res.redirect("/dashboard/staff")
          } else {
            res.send("error")
          }
      })
       
      
     // res.send("test")
    }
  })
})

router.post("/handlenews", function (req, res, next){
 
  upload(req, res, (err) => {
    if (err){
    
    //res.render('students', {msg : err})
   res.send(err)
    }else{
        console.log(req.files)

          let newNews = new News();

           newNews.title = req.body.title;
           newNews.writer = req.body.writer;
           newNews.department = req.body.department;
           newNews.content = req.body.content;
           newNews.newImg = '/uploads/'+ req.files["newImg"][0].filename;
     
           newNews.save().then((result)=>{
           if(result){
             console.log(result)  
               req.flash('upload', "News has been uploaded successfully");             
             res.redirect('dashboard/news');
           }else{
             res.send("err")
           }
         })


    }
  })
})

   

function  isLoggedIn(req, res,next){
  
  if (req.user.position=="head" && req.isAuthenticated()){
    return next()
  }

     res.redirect('/dashboard')

}

function  adminLoggedIn(req, res,next){
  
  if (req.user.position=="member" || req.user.position=="head" && req.isAuthenticated()){
    return next()
  }

     res.redirect('/dashboard')

}

router.get('/logout', function(req, res, next){
  req.logout()
  res.redirect('/login')
})


module.exports = router;
