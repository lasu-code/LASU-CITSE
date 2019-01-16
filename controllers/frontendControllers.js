
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
  Page.find({name: "contactus"}).then((file)=>{
      if (file){
          News.find({}).then((doc)=>{
              if(doc){
      res.render('frontend/contact', {file, doc});                                                    
              }
          })
      }else{
      res.render('frontend/contact');                      
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
  Page.find({name: "justification"}).then((file)=>{
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
    Page.find({name: "vision"}).then((file)=>{
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
  Page.find({name: "mission"}).then((file)=>{
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
  Page.find({name: "objectives"}).then((file)=>{
    if (file){
        News.find({}).then((doc)=>{
            if(doc){
    res.render('frontend/objectives', {file, doc});                                                    
            }
        })
    }else{
    res.render('frontend/objectives');                      
    }
})
};

exports.retentionPage = function (req, res, next) {
    Page.find({name: "retention-support"}).then((file)=>{
        if (file){
            News.find({}).then((doc)=>{
                if(doc){
        res.render('frontend/retention', {file, doc});                                                    
                }
            })
        }else{
        res.render('frontend/retention');                      
        }
    })

};

exports.recruitmentPage = function (req, res, next) {
    Page.find({name: "student-recruitment"}).then((file)=>{
        if (file){
            News.find({}).then((doc)=>{
                if(doc){
        res.render('frontend/recruitment', {file, doc});                                                    
                }
            })
        }else{
        res.render('frontend/recruitment');                      
        }
    })
};

exports.staffPage = function (req, res, next) {
    Page.find({name: "staff"}).then((file)=>{
        if (file){
            News.find({}).then((doc)=>{
                if(doc){
        res.render('frontend/staff', {file, doc});                                                    
                }
            })
        }else{
        res.render('frontend/staff');                      
        }
    })
};

exports.operationsPage = function (req, res, next) {
    Page.find({name: "centre-operations"}).then((file)=>{
        if (file){
            News.find({}).then((doc)=>{
                if(doc){
        res.render('frontend/operations', {file, doc});                                                    
                }
            })
        }else{
        res.render('frontend/operations');                      
        }
    })
};

exports.educationPage = (req, res, next)=>{
  Page.find({name: "education"}).then((file)=>{
    if (file){
        News.find({}).then((doc)=>{
            if(doc){
    res.render('frontend/education', {file, doc});                                                    
            }
        })
    }else{
    res.render('frontend/education');                      
    }
})
};

exports.learningPage = (req, res, next)=>{
  Page.find({name: "learning-activities"}).then((file)=>{
    if (file){
        News.find({}).then((doc)=>{
            if(doc){
    res.render('frontend/learning', {file, doc});                                                    
            }
        })
    }else{
    res.render('frontend/learning');                      
    }
})
};

exports.teachingPage = (req, res, next)=>{
  Page.find({name: "teaching"}).then((file)=>{
    if (file){
        News.find({}).then((doc)=>{
            if(doc){
    res.render('frontend/teaching', {file, doc});                                                    
            }
        })
    }else{
    res.render('frontend/teaching');                      
    }
})
};

exports.skillsPage = (req, res, next)=>{
  Page.find({name: "gaps"}).then((file)=>{
    if (file){
        News.find({}).then((doc)=>{
            if(doc){
    res.render('frontend/skills', {file, doc});                                                    
            }
        })
    }else{
    res.render('frontend/skills');                      
    }
})
};

exports.innovationPage = (req, res, next)=>{
    Page.find({name: "innovations-p"}).then((file)=>{
        if (file){
            News.find({}).then((doc)=>{
                if(doc){
        res.render('frontend/innovation', {file, doc});                                                    
                }
            })
        }else{
        res.render('frontend/innovation');                      
        }
    })
};

exports.innovationAssPage = (req, res, next)=>{
    Page.find({name: "innovations-a"}).then((file)=>{
        if (file){
            News.find({}).then((doc)=>{
                if(doc){
        res.render('frontend/innovationAss', {file, doc});                                                    
                }
            })
        }else{
        res.render('frontend/innovationAss');                      
        }
    })
};

exports.onlineCoursePage = (req, res, next)=>{
    Page.find({name: "online-courses"}).then((file)=>{
        if (file){
            News.find({}).then((doc)=>{
                if(doc){
        res.render('frontend/onlineCourse', {file, doc});                                                    
                }
            })
        }else{
        res.render('frontend/onlineCourse');                      
        }
    })
};

exports.researchPlanPage = (req, res, next)=>{
    Page.find({name: "research-plan"}).then((file)=>{
        if (file){
            News.find({}).then((doc)=>{
                if(doc){
        res.render('frontend/researchPlan', {file, doc});                                                    
                }
            })
        }else{
        res.render('frontend/researchPlan');                      
        }
    })
}

exports.industrailPage = (req, res, next)=>{
    Page.find({name: "isp"}).then((file)=>{
        if (file){
            News.find({}).then((doc)=>{
                if(doc){
        res.render('frontend/industrail', {file, doc});                                                    
                }
            })
        }else{
        res.render('frontend/industrail');                      
        }
    })
};

exports.partnershipPage = (req, res, next)=>{
    Page.find({name: "partnership"}).then((file)=>{
        if (file){
            News.find({}).then((doc)=>{
                if(doc){
        res.render('frontend/partnership', {file, doc});                                                    
                }
            })
        }else{
        res.render('frontend/partnership');                      
        }
    })
}
exports.implementationPage = function (req, res, next) {
    Page.find({name: "implementation"}).then((file)=>{
        if (file){
            News.find({}).then((doc)=>{
                if(doc){
        res.render('frontend/implementation', {file, doc});                                                    
                }
            })
        }else{
        res.render('frontend/implementation');                      
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

