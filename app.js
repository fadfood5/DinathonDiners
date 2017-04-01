var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var bootstrap = require("express-bootstrap-service");
var download = require('downloadjs');
var validator = require('email-validator');
var nodemailer = require('nodemailer');
var router = express.Router();
var firebase = require('firebase');
var mongoose = require('mongoose');
var csv = require('fast-csv');

//Firebase
var config = {
    apiKey: "AIzaSyDBhfseryRSliGS1yZCpOxZoQhBlEOowSM",
    authDomain: "sudohacks-ce911.firebaseapp.com",
    databaseURL: "https://sudohacks-ce911.firebaseio.com",
    projectId: "sudohacks-ce911",
    storageBucket: "sudohacks-ce911.appspot.com",
    messagingSenderId: "317217938091"
};
firebase.initializeApp(config);

mongoose.connect('mongodb://localhost:27017/sudo');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {});

var userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    id: Number,
});

var User = mongoose.model('User', userSchema);

//Pages
var contact = require('./routes/contact');
var home = require('./routes/home');
var names = require('./routes/names');
var register = require('./routes/register');
var routes = require('./routes/index');
var events = require('./routes/events');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bootstrap.serve);
app.use('/static', express.static('/public'));

app.use('/', routes);
app.use('/contact', contact);
app.use('/home', home);
app.use('/names', names);
app.use('/register', register);
app.use('/events', events);

app.post('/login', function(req, res) {
    var email = req.body.em;
    var password = req.body.pass;
    console.log(email);
    console.log(password);
    firebase.auth().signInWithEmailAndPassword(email, password).then(function() {
        res.redirect('/home')
    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log("Error authenticating");
    });
    console.log("success");
    res.redirect('/home');
});

app.post('/register', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var passwordConf = req.body.passwordConfirm;
    if (password === passwordConf) {
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            res.redirect('/error');
        });
        res.refirect('/home');
    }
    res.redirect('/error');
});

app.post('/logout', function(req, res) {
    firebase.auth().signOut().then(function() {
        res.redirect('/');
    }, function(error) {
        res.redirect('/error');
    });
});

app.post('/addNames', function(req, res) {
    var stream = fs.createReadStream("./names.csv");
    var counter = 0;
    var csvStream = csv()
        .on("data", function(data) {
            var name = data[0].split('\t');
            console.log(name);
            var temp = new User({
                firstName: data[0],
                lastName: data[1],
                id: counter,
            });
            temp.save(function(err) {
                if (err) {
                    console.log(String(err));
                }
            })
            counter++;
        })
        .on("end", function() {
            console.log("done");
        });
    stream.pipe(csvStream);
    console.log("success");
    res.redirect('/names');
});

app.get('/getNames', function(req, res){
	User.find(function(err, names) {
        if (err) return console.error(err);
        console.log(names);
        res.json({
            n: names
        });
    })
		console.log("Got names");
});

//Contact form
app.post('/contact', function(req, res) {
    console.log(req.body);
    if (req.body.company)
        res.render('error');

    if (!req.body.name || !req.body.email || !req.body.message)
        res.render('error');

    var check = validator.validate(req.body.email);

    if (check == false)
        res.render('error');

    var mailOpts, smtpTrans;

    smtpTrans = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: "",
            pass: ""
        }
    });

    mailOptions = {
        from: '',
        to: req.body.email,
        subject: 'Website contact',
        text: req.body.message + '\n NAME:' + req.body.name + '\n EMAIL:' + req.body.email
    };

    smtpTrans.sendMail(mailOptions, function(error, info) {
        if (error)
            res.render('error', {
                error: error
            });
        else
            res.render('contact');
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
