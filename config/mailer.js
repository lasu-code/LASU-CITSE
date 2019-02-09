const nodemailer = require("nodemailer");
const Email = require("email-templates");

const emailInst = new Email({
    message: {
        from: process.env.MAIL_USER
    },
    send: true,
    preview: false,
    views: {
        options: {
            extension: "ejs"
        }
    },
    transport: nodemailer.createTransport({
        service: "gmail",
        port: process.env.MAIL_PORT || 25,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PWD
        },
        tls: {
            rejectUnauthorized: false
        }
    })
});

let mailer = {
    sendFrom: function(mailFrom = process.env.MAIL_USER) {
        emailInst.config.message.from = mailFrom;
    },
    sendMail: async function(mailData) {
        await emailInst.send({
            template: mailData.template,
            message: {
                to: mailData.rx
            },
            locals: mailData.locals
        });
    }
};

module.exports = mailer;