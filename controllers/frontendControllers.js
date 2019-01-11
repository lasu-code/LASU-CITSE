
let mongoose = require('mongoose')
let message = require('../models/message')
let Slider = require('../models/slider');
let nodemailer = require('nodemailer');
let News = require('../models/news');
let Page = require('../models/page');




exports.homePage = function (req, res, next) {
Slider.find({}).then((result)=>{
    if (result){
        News.find({}).then((doc)=>{
            if(doc){
    res.render('frontend/index', {result, doc});                                                    
            }
        })
    }else{
    res.render('frontend/index');                      
    }
})
}
    

exports.servicesPage = function (req, res, next) {
    res.render('extras/services', {});
};

exports.contactPage = function (req, res, next) {
  News.find({}).then((doc) => {
    if (doc) {
      res.render('frontend/contact', { doc });
      console.log(doc)
    } else {
      res.render('frontend/contact', {});
    }
  })  
};

exports.newsPage = function (req, res, next) {
  
   News.find({}).then((doc)=>{
    if (doc){
       res.render('extras/news', {doc})
      console.log(doc)
    }else{
       res.render('extras/news')      
    }
  })  

};

exports.teamPage = function (req, res, next) {
    
   News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/team', {doc});
          console.log(doc)
    }else{
    res.render('frontend/team', {});
    }
  })  
};

exports.jecPage = function (req, res, next) {
  Page.find({}).then((file)=>{
    if (file){
        News.find({}).then((doc)=>{
            if(doc){
    res.render('frontend/jec', {file, doc});                                                    
            }
        })
    }else{
    res.render('frontend/jec');                      
    }
})
  }

  exports.visionPage = function (req, res, next) {
    Page.find({}).then((file)=>{
      if (file){
          News.find({}).then((doc)=>{
              if(doc){
      res.render('frontend/vision', {file, doc});                                                    
              }
          })
      }else{
      res.render('frontend/vision');                      
      }
  })
    }


// exports.visionPage = function (req, res, next) {
//      News.find({}).then((doc)=>{
//       if (doc){
        
//     res.render('frontend/vision', {doc});
//           console.log(doc)
//     }else{
//     res.render('frontend/vision', {});
//     }
//   })
// };

exports.missionPage = function (req, res, next) {
  Page.find({}).then((file)=>{
    if (file){
        News.find({}).then((doc)=>{
            if(doc){
    res.render('frontend/mission', {file, doc});                                                    
            }
        })
    }else{
    res.render('frontend/mission');                      
    }
})
  }


exports.objectivesPage = function (req, res, next) {
     News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/objectives', {doc});
          console.log(doc)
    }else{
    res.render('frontend/objectives', {});
    }
  })
};

exports.retentionPage = function (req, res, next) {
     News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/retention', {doc});
          console.log(doc)
    }else{
    res.render('frontend/retention', {});
    }
  })

};

exports.recruitmentPage = function (req, res, next) {
     News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/recruitment', {doc});
          console.log(doc)
    }else{
    res.render('frontend/recruitment', {});
    }
  })

};

exports.staffPage = function (req, res, next) {
     News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/staff', {doc});
          console.log(doc)
    }else{
    res.render('frontend/staff', {});
    }
  })
};

exports.operationsPage = function (req, res, next) {
  News.find({}).then((doc) => {
    if (doc) {
      res.render('frontend/operations', { doc });
      console.log(doc)
    } else {
      res.render('frontendoperations', {});
    }
  })
};

exports.educationPage = (req, res, next)=>{
     News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/education', {doc});
          console.log(doc)
    }else{
    res.render('frontend/education', {});
    }
  })
};

exports.learningPage = (req, res, next)=>{
     News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/learning', {doc});
          console.log(doc)
    }else{
    res.render('frontend/learning', {});
    }
  })
};

exports.teachingPage = (req, res, next)=>{
     News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/teaching', {doc});
          console.log(doc)
    }else{
    res.render('frontend/teaching', {});
    }
  })
};

exports.skillsPage = (req, res, next)=>{
     News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/skills', {doc});
          console.log(doc)
    }else{
    res.render('frontend/skills', {});
    }
  })
};

exports.innovationPage = (req, res, next)=>{
     News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/innovation', {doc});
          console.log(doc)
    }else{
    res.render('frontend/innovation', {});
    }
  })
};

exports.innovationAssPage = (req, res, next)=>{
     News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/innovationAss', {doc});
          console.log(doc)
    }else{
    res.render('frontend/innovationAss', {});
    }
  })
};

exports.onlineCoursePage = (req, res, next)=>{
     News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/onlineCourse', {doc});
          console.log(doc)
    }else{
    res.render('frontend/onlineCourse', {});
    }
  })
};

exports.researchPlanPage = (req, res, next)=>{
     News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/researchPlan', {doc});
          console.log(doc)
    }else{
    res.render('frontend/researchPlan', {});
    }
  })
}

exports.industrailPage = (req, res, next)=>{
     News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/industrail', {doc});
          console.log(doc)
    }else{
    res.render('frontend/industrail', {});
    }
  })
};

exports.partnershipPage = (req, res, next)=>{
     News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/partnership', {doc});
          console.log(doc)
    }else{
    res.render('frontend/partnership', {});
    }
  })
}
exports.implementationPage = function (req, res, next) {
     News.find({}).then((doc)=>{
    if (doc){
    res.render('frontend/implementation', {doc});
          console.log(doc)
    }else{
    res.render('frontend/implementation', {});
    }
  })
}

exports.post_contactPage =(req, res, next)=>{
    let messageData = {
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message
        
    }
    let newData = new message(messageData);
    newData.save()
    res.render('frontend/contact', {})

    
}

