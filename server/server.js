/**
 * Created by ratanasv on 1/25/14.
 */

var fs = require('fs');
var https = require('https');
var express = require('express');
var initWinston = require('./lib/initWinston');
var passport = require('passport');
var privateKey = fs.readFileSync('/.ssl/server.key');
var certificate = fs.readFileSync('/.ssl/server.crt');

var app = express();
var winston = initWinston.winston;

var httpsServer = https.createServer({
    key: privateKey,
    cert: certificate
}, app);

app.configure(function() {
	console.log(__dirname);
	app.use('/', express.static(__dirname + '/../client/build'));
});



httpsServer.listen(443);

winston.info('listening on port 443...');
