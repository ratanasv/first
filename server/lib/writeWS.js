module.exports = function writeWS(ws, code, header, body) {
	ws.send(JSON.stringify({
		code: code,
		header: header,
		body: body
	}));
};