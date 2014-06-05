var WebsocketServer = require('ws').Server;
var config = require('../../config/config');
var redis = require('redis');
var redisClient = redis.createClient(config['REDIS_PORT'], config['FOXRIVER_IP']);
var computeOrderKey = require('./redisKeyCompute').computeOrderKey;
var computeCustomerKey = require('./redisKeyCompute').computeCustomerKey;
var winston = require('./initWinston').winston;
var TTL = require('./redisKeyCompute').TTL;
var NO_INFLIGHT_ORDER = require('./redisKeyCompute').NO_INFLIGHT_ORDER;
var INFLIGHT_ORDERS = require('./redisKeyCompute').INFLIGHT_ORDERS;
var handleGetInFlightOrders = require('./handleGetInFlightOrders')(winston);
var handleOrderDone = require('./handleOrderDone')(winston);
var handleSetDT = require('./handleSetDT')(winston);
var writeWS = require('./writeWS');
var async = require('async');


function handleGetDeliveryTime(params, ws) {
	var customer = params.customer;

	if (!customer) {
		return writeWS(ws, 400, 'invalid parameter (no customer field)');
	}

	function retriveOrderKey(customer, callback) {
		redisClient.get(computeCustomerKey(customer), function(err, orderKey) {
			if (err) {
				return callback(err);
			}
			if (orderKey === null) {
				return callback('redis has no order for this customer ' + customer);
			}
			if (orderKey === NO_INFLIGHT_ORDER) {
				return callback(customer + ' has no inflight order');
			}

			callback(null, customer, orderKey);
		});
	}

	function retrieveDeliveryTime(customer, orderKey, callback) {
		redisClient.get(orderKey + ':deliveryTime', function(err, deliveryTime) {
			if (err) {
				return callback('cannot retrieve order delivery time');
			}

			if (deliveryTime === null) {
				return callback('no delivery time for this customer');
			}

			callback(null, customer, orderKey, deliveryTime);
		});
	}

	function subscribeCustomer(customer, orderKey, deliveryTime, callback) {
		var customerChannel = computeCustomerKey(customer);
		var subscriber;

		subscriber = redis.createClient(config['REDIS_PORT'], config['FOXRIVER_IP']);
		subscriber.on('subscribe', function(channel, count) {
			winston.info(customer + ' subscribes to ' + customerChannel);
		});
		subscriber.on('message', function(channel, newDeliveryTime) {
			if (channel !== customerChannel) {
				return winston.error(customer + ' shouldnt be subscribed to ' + customerChannel);
			}
			if (isNaN(newDeliveryTime)) {
				return winston.error(newDeliveryTime + ' is not a number');
			}

			winston.info(orderKey + ' has a new deliveryTime ' + newDeliveryTime);

			callback(null, {
				deliveryTime: newDeliveryTime
			});
		});
		subscriber.subscribe(customerChannel);

		ws.on('close', function() {
			winston.info(customer + ' unsubscribe from ' + customerChannel);
			subscriber.unsubscribe();
			subscriber.end();
		});

		callback(null, {
			deliveryTime: deliveryTime
		});
	}

	async.waterfall([
		function(callback) {
			callback(null, customer);
		},
		retriveOrderKey,
		retrieveDeliveryTime,
		subscribeCustomer
	], function(err, result) {
		if (err) {
			winston.error(err);
			return writeWS(ws, 500, err, {});
		}
		writeWS(ws, 200, '', result);
	});
}


module.exports = function(httpsServer) {
	var websocketServer = new WebsocketServer({
		server: httpsServer
	});
	websocketServer.on('connection', function(ws) {
		ws.on('message', function(message) {
			var messageObject = JSON.parse(message);
			winston.info(message);
			if (!messageObject.method) {
				return writeWS(ws, 400, 'no request method', {});
			}
			if (!messageObject.params) {
				return writeWS(ws, 400, 'no params', {});
			}

			if (messageObject.method === 'getDeliveryTime') {
				handleGetDeliveryTime(messageObject.params, ws);
			} else if (messageObject.method === 'getInFlightOrders') {
				handleGetInFlightOrders(messageObject.params, ws);
			} else if (messageObject.method === 'orderDone') {
				handleOrderDone(messageObject.params, ws);
			} else if (messageObject.method === 'setDT') {
				handleSetDT(messageObject.params, ws);
			} else {
				writeWS(ws, 400, 'invalid request method', {});
			}
		});
	});
};