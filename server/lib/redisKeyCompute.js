module.exports = {
	computeOrderKey: function(orderNumber) {
		return 'order:' + orderNumber;
	},

	computeCustomerKey: function(customer) {
		return customer.replace(/ /g, '.');
	}
};