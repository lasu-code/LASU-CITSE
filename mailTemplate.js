var sender = 'smtps://phawazzzy%40gmail.com'   // The emailto use in sending the email(Change the @ symbol to %40 or do a url encoding )
var password = 'Hardemola29$'  // password of the email to use

var nodeMailer = require("nodemailer");
var EmailTemplate = require('email-templates')


var transporter = nodeMailer.createTransport(sender + ':' + password + '@smtp.gmail.com');

// create template based sender function
// assumes text.{ext} and html.{ext} in template/directory
var sendResetPasswordLink = transporter.templateSender(
    new EmailTemplate('./emailTemplate/emailToSend'), {
        from: 'phawazzzy@gmail.com',
    });

exports.sendPasswordReset = function (email, username, name) {
    // transporter.template
    sendResetPasswordLink({
        to: "fawas.kareem170115028@st.lasu.edu.ng",
        subject: 'Password Reset - CITSE-DEMO.COM'
    }, {
        name: name,
        username: username,
        
    }, function (err, info) {
        if (err) {
            console.log(err)
        } else {
            console.log('Link sent\n' + JSON.stringify(info));
        }
    });
};