/**
 * Created by ratanasv on 1/25/14.
 */

var winston = require('winston');

winston.add(winston.transports.File, {
    filename: 'server.log',
    timestamp: function() {
        return new Date().toLocaleString();
    },
    colorize: false
});
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    timestamp: function() {
        return new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
    },
    colorize: true
});
winston.addColors({
    info: 'blue',
    warn: 'yellow',
    error: 'red'
});

exports['winston'] = winston;