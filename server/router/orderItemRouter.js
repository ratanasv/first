var inFlightItems = [];
var DATABASE = 'db0';
var COLLECTION = 'order';
var mongolabURL = 'https://api.mongolab.com/api/1/databases/'+DATABASE+'/collections/'+COLLECTION;
var config = require('../../config/config');

module.exports = function(app, winston) {
	app.post('/item', function(req, res) {
		var payload = req.body;
		var currentTime;
		var deliveryTime;

		if (!payload) {
			return res.send(400);
		}
		if (!payload.customer) {
			return res.send(400);
		}
		if (!payload.items) {
			return res.send(400);
		}
		if (payload.items.length == 0) {
			return res.send(400);
		}

		inFlightItems.push(payload);

		currentTime = new Date().getTime();
		deliveryTime = currentTime + (1000 * 60);

		payload.currentTime = currentTime;
		payload.deliveryTime = deliveryTime;

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
			res.send('success');
		});
	});


};