var DATABASE = 'db0';
var COLLECTION = 'order';
var mongolabURL = 'https://api.mongolab.com/api/1/databases/'+DATABASE+'/collections/'+COLLECTION;
var config = require('../../config/config');
var redis = require('redis');
var redisClient = redis.createClient(config['REDIS_PORT'], config['FOXRIVER_IP']);

var ORDER_COUNTER = 'order.counter';
var INFLIGHT_ITEMS = 'inflight.items';
var TTL = 60 * 60 * 1; //one hour

function computeOrderKey(orderNumber) {
	return 'order:' + orderNumber;
}

function errorCallback(res, errorMessage, winston) {
	winston.error(errorMessage);
	res.send(500);
}

function orderCounterCallback(res, payload, winston) {
	return function(err, orderNumber) {
		var key = computeOrderKey(orderNumber);
		if (err) {
			return errorCallback(res, err, winston);
		}

		redisClient.set(key, JSON.stringify(payload), 'ex', TTL, function(err, redisResponse) {
			if (err) {
				return errorCallback(res, err, winston);
			}

			res.send(200, JSON.stringify({
				deliveryTime: payload.deliveryTime
			}));
		});
	}
}

module.exports = function(app, winston) {
	app.get('/item', function(req, res) {
		res.send(200, 'pistachio');
	});

	app.post('/item', function(req, res) {
		var payload = req.body;

		if (!payload) {
			return res.send(400);
		}
		if (!payload.customer) {
			return res.send(400);
		}
		if (!payload.items) {
			return res.send(400);
		}
		if (payload.items.length === 0) {
			return res.send(400);
		}

		payload.orderTime = new Date().getTime();
		payload.deliveryTime = payload.orderTime + (1000 * 60 * 2);

		redisClient.incr(ORDER_COUNTER, orderCounterCallback(res, payload, winston));
		
	});


};