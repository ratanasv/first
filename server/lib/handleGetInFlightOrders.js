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

	function retrieveInFlightOrders(callback) {
		redisClient.lrange(INFLIGHT_ORDERS, 0, -1, function(err, customersList) {
			if (err) {
				return callback('cannot retrieve list of inflight orders');
			}
			var subscriber;
			subscriber = redis.createClient(config['REDIS_PORT'], config['FOXRIVER_IP']);
			subscriber.on('subscribe', function(channel, count) {
				
			});
			subscriber.on('message', function(channel, message) {

			});

			callback(null, customersList);
		});
	}

	function retrieveOrdersKeys(customersList, callback) {
		var multi = redisClient.multi();
		var inFlightOrdersKeys = [];
		customersList.forEach(function(customer, index) {
			multi.get(customer);
		});
		multi.exec(function (err, replies) {
			if (err) {
				return callback('batch orders keys retrieval failed');
			}

			replies.forEach(function(orderKey, index) {
				if (orderKey === null) {
					callback('item #' + index + ' has no order key.');
				}
				inFlightOrdersKeys.push(orderKey);
			});
			callback(null, inFlightOrdersKeys);
		});
	}

	function retrieveOrdersInfo(ordersKeysList, callback) {
		var multi = redisClient.multi();
		var ordersInfo = [];
		ordersKeysList.forEach(function(orderKey, index) {
			multi.get(orderKey);
		});
		multi.exec(function (err, replies) {
			if (err) {
				return callback('batch orders info retrieval failed');
			}

			replies.forEach(function(orderInfo, index) {
				if (orderInfo === null) {
					return callback('item #' + index + ' has no order info.');
				}
				ordersInfo.push(JSON.parse(orderInfo));
			});
			callback(null, ordersInfo);
		});
	}


	return function handleGetInFlightOrders(params, ws) {

		async.waterfall(
			[retrieveInFlightOrders, retrieveOrdersKeys, retrieveOrdersInfo], 
			function(err, result) {
				if (err) {
					winston.error(err);
					return writeWS(ws, 500, err, {});
				}
				writeWS(ws, 200, '', {
					orders: result
				});
			}
		);
	};
};