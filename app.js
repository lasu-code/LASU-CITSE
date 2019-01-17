
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
const methodOverride = require("method-override");


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
require("./config/passport");

const port = process.env.PORT|| 3000


var app = express();
// mongoose.connect('mongodb://localhost:27017/dashboard', { useNewUrlParser: true }).then(console.log("database connected"));

<<<<<<< HEAD
// mongoose.connect('mongodb://criotech:lasu123@ds255364.mlab.com:55364/criotech', { useNewUrlParser: true }).then(console.log("database connected")).catch(err=>console.log(err));
=======
// 'mongodb://criotech:lasu123@ds155614.mlab.com:55614/heroku_9n7zsc0c' || 
mongoose.connect('mongodb://localhost:27017/dashboard', { useNewUrlParser: true }).then(console.log("database connected")).catch(err=>console.log(err));
>>>>>>> mainjeo


// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('views', path.join(__dirname, 'views/partials'));


app.set('view engine', 'ejs');


app.use(methodOverride('_method'))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: "mysecrect",
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({mongooseConnection: mongoose.connection})
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

app.listen(port, ()=>{
  console.log(`connected to port ${port}`)
})

module.exports = app;
