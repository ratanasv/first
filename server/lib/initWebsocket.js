var WebsocketServer = require('ws').Server;

module.exports = function(httpsServer) {
	var websocketServer = new WebsocketServer({server:httpsServer});
	websocketServer.on('connection', function(ws) {
		var i = 0;
		ws.on('message', function(message) {
			console.log(message);
		});

		var payload = {
			deliveryTime: i
		};
		ws.send(JSON.stringify(payload));

	});
}