var WebsocketServer = require('ws').Server;
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
var BIG_NEGATIVE_DT = -99999999;

module.exports = function(winston) {

	function removeCustomerFromQueue(customer, callback) {
		redisClient.lrem(INFLIGHT_ORDERS, 0, computeCustomerKey(customer), function(err, result) {
			if (err) {
				return callback('cannot delete from inflight list');
			}

			callback(null, customer);
		});
	}

	function getSetCustomerOrderDone(customer, callback) {
		redisClient.getset(computeCustomerKey(customer), NO_INFLIGHT_ORDER,
			function(err, prevOrderKey) {
				if (err) {
					return callback('cannot set customerKey to done');
				}

				if (prevOrderKey === NO_INFLIGHT_ORDER) {
					return callback(customer + ' didnt have pending order');
				}

				callback(null, customer, prevOrderKey);
			}
		);	
	}

	function setCustomerTTL(customer, prevOrderKey, callback) {
		redisClient.expire(computeCustomerKey(customer), TTL, function(err, result) {
			if (err) {
				winston.error('set customer TTL failed');
			}

			callback(null, customer, prevOrderKey);
		});
	}

	function getSetDeliveryTimeNow(customer, prevOrderKey, callback) {
		var timeNow = new Date().getTime();
		redisClient.getset(prevOrderKey + ':deliveryTime', timeNow,
			function(err, prevDeliveryTime) {
				if (err) {
					return callback('cannot getSet deliveryTime');
				}

				callback(null, customer, prevOrderKey, timeNow - prevDeliveryTime);				
			}
		);
	}

	function setDeliveryTimeTTL(customer, prevOrderKey, dt, callback) {
		redisClient.expire(prevOrderKey + ':deliveryTime', TTL, function(err, result) {
			if (err) {
				winston.error('set order TTL failed');
			}

			callback(null, customer, dt);
		});
	}

	function notifyCustomer(customer, dt, callback) {
		redisClient.publish(computeCustomerKey(customer), dt);
		callback(null, {});
	}


	return function(params, ws) {
		var customer = params.customer;
		if (!customer) {
			return writeWS(ws, 400, 'no customer in parameter', {});
		}

		async.waterfall([
			function(callback) {
				callback(null, customer);
			}, 
			removeCustomerFromQueue, 
			getSetCustomerOrderDone,
			setCustomerTTL,
			getSetDeliveryTimeNow,
			setDeliveryTimeTTL,
			notifyCustomer
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