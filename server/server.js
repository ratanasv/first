/**
 * Created by ratanasv on 1/25/14.
 */
var config = require('./config');
var fs = require('fs');
var https = require('https');
var express = require('express');
var initWinston = require('./lib/initWinston');
var privateKey = fs.readFileSync(config['SSL_KEY']);
var certificate = fs.readFileSync(config['SSL_CERT']);
var passport = require('passport');
var configurePassport = require('./lib/configurePassport.js');
var flash = require('connect-flash');
var app = express();
var winston = initWinston.winston;


var httpsServer = https.createServer({
    key: privateKey,
    cert: certificate
}, app);

configurePassport(passport);


app.configure(function() {
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.session({
		secret: 'meow'
	}));
	app.use(flash());
	app.use(passport.initialize());
	app.use(passport.session());
	app.use('/', express.static(__dirname + '/../client/build'));
});

app.post('/login',
	passport.authenticate('local', {
		successRedirect: '/secure',
		failureRedirect: '/loginfailed',
		failureFlash: true
	})
);

app.get('/secure', 
	function(req, res) {
		/*if (req.isAuthenticated) {
			return res.send(401, 'not authorized');
		}*/
		res.send('yay!!!')
	}
);

app.get('/loginfailed', function(req, res) {
	res.send('login failed');
});


function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.send('nope');
}


httpsServer.listen(config['SERVER_PORT']);

winston.info('listening on port ' + config['SERVER_PORT'] + '...');
