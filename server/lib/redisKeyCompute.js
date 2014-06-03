module.exports = {
	computeOrderKey: function(orderNumber) {
		return 'order:' + orderNumber;
	},

	computeCustomerKey: function(customer) {
		return customer.replace(/ /g, '.');
	},

	computeDeliveryTimeKey: function(orderNumber) {
		return 'order:' + orderNumber + ':deliveryTime';
	},

	TTL: 60 * 60 * 1,
	ORDER_COUNTER: 'ORDER.COUNTER',
	INFLIGHT_ORDERS: 'INFLIGHT.ORDERS',
	NO_INFLIGHT_ORDER: 'NO.INFLIGHT.ORDER'
};