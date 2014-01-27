/**
 * Created by ratanasv on 1/25/14.
 */

var express = require('express');
var initWinston = require('./lib/initWinston');
var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

var app = express();
var winston = initWinston.winston;



passport.use(new GoogleStrategy({
        returnURL: 'http://web.engr.oregonstate.edu/~ratanasv/first/index.html/auth/google/return',
        realm: 'http://web.engr.oregonstate.edu/~ratanasv'
    },
    function(identifier, profile, done) {

        process.nextTick(function () {
            profile.identifier = identifier;
            return done(null, profile);
        });
    }
));

app.configure(function() {
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'keyboard cat' }));
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
});

app.get('/auth/google', passport.authenticate('google'));

app.get('/auth/google/return',
    passport.authenticate('google', {
        successRedirect: '/hello/world',
        failureRedirect: '/login'
    }));

app.get('/hello/world', function (req, res){
    res.send('oh hi there');
});

app.listen(3000);
winston.info('listening on port 3000...');
