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

module.exports = function(winston) {
	return function handleGetInFlightOrders(params, ws) {
		redisClient.lrange(INFLIGHT_ORDERS, 0, -1, function(err, res) {
			var subscriber;
			subscriber = redis.createClient(config['REDIS_PORT'], config['FOXRIVER_IP']);
			subscriber.on('subscribe', function(channel, count) {
				
			});
			subscriber.on('message', function(channel, message) {

			});

			if (err) {
				winston.error(err);
				return writeWS(ws, 500, 'cannot retrieve list of inflight orders', {});
			}

			writeWS(ws, 200, '', {
				orders: res
			});
		});
	};
};