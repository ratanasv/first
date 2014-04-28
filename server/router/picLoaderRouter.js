module.exports = function(app) {
	app.post('/picloader', function(req, res) {
		res.send('pic received');
	});
};