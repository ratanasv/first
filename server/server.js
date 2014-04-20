/**
 * Created by ratanasv on 1/25/14.
 */

var fs = require('fs');
var https = require('https');
var express = require('express');
var initWinston = require('./lib/initWinston');
var passport = require('passport');
var privateKey = fs.readFileSync('~/.ssl/server.key');
var certificate = fs.readFileSync('~/.ssl/server.crt');

var app = express();
var winston = initWinston.winston;

var httpsServer = https.createServer({
    key: privateKey,
    cert: certificate
}, app);


app.get('/hello/world', function (req, res){
    res.send('oh hi there');
});

httpsServer.listen(8080);

winston.info('listening on port 8080...');
