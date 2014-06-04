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

module.exports = function(winston) {
	function setCustomerOrderDone(customer, callback) {

	}

	return function(params, ws) {
		var customer = params.customer;
		if (!customer) {
			return writeWS(ws, 400, 'no customer in parameter', {});
		}

		async.waterfall(
			[], 
			function(err, result) {
				if (err) {
					winston.error(err);
					return writeWS(ws, 500, err, {});
				}
				writeWS(ws, 200, '', {});
			}
		);
	};
};