const nodemailer = require('nodemailer');

let smtpTransport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    // secure: process.env.MAIL_SECURITY || false,
    port: process.env.MAIL_PORT || 25,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PWD || keys.keys.password
    },
    // tls: {
    //     rejectUnauthorized: false
    // }
});

let mailOptions = {
    from: 'info.acetise@lasu.edu.ng'
};

function setMailOptions (optionObj) {
    for (let key in optionObj) {
        mailOptions[key] = optionObj[key];
    }
}

module.exports = async (mOpt) => {
    setMailOptions(mOpt);
    await smtpTransport.sendMail(mailOptions);
};