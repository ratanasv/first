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
	handlerHelper = handlerHelperInitFunc(winston, redisClient);

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
					handlerHelper.retrieveOrdersKeys, 
					handlerHelper.retrieveOrdersInfo,
					handlerHelper.retrieveDeliveryTime
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
			handlerHelper.retrieveOrdersKeys, 
			handlerHelper.retrieveOrdersInfo, 
			handlerHelper.retrieveDeliveryTime,
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