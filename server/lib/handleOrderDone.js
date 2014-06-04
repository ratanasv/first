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
				callback('cannot delete from inflight list');
			}

			callback(null, customer);
		});
	}

	function setCustomerOrderDone(customer, callback) {
		redisClient.set(computeCustomerKey(customer), NO_INFLIGHT_ORDER, 'ex', TTL,
			function(err, result) {
				if (err) {
					callback('cannot set customerKey to done');
				}

				callback(null, customer);
			}
		);	
	}

	function notifyCustomer(customer, callback) {
		redisClient.publish(computeCustomerKey(customer), BIG_NEGATIVE_DT);
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
			setCustomerOrderDone, 
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