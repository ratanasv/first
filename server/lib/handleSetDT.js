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
var handlerHelperInitFunc = require('./handlerHelper');

module.exports = function(winston) {
	var handlerHelper = handlerHelperInitFunc(winston, redisClient);

	return function handeSetDT(params, ws) {
		if (!params.customer) {
			writeWS(ws, 400, 'no customer in params', {});
		}
		if (!params.dt) {
			writeWS(ws, 400, 'no dt in params', {});
		}

		async.waterfall([
			
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
}