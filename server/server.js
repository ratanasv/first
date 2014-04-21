/**
 * Created by ratanasv on 1/25/14.
 */
var config = require('./config');
var fs = require('fs');
var https = require('https');
var express = require('express');
var initWinston = require('./lib/initWinston');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var privateKey = fs.readFileSync(config['SSL_KEY']);
var certificate = fs.readFileSync(config['SSL_CERT']);

var app = express();
var winston = initWinston.winston;

var httpsServer = https.createServer({
    key: privateKey,
    cert: certificate
}, app);

passport.use(new LocalStrategy(
	function(username, password, done) {
		console.log(username + ' ' + password);
		return done(null, username);
	})
);

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, 'asdf');
});

app.configure(function() {
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.session({
		secret: 'meow'
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use('/', express.static(__dirname + '/../client/build'));
});

app.post('/login',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	})
);


httpsServer.listen(config['SERVER_PORT']);

winston.info('listening on port ' + config['SERVER_PORT'] + '...');
