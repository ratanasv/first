var WebsocketServer = require('ws').Server;
var config = require('../../config/config');
var redis = require('redis');
var redisClient = redis.createClient(config['REDIS_PORT'], config['FOXRIVER_IP']);
var computeOrderKey = require('./redisKeyCompute').computeOrderKey;
var computeCustomerKey = require('./redisKeyCompute').computeCustomerKey;
var winston = require('./initWinston').winston;
var TTL = require('./redisKeyCompute').TTL;
var NO_INFLIGHT_ORDER = require('./redisKeyCompute').NO_INFLIGHT_ORDER;

function writeWS(ws, code, header, body) {
	ws.send(JSON.stringify({
		code: code,
		header: header,
		body: body
	}));
}

function handleGetDeliveryTime(params, ws) {
	var customer = params.customer;
	var customerKey = computeCustomerKey(customer);

	if (!customer) {
		return writeWS(ws, 500, 'invalid parameter (no customer field)');
	}

	function subscribeChannel(orderKey) {
		return function(err, deliveryTime) {
			var deliveryTimeKey = orderKey + ':deliveryTime'; 
			var subscriber;
			var customerChannel = customerKey;

			if (err) {
				winston.error(err);
				return writeWS(ws, 500, 'cannot retrieve order delivery time', {});
			}

			if (deliveryTime === null) {
				return writeWS(ws, 400, 'no delivery time for this customer', {});
			}

			writeWS(ws, 200, 'success', {
				deliveryTime: deliveryTime
			});

			subscriber = redis.createClient(config['REDIS_PORT'], config['FOXRIVER_IP']);
			subscriber.on('subscribe', function(channel, count) {
				winston.info(customer + ' subscribes to ' + customerChannel);
			});
			subscriber.on('message', function(channel, dt) {
				if (channel !== customerChannel) {
					return winston.error(customer + ' shouldnt be subscribed to ' + customerChannel);
				}
				if (isNaN(dt)) {
					return winston.error(dt + ' is not a number');
				}

				winston.info(orderKey + ' has a dt ' + dt);

				redisClient.incrby(deliveryTimeKey, dt, function(err, newDeliveryTime) {
					if (err) {
						winston.error(err);
						return writeWS(ws, 500, 'increase deliveryTime failed');
					}

					writeWS(ws, 200, '', {
						deliveryTime: newDeliveryTime
					});
				});		
			});
			subscriber.subscribe(customerChannel);

			ws.on('close', function() {
				winston.info(customer + ' unsubscribe from ' + customerChannel);
				subscriber.unsubscribe();
				subscriber.end();
			});
		};
	}

	function queryDeliveryTime(err, orderKey) {
		var deliveryTimeKey = orderKey + ':deliveryTime'; 
		if (err) {
			winston.error(err);
			return writeWS(ws, 500, 'redis customer retrieval error', {});
		}
		if (orderKey === null) {
			return writeWS(ws, 400, 'redis no order for this customer error', {});
		}
		if (orderKey === NO_INFLIGHT_ORDER) {
			return writeWS(ws, 400, 'this customer has no inflight order', {});
		}

		redisClient.get(deliveryTimeKey, subscribeChannel(orderKey));
	}

	redisClient.get(customerKey, queryDeliveryTime);
}

module.exports = function(httpsServer) {
	var websocketServer = new WebsocketServer({server:httpsServer});
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
			} else if (messageObject.method === 'setDeliveryTime') {

			} else {
				writeWS(ws, 400, 'invalid request method', {});
			}
		});
	});
};