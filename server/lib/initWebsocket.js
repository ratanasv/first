var WebsocketServer = require('ws').Server;
var config = require('../../config/config');
var redis = require('redis');
var redisClient = redis.createClient(config['REDIS_PORT'], config['FOXRIVER_IP']);
var computeOrderKey = require('./redisKeyCompute').computeOrderKey;
var computeCustomerKey = require('./redisKeyCompute').computeCustomerKey;
var winston = require('./initWinston').winston;
var TTL = require('./redisKeyCompute').TTL;

function handleGetDeliveryTime(params, ws) {
	var customer = params.customer;
	var customerKey = computeCustomerKey(customer);

	if (!customer) {
		return writeWS(ws, 500, 'invalid parameter (no customer field)');
	}

	redisClient.get(customerKey, function(err, orderKey) {
		if (err) {
			return writeWS(ws, 500, 'redis customer retrieval error', {});
		}
		if (orderKey === null) {
			return writeWS(ws, 400, 'redis no order for this customer error', {});
		}
		if (orderKey === NO_INFLIGHT_ORDER) {
			return writeWS(ws, 400, 'this customer has no inflight order', {});
		}


		redisClient.get(orderKey, function(err, res) {
			var orderInfo;
			var subscriber;
			var customerChannel = customerKey;

			if (err) {
				return writeWS(ws, 500, 'redis order retrieval error', {});
			}

			if (res === null) {
				return writeWS(ws, 500, 'redis orderKey doesnt exist for the customer', {});
			}

			orderInfo = JSON.parse(res);
			writeWS(ws, 200, 'success', {
				deliveryTime: orderInfo.deliveryTime
			});

			subscriber = redis.createClient(config['REDIS_PORT'], config['FOXRIVER_IP']);
			subscriber.on('subscribe', function(channel, count) {
				winston.log(customer + ' subscribes to ' + customerChannel);
			});
			subscriber.on('message', function(channel, newDeliveryTime) {
				var newOrderInfo = orderInfo;
				if (channel !== customerChannel) {
					return winston.error(customer + ' shouldnt be subscribed to ' + customerChannel);
				}
				if (isNan(newDeliveryTime)) {
					return winston.error(newDeliveryTime + ' is not a number');
				}

				winston.log(orderKey + ' has new deliveryTime ' + newDeliveryTime);
				newOrderInfo.deliveryTime = newDeliveryTime;
				redisClient.set(orderKey, JSON.stringify(newOrderInfo), 'ex', TTL, function(err) {
					writeWS(ws, 200, '', {
						deliveryTime: newDeliveryTime
					});
				});			
 			});
			subscriber.subscribe(customerChannel);
		});
	});
}

function writeWS(ws, code, header, body) {
	ws.send(JSON.stringify({
		code: code,
		header: header,
		body: body
	}));
}

module.exports = function(httpsServer) {
	var websocketServer = new WebsocketServer({server:httpsServer});
	websocketServer.on('connection', function(ws) {
		ws.on('message', function(message) {
			var messageObject = JSON.parse(message);
			winston.log(message);
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