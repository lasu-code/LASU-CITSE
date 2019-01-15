let message = require('../models/message')
let keys = require('../config/keys.js')
let nodemailer= require('nodemailer')

exports.login = function(req, res, next){
    res.render('backend/login')
}

exports.messages = (req,res,next) =>{
    
    message.find({}).then((result)=>{
        if(result){
        console.log(result)
    res.render('backend/messages', {result:result})
        }else{
    res.render('backend/messages')

        }
        
    })

}

exports.reply =(req, res, next)=>{
    let Transport = nodemailer.createTransport({
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
  
      //sending email with SMTP, configuration using SMTP settings
      let mailOptions = {
        from: "lasu CITSE - <phawazzzy@gmail.com>", //sender adress
        to: req.body.userMail, 
        subject: "LASU CITSE" ,
        html: req.body.reply 
      };
  
      Transport.sendMail(mailOptions, (error, info)=>{
        if (error){
          console.log(error);
          console.log(mailOptions.html);
          
          //res.send("email could not send due to error:" + error);
        }else{
          console.log(info);
          console.log(mailOptions.html);
          
         // res.send("email has been sent successfully");
        }
        res.redirect("dashboard/messages")
      });
      
    res.redirect('dashboard/messages')
}