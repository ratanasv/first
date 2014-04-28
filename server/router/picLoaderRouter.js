var request = require('request');
var DATABASE = 'db0';
var COLLECTION = 'cs496';
var ID = '535dc63ae4b0f5e0cb49542c';
var mongolabURL = 'https://api.mongolab.com/api/1/databases/'+DATABASE+'/collections/'+COLLECTION;
var config = require('../../config/config');

module.exports = function(app, winston) {
	app.post('/picloader', function(req, res) {
		var payload = {};
		payload.university = req.body.university;

		winston.warn('payload to mongo: ' + JSON.stringify(payload));
		if (!payload.university.pictureURL) {
			return res.send(400, 'no university.pictureURL');
		}
		if (!payload.university.name) {
			return res.send(400, 'no university.name');
		}
		if (!config.MONGO_KEY) {
			return res.send(500, 'cant find an api key');
		}

		payload.timestamp = new Date().getTime();
		
		request({
			url: mongolabURL,
			method: 'POST',
			qs: {
				apiKey: config.MONGO_KEY
			},
			json: payload
		}, function(error, response, body) {
			if (error) {
				res.send(500, error);
				return winston.error(error);
			}
			winston.info('response from mongo add: ' + JSON.stringify(body));	
			res.send('success');
		});
	});

	app.get('/picloader', function(req, res) {
		request({
			url: mongolabURL,
			method: 'GET',
			qs: {
				apiKey: config.MONGO_KEY
			}
		}, function(error, response, body) {
			var universities = [];
			var persisted = JSON.parse(body);
			winston.warn('result from mongo: ' + JSON.stringify(persisted));

			if (error) {
				return res.send(500, error);
			}

			for (var i=0; i<persisted.length; i++) {
				universities.push(persisted[i].university);
			}

			res.json(universities);
		});
	});
};