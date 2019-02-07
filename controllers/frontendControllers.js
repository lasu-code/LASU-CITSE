let message = require('../models/message')
let Slider = require('../models/slider');
let News = require('../models/news');
let Page = require('../models/page');
let subscribe = require('../models/subscribe')
let Contact = require('../models/contact');
let Mail = require('../models/contactaddress')
let Partner = require('../models/partner');
let People = require('../models/people');

let mailSender = require('../config/mailer');
let f = require('../config/frontNav');

let allNews = News.find({}).sort({'createdDate': -1}).limit(3);
let allPartners = Partner.find({});

exports.homePage = function (req, res) {
    (async () => {
        let sliders = Slider.find({})
        let mission = Page.find({ tag: 'mission' })
        let vision = Page.find({ tag: 'vision' })
        let objectives = Page.find({ tag: 'objectives' })
        let speech = Page.find({ tag: 'vc_speech' })

        const [sld, mss, vss, obj, news, spc, ptn] =
            await Promise.all(
                [sliders, mission, vision, objectives, allNews, speech, allPartners]
            );

        res.render('frontend/index', {result: sld, mission: mss[0], vision: vss[0], obj: obj[0], doc: news, activeNav: 'home', vc_speech: spc[0], partners: ptn });
    })()
}

exports.renderPage = function (req, res) {
    let navIndex = req.path.substr(1);
    if (typeof f[navIndex] === 'undefined') {
        (async () => {
            const news = await allNews;

            res.render('frontend/404', {activeNav: '', navIndex, doc: news });
        })()
    } else {
        let thisPage = f[navIndex].data;
        let activeNav = f[navIndex].nav;
        (async () => {
            let pageData = Page.find({ tag: thisPage })

            const [dt, news, ptn] =
                await Promise.all(
                    [pageData, allNews, allPartners]
                );

            res.render('frontend/template', { content: dt[0], doc: news, title: navIndex.replace(/(-)+/gi, ' '), activeNav, partners: ptn });
        })()
    }
}

exports.servicesPage = function (req, res) {
    res.render('extras/services', {});
};

exports.contactPage = function (req, res) {
    (async () => {
        let subscribeData = {
            email: req.body.newsletterEmail1,
        }

        let newData = new subscribe(subscribeData);
        newData.save()


        let pageData = Contact.find({})

        const [dt, news, ptn] =
            await Promise.all(
                [pageData, allNews, allPartners]
            );

        res.render('frontend/contact', { content: dt[0], doc: news, activeNav: 'about', gmap_api_key: process.env.GMAP_API_KEY, partners: ptn });
    })()
};

exports.newsPage = async function (req, res) {
    let newsID = req.params.id;
    let oneNews = News.findOne({ _id: newsID })

    const [news, ptn] =
        await Promise.all(
            [oneNews, allPartners]
        );
    res.render('extras/news', {oneNews, doc: news, partners: ptn, activeNav: 'news' })
};

exports.newsListsPage = async function (req, res) {

    const [news, ptn] =
        await Promise.all(
            [allNews, allPartners]
        );

    res.render('extras/news-lists', { doc: news, activeNav: 'news', partners: ptn })

};

exports.teamPage = async function (req, res) {

    let team = People.find({is_active: 1, tag: 'centre-leaders'})
    const [news, ptn, tm] =
        await Promise.all(
            [allNews, allPartners, team]
        );

    res.render('frontend/team', { doc: news, partners: ptn, team: tm, activeNav: 'management' });
};

exports.post_contactPage = async function (req, res) {
let messageData = {
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message

    }
    let newData = new message(messageData);
    newData.save();
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

exports.subscribe = function (req, res){
    let subscribeData = {
        email: req.body.newsletterEmail,
    }

    let newData = new subscribe(subscribeData);
    newData.save()

    res.redirect(req.originalUrl)
}
