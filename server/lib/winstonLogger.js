var winston = require('./initWinston').winston;

module.exports = function() {
	return function(req, res, next) {
		winston.info(req.ip + ' ' + req.path + ' ' + JSON.stringify(req.query) + JSON.stringify(req.body));
		next();
	};
};

module.exports.winston = winston;