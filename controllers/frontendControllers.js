let message = require('../models/message')
let Slider = require('../models/slider');
let News = require('../models/news');
let Page = require('../models/page');
let nodemailer= require('nodemailer')
// let keys = require('../config/keys.js')
let subscribe = require('../models/subscribe')
let Contact = require('../models/contact');
let Mail = require('../models/contactaddress')
let Sponsor = require('../models/sponsor')


let f = require('../config/frontNav');
let allNews = News.find({});
let allSponsors = Sponsor.find({});

exports.homePage = function (req, res, next) {
    (async () => {
        let sliders = Slider.find({})
        let mission = Page.find({ tag: 'mission' })
        let vision = Page.find({ tag: 'vision' })
        let objectives = Page.find({ tag: 'objectives' })

        const [sld, mss, vss, obj, news, Sponsor] =
            await Promise.all(
                [sliders, mission, vision, objectives, allNews, allSponsors]
            );

        res.render('frontend/index', {result: sld, mission: mss[0], vision: vss[0], obj: obj[0], doc: news, activeNav: 'home', Sponsor });
    })()
}

exports.renderPage = function (req, res, next) {
    let navIndex = req.path.substr(1);
    if (typeof f[navIndex] === 'undefined') {
        (async () => {
            const [news, Sponsor] = await Promise.all(
                [allNews, allSponsor]
            );

            res.render('frontend/404', {activeNav: '', navIndex, doc: news, Sponsor });
        })()
    } else {
        let thisPage = f[navIndex].data;
        let activeNav = f[navIndex].nav;
        (async () => {
            let pageData = Page.find({ tag: thisPage })

            const [dt, news, Sponsor] =
                await Promise.all(
                    [pageData, allNews, allSponsors]
                );

            res.render('frontend/template', { content: dt[0], doc: news, title: navIndex.replace(/(-)+/gi, ' '), activeNav, Sponsor });
        })()
    }
}

exports.servicesPage = function (req, res, next) {
    res.render('extras/services', {});
};

exports.contactPage = function (req, res, next) {
    (async () => {
        let subscribeData = {
            email: req.body.newsletterEmail1,
        }

        let newData = new subscribe(subscribeData);
        newData.save()


        let pageData = Contact.find({})

        const [dt, news] =
            await Promise.all(
                [pageData, allNews]
            );

        res.render('frontend/contact', { content: dt[0], doc: news, activeNav: 'about', gmap_api_key: process.env.GMAP_API_KEY });
    })()
};

exports.newsPage = function (req, res, next) {
    let newsID = req.params.id;
    News.findOne({ _id: newsID })
        .exec()
        .then((oneNews) => {
            News.find({}).exec().then((doc) => {
                if (doc) {
                    res.render('extras/news', {oneNews, doc, activeNav: 'news' })
                } else {
                    res.render('extras/news')
                }
            })
        })
};



exports.newsListsPage = function (req, res, next) {

    News.find({}).then((doc) => {
        if (doc) {
            res.render('extras/news-lists', { doc, activeNav: 'news' })
        } else {
            res.render('extras/news-lists')
        }
    })

};

exports.teamPage = function (req, res, next) {

    News.find({}).then((doc)=>{
        if (doc){
            res.render('frontend/team', { doc, activeNav: 'management' });
            console.log(doc)
        }else{
            res.render('frontend/team', {});
        }
    })
};

exports.post_contactPage = async function (req, res, next) {
    let result = await Mail.find({})
    let address = result.map((val, index, arr) => val.email);
   
    (function sendMail() {
        const mailOptions = {
            to: address,
            subject: req.body.subject,
            text: req.body.message
        };
        
        smtpTransport.sendMail(mailOptions, function (err) {
            console.log('An e-mail has been sent to  with further instructions.');
            
        });
            
    })();
           
    res.redirect('/contact');
}

exports.subscribe = function (req, res, next){
    let subscribeData = {
        email: req.body.newsletterEmail,
    }

    let newData = new subscribe(subscribeData);
    newData.save()

    res.redirect(req.originalUrl)
}
