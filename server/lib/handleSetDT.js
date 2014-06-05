var config = require('../../config/config');
var redis = require('redis');
var redisClient = redis.createClient(config['REDIS_PORT'], config['FOXRIVER_IP']);
var computeOrderKey = require('./redisKeyCompute').computeOrderKey;
var computeCustomerKey = require('./redisKeyCompute').computeCustomerKey;
var TTL = require('./redisKeyCompute').TTL;
var NO_INFLIGHT_ORDER = require('./redisKeyCompute').NO_INFLIGHT_ORDER;
var INFLIGHT_ORDERS = require('./redisKeyCompute').INFLIGHT_ORDERS;
var writeWS = require('./writeWS');
var async = require('async');
var handlerHelperInitFunc = require('./handlerHelper');

module.exports = function(winston) {
	var handlerHelper = handlerHelperInitFunc(winston, redisClient);

	function retrieveOrderKey(customerKey, dt, callback) {
		redisClient.get(customerKey, function(err, orderKey) {
			if (err) {
				return callback('cannot retrieve orderKey for customer ' + customerKey);
			}

			callback(null, customerKey, orderKey, dt);
		});
	}

	function getDeliveryTime(customerKey, orderKey, dt, callback) {
		var deliveryTimeKey = orderKey + ':deliveryTime';
		redisClient.get(deliveryTimeKey, function(err, deliveryTime) {
			if (err) {
				return callback('cannot retrieve deliveryTime for ' + deliveryTimeKey);
			}

			callback(null, customerKey, deliveryTimeKey, dt, deliveryTime);
		});
	}

	function deltaDeliveryTime(customerKey, deliveryTimeKey, dt, prevDeliveryTime, callback) {
		redisClient.incrby(deliveryTimeKey, dt, function(err, newDeliveryTime) {
			if (err) {
				return callback('cannot set new deliveryTime for ' + deliveryTimeKey);
			}
			callback(null, customerKey, newDeliveryTime);
		});
	}

	function notifyClient(customerKey, newDeliveryTime, callback) {
		redisClient.publish(customerKey, newDeliveryTime);
		callback(null, {});
	}

	return function handeSetDT(params, ws) {
		if (!params.customer) {
			writeWS(ws, 400, 'no customer in params', {});
		}
		if (!params.dt) {
			writeWS(ws, 400, 'no dt in params', {});
		}

		async.waterfall([
			function(callback) {
				callback(null, computeCustomerKey(params.customer), params.dt);
			},
			retrieveOrderKey,
			getDeliveryTime,
			deltaDeliveryTime,
			notifyClient
		], 
			function(err, result) {
				if (err) {
					winston.error(err);
					return writeWS(ws, 500, err, {});
				}

				//intentionally don't write result back to client.
			}
		);
	};
};