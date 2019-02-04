
var createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const session = require("express-session");
const passport = require('passport');
const MongoStore = require('connect-mongodb-session')(session);
const flash = require("express-flash");
const multer =require("multer");
// const methodOverride = require("method-override");
const nodemailer = require("nodemailer")


const Email = require('email-templates');
 
const email = new Email({
  message: {
    from: 'me@mail.com'
  },
  // uncomment below to send emails in development/test env:
  send: true,
  transport: {
    jsonTransport: true,
    service: "gmail",
        secure: false,
        port: 25,
        auth: {
          user: "phawazzzy@gmail.com",
          pass: process.env.Password
        },
        tls: {
          rejectUnauthorized: false
        }
  },
  views: {
    options: {
      extension: 'ejs' // <---- HERE
    }
  }
});
 
email
  .send({
    template: 'emailToSend',
    message: {
      to: 'phawazzzy@gmail.com'
    },
    locals: {
      name: 'fawas'
    }
  })
  .then(console.log)
  .catch(console.error);

var username = 'phawazzzy';
var name = 'kareem fawas olamilkan';

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
require("./config/passport");


var app = express();

let db_uri = "mongodb://korwalskiy:DBpass123@ds255364.mlab.com:55364/citse-cms";
mongoose.connect(db_uri, { useNewUrlParser: true }).then(console.log("database connected")).catch(err=>console.log(err));


// view engine setup
app.set('views', path.join(__dirname, 'views'));


app.set('view engine', 'ejs');


// app.use(methodOverride('_method'))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('mysecrect'));

app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    secret: "mysecrect",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({uri: db_uri, collection: 'app_sessions'})
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('frontend/error');
});



module.exports = app;
