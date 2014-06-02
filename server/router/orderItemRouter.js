var DATABASE = 'db0';
var COLLECTION = 'order';
var mongolabURL = 'https://api.mongolab.com/api/1/databases/'+DATABASE+'/collections/'+COLLECTION;
var config = require('../../config/config');
var redis = require('redis');
var redisClient = redis.createClient(config['REDIS_PORT'], config['FOXRIVER_IP']);
var computeOrderKey = require('../lib/redisKeyCompute').computeOrderKey;
var computeCustomerKey = require('../lib/redisKeyCompute').computeCustomerKey;

var ORDER_COUNTER = 'order.counter';
var INFLIGHT_ITEMS = 'inflight.items';
var TTL = 60 * 60 * 1; //one hour

function errorCallback(res, errorMessage, winston) {
	winston.error(errorMessage);
	res.send(500);
}

function orderCounterCallback(res, payload, winston) {
	return function(err, orderNumber) {
		var orderKey = computeOrderKey(orderNumber);
		if (err) {
			return errorCallback(res, err, winston);
		}

		redisClient.set(orderKey, JSON.stringify(payload), 'ex', TTL, function(err, redisResponse) {
			if (err) {
				return errorCallback(res, err, winston);
			}

			res.send(200, JSON.stringify({
				deliveryTime: payload.deliveryTime
			}));
		});
		redisClient.set(computeCustomerKey(payload.customer), orderKey, 'ex', TTL);
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