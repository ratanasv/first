var NO_INFLIGHT_ORDER = require('./redisKeyCompute').NO_INFLIGHT_ORDER;
var INFLIGHT_ORDERS = require('./redisKeyCompute').INFLIGHT_ORDERS;

module.exports = function(winston, redisClient) {
return {
	retrieveOrdersKeys: function retrieveOrdersKeys(customersList, callback) {
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
	},

	retrieveOrdersInfo: function retrieveOrdersInfo(ordersKeysList, callback) {
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
	},

	retrieveDeliveryTime: function retrieveDeliveryTime(ordersInfo, ordersKeysList, callback) {
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
};
};
	