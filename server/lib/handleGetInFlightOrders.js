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
				if (orderKey === null || orderKey === NO_INFLIGHT_ORDER) {
					winston.warn(index + ' doesnt exist, deleting automatically');
					redisClient.lrem(INFLIGHT_ORDERS, 0, customersList[index]);
				} else {
					inFlightOrdersKeys.push(orderKey);
				}
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
			callback(null, ordersInfo, ordersKeysList);
		});
	}

	function retrieveDeliveryTime(ordersInfo, ordersKeysList, callback) {
		var multi = redisClient.multi();
		ordersKeysList.forEach(function(orderKey, index) {
			var deliveryTimeKey = orderKey + ':deliveryTime';
			multi.get(deliveryTimeKey);
		});
		multi.exec(function (err, replies) {
			if (err) {
				return callback('batch orders deliveryTime retrieval failed');
			}

			replies.forEach(function(deliveryTime, index) {
				if (deliveryTime === null) {
					return callback('item #' + index + ' has no deliveryTime');
				}
				ordersInfo[index].deliveryTime = deliveryTime;
			});
			callback(null, ordersInfo);
		});
	}

	function subscribeToInFlightList(ws) {
		return function(ordersInfo, callback) {
			var subscriber = redis.createClient(config['REDIS_PORT'], config['FOXRIVER_IP']);
			subscriber.on('subscribe', function(channel, count) {
				winston.info('barista subscribes to ' + INFLIGHT_ORDERS);
			});
			subscriber.on('message', function(channel, newCustomer) {
				if (channel !== INFLIGHT_ORDERS) {
					return winston.error('barista shouldnt be subscribed to ' + channel);
				}

				winston.info('new customer to the list ' + newCustomer);

				async.waterfall([
					function(callback) {
						callback(null, [newCustomer]);
					},
					retrieveOrdersKeys, 
					retrieveOrdersInfo,
					retrieveDeliveryTime
				], function(err, result) {
					callback(null, result);
				});
			});
			subscriber.subscribe(INFLIGHT_ORDERS);

			ws.on('close', function() {
				winston.info('barista unsubscribe from ' + INFLIGHT_ORDERS);
				subscriber.unsubscribe();
				subscriber.end();
			});

			callback(null, ordersInfo);
		};
	}


	return function handleGetInFlightOrders(params, ws) {

		async.waterfall([
			retrieveInFlightOrders, 
			retrieveOrdersKeys, 
			retrieveOrdersInfo, 
			retrieveDeliveryTime,
			subscribeToInFlightList(ws)
		], 
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