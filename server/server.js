/**
 * Created by ratanasv on 1/25/14.
 */
var config = require('../config/config');
var fs = require('fs');
var http = require('http');
var express = require('express');
var privateKey = fs.readFileSync(config['SSL_KEY']);
var certificate = fs.readFileSync(config['SSL_CERT']);
var passport = require('passport');
var configurePassport = require('./lib/configurePassport.js');
var flash = require('connect-flash');
var app = express();
var picLoaderRouter = require('./router/picLoaderRouter.js');
var orderItemRouter = require('./router/orderItemRouter.js');
var winstonLogger = require('./lib/winstonLogger');
var initWebsocket = require('./lib/initWebsocket');
var cors = require('cors');

var httpServer = http.createServer(app);

configurePassport(passport);

app.configure(function() {
	app.use(express.bodyParser());
	app.use(winstonLogger());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: 'meow'
	}));
	app.use(flash());
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(cors());
	app.use(express.static(__dirname + '/../client/build'));
});

picLoaderRouter(app, winstonLogger.winston);
orderItemRouter(app, winstonLogger.winston);

app.post('/login',
	passport.authenticate('local'), 
	function(req, res) {
		if (req.isAuthenticated()) {
			return res.json(JSON.stringify(req.user));
		} else {
			return res.send(401, 'not authorized');
		}
	}
);

app.get('/secure', 
	function(req, res) {
		if (req.isAuthenticated()) {
			return res.json(JSON.stringify(req.user));
		} else {
			return res.send(401, 'not authorized');
		}
	}
);

app.post('oauth2callback', function(req, res) {
	res.send('ok');
});


httpServer.listen(config['SERVER_PORT']);
initWebsocket(httpServer);

winstonLogger.winston.info('listening on port ' + config['SERVER_PORT'] + '...');
