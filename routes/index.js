const path = require("path");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require("multer");
// const fse = require("fs-extra");
const async = require("async");
const crypto = require("crypto");
const bcrypt = require("bcrypt-nodejs");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

let User = require("../models/users");
let News = require("../models/news");
let Slider = require("../models/slider");
let Page = require("../models/page");
let Contact = require("../models/contact");
let Settings = require("../models/settings");
let Partner = require("../models/partner");
let People = require("../models/people");
let Message = require("../models/message");

let controller = require("../controllers/frontendControllers");
let mailSender = require("../config/mailer");
let n = require("../config/cmsNav");
global.usrInfo = {};
global.siteInfo = {};
let oldImage = {};


// HANDLE IMAGES
// -----
// CLOUDINARY STORAGE
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,     //"dyieekcre"
    api_key:  process.env.CLOUD_KEY,        //"732513327822775"
    api_secret: process.env.CLOUD_SECRET    //"HzlXLGG447c9m92q6a8vhWoiR-c"
});
const cloudStorage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "citse",
    allowedFormats: ["jpg", "png"],
});

// DISK STORAGE CONFIG
// const diskStorage = multer.diskStorage({
//     destination: "./public/uploads",
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
//     }
// });

// Set multer runtime options
const multerOpts = {
    storage: cloudStorage,
    //limits: {fileSize: 10},
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
};

//check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Get ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Error Occured: Upload Images Only!"));
    }
}
// Multer execute
const upload = multer(multerOpts);


// AUTH MIDDLEWARE, HELPER FUNCTIONS
// -----
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated() || req.user) {
        global.usrInfo.pos = req.user.position;
        global.usrInfo.name = req.user.name;
        return next();
    } else {
        console.error("Login to continue");
        req.flash("error", "Login to continue!");
        res.redirect("/login");
    }
}

function adminLoggedIn(req, res, next) {
    if (req.isAuthenticated() && req.user.position == "head") {
        global.usrInfo.pos = req.user.position;
        global.usrInfo.name = req.user.name;
        return next();
    } else {
        console.error("Login to continue");
        req.flash("error", "Permission denied!");
        res.redirect("/dashboard");
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function logError(method, path, err) {
    console.error(`An error occured during ${method} (${path}): ${err}`);
}

function showError(req, m, p, e) {
    logError(m, p, e);
    return req.flash("error", "An error occured, try again or contact web admin!");
}

// Get old image path
async function getOldImage(req, res, next) {
    oldImage = await Page.findOne({ tag: req.params.tag.trim() });
    return next();
}

// remove old uploaded image
async function removeOldImage() {
    if (oldImage) {
        // Cloudinary
        cloudinary.uploader.destroy( oldImage.publicid, function(result) { console.log("Removed image at", oldImage.postImage), " ==> status", result; });

        // Disk
        // fse.remove("\public" + oldImage.postImage)
        //      .catch(err => {
        //          console.error(err)
        //      })
    }
}

function setSiteInfo(result) {
    global.siteInfo = {};
    for (let d in result) {
        global.siteInfo[result[d].name] = result[d].value;
    }
}

// SITE SETTINGS MIDDLEWARE
// -----
router.use(async (req, res, next) => {
    if (Object.values(global.siteInfo).length < 1) {
        try {
            let result = await Settings.find({});
            setSiteInfo(result);
        } catch(err) {
            showError(req, "GET", "settings object", err);
        }
    }
    next();
});


// DASHBOARD ROUTES
// -----
// Access Control
router.get("/login", function (req, res) {
    let success = req.flash("success");
    let error = req.flash("error");

    res.render("backend/login", { success, error });
});

router.post("/login/admin", passport.authenticate("local.loginAdmin", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true
}));

router.get("/signup", function (req, res) {
    res.render("backend/signup");
});

router.get("/logout", function (req, res) {
    req.logout();
    global.usrInfo = {};
    res.redirect("/login");
});

router.get("/dashboard", isLoggedIn, function (req, res) {
    res.render("backend/dashboard");
});

router.get("/forgot",function (req, res) {
    res.render("backend/forgot");
});

router.post("/forgot", function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString("hex");
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    req.flash("error", "No account with that email address exists!");
                    return res.redirect("/forgot");
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            let mailOptions = {
                to: req.body.email,
                subject: "Password Reset",
                text: "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
                "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
                "https://" + req.headers.host + "/reset/" + token + "\n\n" +
                "If you did not request this, please ignore this email and your password will remain unchanged.\n"
            };
            mailSender(mailOptions)
                .catch((err) => {
                    return next(err);
                })
                .then(() => {
                    req.flash("success", "An e-mail has been sent to " + req.body.email + " with further instructions.");
                    done(null, "done");
                });
        }
    ], function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/forgot");
    });
});

router.get("/reset/:token", function (req, res) {
    let success = req.flash("success");
    let error = req.flash("error");
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {

        if (!user) {
            req.flash("error", "Invalid user!");
            return res.redirect("/forgot");
        }
        res.render("backend/reset", { token: req.params.token, success, error });
    });
});

router.post("/reset/:token", async function (req, res, next) {
    User.findOneAndUpdate(
        { resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },
        { $set: { password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)), resetPasswordToken: undefined } },
        { new: true },
        (err, doc) => {
            if (err) {
                console.log("Something wrong when updating data!");
                req.flash("error", "An error occured during password update, try again!");
            } else {
                let mailOptions = {
                    to: doc.email,
                    subject: "Your password has been changed",
                    text: "Hello,\n\n" + "This is a confirmation that the password for your account " + doc.email + " has just been changed.\n"
                };
                mailSender(mailOptions)
                    .catch((err) => {
                        return next(err);
                    });
                req.flash("success", "Success! Your password has been changed, login to continue");
            }

            res.redirect("/login");
        });

});

router.get("/dashboard", isLoggedIn, function (req, res) {
    res.render("backend/dashboard");
});

// -----
// Admin
router.get("/dashboard/authorizeadmins", adminLoggedIn, function (req, res) {
    User.find({}).then((result) => {
        if (result) {
            res.render("backend/authorize", { result });
        } else {
            res.render("backend/authorize");
        }
    });
});

router.post("/createAccount", function (req, res) {
    let newUser = new User();

    newUser.name = req.body.name;
    newUser.email = req.body.email;
    newUser.password = newUser.generateHash(req.body.password);
    newUser.position = req.body.position;

    newUser.save().then((result) => {
        if (result) {
            res.redirect("/dashboard/authorizeadmins");
        } else if (!result) {
            res.send("error");
        }
    });
});

router.delete("/deleteadmin", async function (req, res) {

    try {
        let result = await User.deleteOne({ _id: req.body.id });
        if (result) {
            req.flash("success", "Admin deleted successfully");
        } else {
            req.flash("error", "An error occured, try again");
        }
    } catch(err) {
        req.flash("error", `An error occured, try again: ${err}`);
    }
    res.redirect("/dashboard/authorizeadmins");

});

router.route("/dashboard/settings")
    .all(adminLoggedIn)
    .get(async function (req, res) {
        let result = "";
        try {
            result = await Settings.find({});
            setSiteInfo(result);
        } catch(err) {
            showError(req, "GET", "/dashboard/settings", err);
        }
        res.render("backend/settings", { result });
    })
    .post(upload.single("siteLogo"), async function (req, res) {
        let pageData = {
            one: {
                name: "siteName",
                value: req.body.siteName
            },
            three: {
                name: "contactEmails",
                value: req.body.contactEmails
            }
        };
        if (req.file) {
            pageData.two = {
                name: "siteLogo",
                value: req.file.secure_url
            };
        }
        for(let d in pageData) {
            try {
                await Settings.findOneAndUpdate({name: pageData[d].name}, pageData[d], { upsert: true, new: true });
                req.flash("success", "Settings Updated Successfully!");
            } catch(err) {
                showError(req, "POST", "/dashboard/settings", err);
            }
        }
        res.redirect("/dashboard/settings");
    });

// ----
// Partners
router.route("/dashboard/partners")
    .all(isLoggedIn)
    .get(async function (req, res) {
        let result = "";
        try {
            result = await Partner.find({});
        } catch (err) {
            result = "";
            showError(req, "GET", "dashboard/partners", err);
        }

        res.render("backend/partner", { result });
    });

router.route("/dashboard/partner/add")
    .all(isLoggedIn)
    .get (function(req, res){
        try {
            res.render("backend/partner-add");
        } catch (err) {
            showError(req, "GET", "dashboard/partners/add", err);
            res.redirect("/dashboard");
        }
    })
    .post( upload.single("postImage"), async function(req, res){
        let pageData = {
            name: req.body.name,
            content: req.body.content
        };
        if (req.file) {
            pageData.postImage = req.file.secure_url;
            pageData.publicid = req.file.public_id;
        }

        try {
            await Partner.create(pageData);
            req.flash("success", "Partner Creation Successful!");
        } catch(err) {
            showError(req, "POST", "/dashboard/partner/add", err);
        }

        res.redirect("/dashboard/partners");
    });

router.route("/dashboard/partner/edit/:id")
    .all(isLoggedIn)
    .get(async function(req, res){
        let id = req.params.id, result;
        try {
            result = await Partner.findById(id);
        } catch (err) {
            result = undefined;
            showError(req, "GET", `dashboard/partner/edit/${id}`, err);
        }
        res.render("backend/partner-add", { result, action: req.originalUrl });
    })
    .post(upload.single("postImage"), async function(req, res){
        let idd = req.params.id;

        let pageData = {
            name: req.body.name,
            content: req.body.content,
        };
        if (req.file) {
            oldImage = await Partner.findOne({ _id: idd });
            removeOldImage();

            pageData.postImage = req.file.secure_url;
            pageData.publicid = req.file.public_id;
        }

        try {
            await Partner.findOneAndUpdate({_id: idd}, pageData, { upsert: true });
            req.flash("success", "Partner updated successfully");
        } catch(err) {
            showError(req, "POST", `/dashboard/partner/edit/${idd}`, err);
        }
        res.redirect("/dashboard/partners");
    });

router.delete("/dashboard/partner/delete/:id", async function (req, res) {
    let idd = req.params.id;

    oldImage = await Partner.findOne({ _id: idd });
    removeOldImage();

    try {
        await Partner.deleteOne({ _id: req.body.id });
        req.flash("success", "Partner deleted successfully!");
    } catch(err) {
        showError(req, "DELETE", `/dashboard/partner/delete/${idd}`, err);
    }
    res.redirect("/dashboard/partners");
});

// ----
// Center Leaders
router.route("/dashboard/leaders")
    .all(isLoggedIn)
    .get(async function (req, res) {
        let result = "";
        try {
            result = await People.find({tag: "centre-leaders"});
        } catch(err) {
            showError(req, "GET", "/dashboard/leaders", err);
        }
        res.render("backend/leaders", { result });
    });

router.route("/dashboard/leader/add")
    .all( adminLoggedIn)
    .get ((req, res) => {
        res.render("backend/leader-add");
    })
    .post(upload.single("postImage"), async function (req, res) {
        let pageData = {
            name: req.body.name,
            work_at: req.body.work_at,
            position: req.body.position,
            email: req.body.email,
            phone: req.body.phone,
            work_info_1: req.body.work_info_1,
            work_info_2: req.body.work_info_2,
            tag: "centre-leaders",
            is_active: 1,

        };
        if (req.file) {
            pageData.postImage = req.file.secure_url;
            pageData.publicid = req.file.public_id;
        }

        try {
            await People.create(pageData);
            req.flash("success", "Centre Leader Creation Successful!");
        } catch (err) {
            showError(req, "POST", "/dashboard/leader/add", err);
        }

        res.redirect("/dashboard/leaders");
    });

router.route("/dashboard/leader/edit/:id")
    .all(isLoggedIn)
    .get(async function (req, res) {
        let id = req.params.id, result;
        try {
            result = await People.findById(id);
        } catch (err) {
            result = undefined;
            showError(req, "GET", `dashboard/leader/edit/${id}`, err);
        }
        res.render("backend/leader-add", { result, action: req.originalUrl });
    })
    .post(upload.single("postImage"), async function (req, res) {
        let idd = req.params.id;

        let pageData = {
            name: req.body.name,
            work_at: req.body.work_at,
            position: req.body.position,
            email: req.body.email,
            phone: req.body.phone,
            work_info_1: req.body.work_info_1,
            work_info_2: req.body.work_info_2,
            is_active: req.body.is_active,
            tag: "centre-leaders"
        };
        if (req.file) {
            oldImage = await Partner.findOne({ _id: idd });
            removeOldImage();

            pageData.postImage = req.file.secure_url;
            pageData.publicid = req.file.public_id;
        }

        try {
            await People.findOneAndUpdate({ _id: idd }, pageData, { upsert: true });
            req.flash("success", "Centre Leader updated successfully");
        } catch (err) {
            showError(req, "POST", `/dashboard/leader/edit/${idd}`, err);
        }
        res.redirect("/dashboard/leaders");
    });

router.delete("/dashboard/leader/delete/:id", async function (req, res) {
    let idd = req.params.id;

    oldImage = await People.findOne({ _id: idd });
    removeOldImage();

    try {
        await People.deleteOne({ _id: req.body.id });
        req.flash("success", "Centre Leader record deleted successfully!");
    } catch (err) {
        showError(req, "DELETE", `/dashboard/leader/delete/${idd}`, err);
    }
    res.redirect("/dashboard/leaders");

});

// ----
// VC Speech
router.route("/dashboard/speech")
    .all(isLoggedIn)
    .get(async function(req, res) {
        let result = "";
        try {
            result = await Page.findOne({tag: "vc_speech"});
        } catch(err) {
            showError(req, "GET", "/dashboard/speech", err);
        }
        res.render("backend/speech", { result });
    })
    .post(upload.single("postImage"), async function(req, res){

        let speechData = {
            postImageCaption: req.body.postImageCaption,
            summary: req.body.vc_name,
            content: req.body.content
        };

        if (req.file) {
            // remove old image
            try {
                oldImage = await Page.findOne({tag: "vc_speech"});
                removeOldImage();
            } catch(err) {
                console.error("Error occured during delete of old image: ", err);
            }

            // write new image info
            speechData.postImage = req.file.secure_url;
            speechData.publicid = req.file.public_id;
        }

        try {
            await Page.findOneAndUpdate({tag: "vc_speech"}, speechData, { upsert: true });
            req.flash("success", "PAGE (VC Speech) - Content Update Successful!");
        } catch(err) {
            showError(req, "POST", "/dashboard/speech", err);
        }
        res.redirect("/dashboard/speech");
    });

// -----
// Slider
router.route("/dashboard/sliders")
    .all(isLoggedIn)
    .get(async function (req, res) {
        let result = "";
        try {
            result = await Slider.find().sort({_id: -1});
        } catch(err) {
            showError(req, "GET", "/dashboard/slider", err);
        }
        res.render("backend/sliders", { result });
    });

router.route("/dashboard/slider/add")
    .all(isLoggedIn)
    .get(function (req, res) {
        res.render("backend/slider-add");
    })
    .post(upload.single("postImage"), async (req, res) => {
        let pageData = {
            name: req.body.name,
            text_on_img: req.body.text_on_img,
            img_link: req.body.img_link,
            img_link_text: req.body.img_link_text,
            is_visible: req.body.is_visible
        };
        if (req.file) {
            pageData.postImage = req.file.secure_url;
            pageData.publicid = req.file.public_id;
        }

        try {
            await Slider.create(pageData);
            req.flash("New Slider created successfully!");
        } catch(err) {
            showError(req, "POST", "/dashboard/slider/add", err);
        }
        res.redirect("/dashboard/sliders");
    });

router.route("/dashboard/slider/edit/:id")
    .all(isLoggedIn)
    .get(async function(req, res){
        let id = req.params.id, result;
        try {
            result = await Slider.findById(id);
        } catch (err) {
            result = undefined;
            showError(req, "GET", `dashboard/slider/edit/${id}`, err);
        }
        res.render("backend/slider-add", { result, action: req.originalUrl });
    })
    .post(upload.single("postImage"), async function(req, res){

        let idd = req.params.id;
        oldImage = await Slider.findOne({_id: idd});
        removeOldImage();

        let sliderData = {
            name: req.body.name,
            text_on_img: req.body.text_on_img,
            img_link: req.body.img_link,
            img_link_text: req.body.img_link_text,
            is_visible: req.body.is_visible

        };
        if (req.file) {
            sliderData.postImage = req.file.secure_url;
            sliderData.publicid = req.file.public_id;
        }
        try {
            await Slider.findOneAndUpdate({ _id: idd }, sliderData, { upsert: true });
            req.flash("success", "Slider updated successfully");
        } catch(err) {
            showError(req, "POST", `/dashboad/slider/edit/${idd}`, err);
        }
        res.redirect("/dashboard/sliders");
    });


// -----
// News
router.route("/dashboard/news")
    .all(isLoggedIn)
    .get(async (req, res) => {
        let result = "";
        try {
            result = await News.find({}).sort({createdDate: -1});
        } catch(err) {
            showError(req, "GET", "/dashboard/news", err);
        }
        res.render("backend/news", { result });
    });

router.route("/dashboard/news/add")
    .all(isLoggedIn)
    .get((req, res) => {
        res.render("backend/news-add");
    })
    .post(upload.single("newsImage"), async (req, res) => {
        let pageData = {
            title: req.body.title,
            summary: req.body.summary,
            content: req.body.content,
            author: req.body.author,
            tags: req.body.tags,
            meta_keyword: req.body.meta_keyword,
            meta_desc: req.body.meta_desc,
            is_visible: req.body.is_visible
        };
        if (req.file) {
            pageData.newsImage = req.file.secure_url;
            pageData.newsImageId = req.file.public_id;
        }

        try {
            await News.create(pageData);
            req.flash("success", "News created successfully!");
        } catch (err) {
            showError(req, "POST", "/dashboard/news/add", err);
        }
        res.redirect("/dashboard/news");
    });

router.route("/dashboard/news/edit/:id")
    .all(isLoggedIn)
    .get(async (req, res) => {
        let id = req.params.id, result;
        try {
            result = await News.findById(id);
        } catch (err) {
            result = undefined;
            showError(req, "GET", `dashboard/news/edit/${id}`, err);
        }
        res.render("backend/news-add", { result, action: req.originalUrl });
    })
    .post(upload.single("newsImage"), async (req, res) => {
        let idd = req.params.id;
        oldImage = await News.findOne({ _id: idd });
        removeOldImage();

        let pageData = {
            title: req.body.title,
            summary: req.body.summary,
            content: req.body.content,
            author: req.body.author,
            tags: req.body.tags,
            meta_keyword: req.body.meta_keyword,
            meta_desc: req.body.meta_desc,
            is_visible: req.body.is_visible
        };
        if (req.file) {
            pageData.postImage = req.file.secure_url;
            pageData.publicid = req.file.public_id;
        }
        try {
            await News.findOneAndUpdate({ _id: idd }, pageData, { upsert: true });
            req.flash("success", "News updated successfully");
        } catch (err) {
            showError(req, "POST", `/dashboad/news/edit/${idd}`, err);
        }
        res.redirect("/dashboard/news");
    });

router.delete("/dashboard/news/delete/:id", async function (req, res) {
    let idd = req.params.id;
    oldImage = await News.findOne({ _id: idd });
    removeOldImage();
    try {
        await News.deleteOne({ _id: req.body.id });
        req.flash("success", "News deleted successfully!");
    } catch(err) {
        showError(req, "DELETE", `/dashboard/news/delete/${idd}`, err);
    }
    res.redirect("/dashboard/news");
});

// ----
// Admin Settings
router.get("/dashboard/adminSettings", function (req, res) {
    let success = req.flash("succes");
    let failure = req.flash("failure");
    res.render("backend/adminSettings", {success, failure, email: req.user.email});
});

router.put("/dashboard/adminSettings/email", function (req, res) {
    if (req.body.dbEmail == req.user.email) {
        User.findByIdAndUpdate({ _id: req.user._id }, { email: req.body.newEmail })
            .exec()
            .then(() => {
                req.flash("success", "Email Change Successfull!");
                res.redirect("/dashboard");
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        req.flash("info", "Incorrect Email!");
        res.redirect("/dashboard/adminSettings");
    }
});

router.put("/dashboard/adminSettings/password", function (req, res) {
    bcrypt.compare(req.body.dbPass, req.user.password, function (err, usr) {
        if (err) {
            console.log(err);
            req.flash("error", "An error occured, try again");
        }
        if (!usr) {
            req.flash("error", "Incorrect password");
            res.redirect("/dashboard/adminSettings");
        } else {
            User.findByIdAndUpdate({ _id: req.user._id }, { password: bcrypt.hashSync(req.body.newPass, bcrypt.genSaltSync(10))})
                .exec()
                .then(() => {
                    req.flash("success", "Password Successfully changed");
                    res.redirect("/dashboard");
                })
                .catch((err) => {
                    console.log(err);
                });
        }

    });
});

router.delete("/dashboard/adminSettings/delete", function (req, res) {

    bcrypt.compare(req.body.password, req.user.password, function (err, data) {
        if (err) {
            console.log(err);
        }
        if (data){
            User.findByIdAndRemove({ _id: req.user._id })
                .exec()
                .then(() => {
                    res.redirect("/login");
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        else {
            console.log("unmatch");
            res.redirect("/dashboard/adminSettings");
        }
    });

});

// -----
// Contact
router.route("/dashboard/contact-us")
    .all(isLoggedIn)
    .get(async (req, res) => {
        let req_url = req.originalUrl;
        let data = "";

        try {
            data = await Contact.find({});
        } catch(err) {
            data = [];
            console.error(`Error occured during GET(/dashboard/contact-us): ${err}`);
            req.flash("error", "An error occured, try again or contact web admin!");
        }

        res.render("backend/contact-us", { req_url, content: data[0], page: "contact-us", activeParent: "about" });
    })
    .post( async (req, res) => {
        let pageData = {
            address: req.body.address,
            phone: req.body.phone,
            email: req.body.email,
            mapLongitude: req.body.mapLongitude,
            mapLatitude: req.body.mapLatitude,
            is_active: true,
            // _id = (req.body.id) ? req.body.id : ""
        };

        try {
            await Contact.findOneAndUpdate({}, pageData, { upsert: true });
            req.flash("success", "PAGE (Contact Us) - Content Update Successful!");
        } catch(err) {
            console.error(`Error occured during POST(/dashboard/contact-us): ${err}`);
            req.flash("error", "Error occured while updating 'Contact Page', try again or contact the web admin");
        }
        res.redirect("/dashboard/contact-us");
    });

// -----
// Staff    -   NOT USED
router.get("/dashboard/staffs", function (req, res) {
    let upload = req.flash("upload");
    let failure = req.flash("failure");
    res.render("backend/staff", { upload, failure });
});

router.post("/poststaff", function (req, res) {
    upload(req, res, (err) => {
        if (err) {

            //res.render("students", {msg : err})
            res.send(err);
        } else {
            console.log(req.files);
            Page.findOne({ name: "staff" }).then(function (result) {
                if (result) {

                    req.flash("failure", "Sorry You can only update not create new ones");
                    res.redirect("dashboard/staff");


                } else if (!result) {

                    let newPage = new Page();

                    newPage.name = req.body.name;
                    newPage.content = req.body.content;
                    newPage.newImg = req.file.secure_url;

                    newPage.save().then((result) => {
                        if (result) {
                            console.log(result);
                            req.flash("upload", "Staff page has been uploaded successfully");
                            res.redirect("dashboard/staff");
                        } else {
                            res.send("err");
                        }
                    });

                    // console.log("sorry cannot save new data")
                }
                //    // res.send("test")
            });
        }
    });
});

router.get("/dashboard/messages", adminLoggedIn, (req, res) => {
    Message.find({}).then((result) => {
        if (result) {
            console.log(result);
            res.render("backend/messages", { result: result });
        } else {
            res.render("backend/messages");
        }
    });
});

router.post("/reply", (req, res) => {
    res.redirect("dashboard/messages");
});

// -----
// About pages
// Education pages
// Research pages
// Recruitment pages
// Management pages
router.route("/dashboard/:tag")
    .all(isLoggedIn)
    .get(async (req, res) => {
        let req_url = req.originalUrl;
        let page_tag = req.params.tag.trim();
        let page_obj = n[page_tag.replace(/(-)+/gi, "_")];
        let content = "";

        try {
            content = await Page.findOne({ tag: page_tag });
        } catch(err) {
            showError(req, "GET", `/dashboard/${page_tag}`, err);
        }
        res.render("backend/template-one", { req_url, page: page_tag, content, activeParent: page_obj.parent, title: page_obj.title, usrInfo });
    })
    .post(getOldImage, upload.single("postImage"), async (req, res) => {
        removeOldImage();

        let page_tag = req.params.tag.trim();
        let pageData = {
            tag: page_tag,
            name: req.body.name,
            summary: req.body.summary,
            content: req.body.content,
            postImageCaption: req.body.postImageCaption,
            meta_key: req.body.meta_key,
            meta_desc: req.body.meta_desc,
            is_active: 1
        };
        if (req.file) {
            pageData.postImage = req.file.secure_url;
            pageData.publicid = req.file.public_id;
        }

        try {
            await Page.findOneAndUpdate({ tag: page_tag }, pageData, { upsert: true });
            req.flash("success", `PAGE (${capitalize(page_tag)}) - Content Update Successful!`);
        } catch(err) {
            showError(req, "POST", `/dashboard/${page_tag}`, err);
        }
        res.redirect("/dashboard/" + page_tag);
    });


// WEBSITE ROUTES
// -----
router.get("/", controller.homePage);
router.get("/services", controller.servicesPage);
router.get("/contact", controller.contactPage);
router.post("/post-contact", controller.post_contactPage);
router.get("/team", controller.teamPage);
router.get("/news/article/:name/:id", controller.newsPage);
router.get("/news", controller.newsListsPage);
router.get("/:page_name", controller.renderPage);
router.post("/subscribe", controller.subscribe);

module.exports = router;
