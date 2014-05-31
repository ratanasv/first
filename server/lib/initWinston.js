/**
 * Created by ratanasv on 1/25/14.
 */

 /**
    InitWinston should be called on once.
    Subsequent references to Winston should be invoked via winstonLogger.js
  */

var winston = require('winston');

/*winston.add(winston.transports.File, {
    filename: 'server.log',
    timestamp: function() {
        return new Date().toLocaleString();
    },
    colorize: false
});*/
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

module.exports.winston = winston;