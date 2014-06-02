var WebsocketServer = require('ws').Server;
var config = require('../../config/config');
var redis = require('redis');
var redisClient = redis.createClient(config['REDIS_PORT'], config['FOXRIVER_IP']);
var computeOrderKey = require('./redisKeyCompute').computeOrderKey;
var computeCustomerKey = require('./redisKeyCompute').computeCustomerKey;

var NO_INFLIGHT_ORDER = 'NO_INFLIGHT_ORDER';

function handleGetDeliveryTime(params, ws) {
	var customer = params.customer;

	if (!customer) {
		return writeWS(ws, 500, 'invalid parameter (no customer field)');
	}

	redisClient.get(computeCustomerKey(customer), function(err, orderKey) {
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
			if (err) {
				return writeWS(ws, 500, 'redis order retrieval error', {});
			}

			if (res === null) {
				return writeWS(ws, 500, 'redis orderKey doesnt exist for the customer', {});
			}

			var orderInfo = JSON.parse(res);
			writeWS(ws, 200, 'success', {
				deliveryTime: orderInfo.deliveryTime
			});
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