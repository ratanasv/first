var DATABASE = 'db0';
var COLLECTION = 'order';
var mongolabURL = 'https://api.mongolab.com/api/1/databases/'+DATABASE+'/collections/'+COLLECTION;
var config = require('../../config/config');
var redis = require('redis');
var redisClient = redis.createClient(config['REDIS_PORT'], config['FOXRIVER_IP']);
var computeOrderKey = require('../lib/redisKeyCompute').computeOrderKey;
var computeCustomerKey = require('../lib/redisKeyCompute').computeCustomerKey;
var computeDeliveryTimeKey = require('../lib/redisKeyCompute').computeDeliveryTimeKey;

var ORDER_COUNTER = require('../lib/redisKeyCompute').ORDER_COUNTER;
var TTL = require('../lib/redisKeyCompute').TTL;
var INFLIGHT_ORDERS = require('../lib/redisKeyCompute').INFLIGHT_ORDERS;



module.exports = function(app, winston) {
	function errorCallback(res, errorMessage) {
		winston.error(errorMessage);
		res.send(500);
	}

	function notifyClient(res, deliveryTime) {
		return function(err, redisResponse) {
			if (err) {
				return errorCallback(res, err);
			}

			res.send(200, JSON.stringify({
				deliveryTime: deliveryTime
			}));
		}
	}

	function writeToInFlightQueue(res, orderNumber, deliveryTime, newOrder) {
		return function(err, redisResponse) {
			if (err) {
				return errorCallback(res, err);
			}

			redisClient.rpush(INFLIGHT_ORDERS, computeCustomerKey(newOrder.customer), 
				notifyClient(res, deliveryTime));
		}
	}

	function writeOrderToCustomer(res, orderNumber, deliveryTime, newOrder) {
		return function(err, redisResponse) {
			var orderKey = computeOrderKey(orderNumber);
			if (err) {
				return errorCallback(res, err);
			}

			redisClient.set(computeCustomerKey(newOrder.customer), orderKey, 'ex', TTL,
				writeToInFlightQueue(res, orderNumber, deliveryTime, newOrder));			
		}
	}

	function writeDeliveryTime(res, orderNumber, deliveryTime, newOrder) {
		return function(err, redisResponse) {
			if (err) {
				return errorCallback(res, err);
			}

			redisClient.set(computeDeliveryTimeKey(orderNumber), deliveryTime, 'ex', TTL,
				writeOrderToCustomer(res, orderNumber, deliveryTime, newOrder));
		}
	}

	function orderCounterCallback(res, newOrder, deliveryTime) {
		return function(err, orderNumber) {
			var orderKey = computeOrderKey(orderNumber);
			if (err) {
				return errorCallback(res, err);
			}

			redisClient.set(orderKey, JSON.stringify(newOrder), 'ex', TTL, 
				writeDeliveryTime(res, orderNumber, deliveryTime, newOrder));
		}
	}

	app.get('/item', function(req, res) {
		res.send(200, 'pistachio');
	});

	app.post('/item', function(req, res) {
		var newOrder = req.body;
		var deliveryTime;

		if (!newOrder) {
			return res.send(400, 'no body in the request');
		}
		if (!newOrder.customer) {
			return res.send(400, 'no customer name in the body');
		}
		if (!newOrder.items) {
			return res.send(400, 'no items to queue in the body');
		}
		if (newOrder.items.length === 0) {
			return res.send(400, 'items is of length zero');
		}

		newOrder.orderTime = new Date().getTime();
		deliveryTime = newOrder.orderTime + (1000 * 60 * 2);

		redisClient.incr(ORDER_COUNTER, orderCounterCallback(res, newOrder, deliveryTime));
		
	});


};