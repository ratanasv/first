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
var NO_INFLIGHT_ORDER = require('../lib/redisKeyCompute').NO_INFLIGHT_ORDER;
var async = require('async');


module.exports = function(app, winston) {
	function notifyBarista(newOrder, deliveryTime , callback) {
		redisClient.publish(INFLIGHT_ORDERS, newOrder.customer);
		callback(null, deliveryTime);
	}

	function writeToInFlightQueue(newOrder, deliveryTime, callback) {
		redisClient.rpush(INFLIGHT_ORDERS, computeCustomerKey(newOrder.customer), 'ex', TTL,
			function(err, result) {
				if (err) {
					callback(err);
				}

				callback(null, newOrder, deliveryTime);
			}	
		);
	}


	function writeOrderToCustomer(orderKey, newOrder, deliveryTime, callback) {
		redisClient.set(computeCustomerKey(newOrder.customer), orderKey, 'ex', TTL, 
			function(err, result) {
				if (err) {
					callback(err);
				}

				callback(null, newOrder, deliveryTime);
			}
		);
	}

	function writeDeliveryTime(orderKey, newOrder, deliveryTime, callback) {
		redisClient.set(orderKey + ':deliveryTime', deliveryTime, 'ex', TTL, function(err, result) {
			if (err) {
				callback(err);
			}

			callback(null, orderKey, newOrder, deliveryTime);
		});
	}


	function writeOrderInfo(orderKey, newOrder, deliveryTime, callback) {
		redisClient.set(orderKey, JSON.stringify(newOrder), 'ex', TTL, function(err, result) {
			if (err) {
				callback(err);
			}

			callback(null, orderKey, newOrder, deliveryTime);
		});
	}

	function incrementOrderCounter(newOrder, deliveryTime, callback) {
		redisClient.incr(ORDER_COUNTER, function(err, orderNumber) {
			var orderKey = computeOrderKey(orderNumber);
			if (err) {
				return callback(err);
			}

			callback(null, orderKey, newOrder, deliveryTime)
		});
	}

	function checkIfCustomerAlreadyHasAnOrder(newOrder, deliveryTime, callback) {
		redisClient.get(computeCustomerKey(newOrder.customer), function(err, orderNumber) {
			if (orderNumber !== NO_INFLIGHT_ORDER && orderNumber !== null) {
				callback(newOrder.customer + ' already has an outstanding order ' + orderNumber);
				winston.error('this still gets executed!!!!');
			}

			callback(null, newOrder, deliveryTime);
		});
	}


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

		async.waterfall([
			function(callback) {
				callback(null, newOrder, deliveryTime);
			},
			checkIfCustomerAlreadyHasAnOrder,
			incrementOrderCounter,
			writeOrderInfo,
			writeDeliveryTime,
			writeOrderToCustomer,
			writeToInFlightQueue,
			notifyBarista
		], function(err, result) {
			if (err) {
				winston.error(err);
				return res.send(500, err);
			}

			res.send(200, JSON.stringify({
				deliveryTime: deliveryTime
			}));
		});		
	});


};