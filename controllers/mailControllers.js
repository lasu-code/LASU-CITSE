let Message = require('../models/message')




let mailSender = require('../config/mailer')

exports.messages = (req, res, next) =>{

    Message.find({}).then((result) => {
        if(result){
            console.log(result)
            res.render('backend/messages', {result:result})
        } else {
            res.render('backend/messages')
        }
    })

}

exports.reply = (req, res, next) => {

    //sending email with SMTP, configuration using SMTP settings
    let mailOptions = {
        from: "lasu CITSE - <lasu_citse@gmail.com>", //sender adress
        // to: req.body.userMail,
        to: '6582c11462-624e8d@inbox.mailtrap.io',
        subject: "LASU CITSE",
        html: req.body.reply
    };

    mailSender(mailOptions)
        .catch((err) => {
            return next(err);
        })
        .then(() => {
            req.flash('success', 'Your message have been sent!');
        })

    res.redirect("dashboard/messages")
}
