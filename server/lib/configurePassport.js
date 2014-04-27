var LocalStrategy = require('passport-local').Strategy;

var users = [
	{ nickname: 'khr', username: 'khronos', password: 'pass', number: 123},
	{ nickname: 'the', username: 'theory', password: '1234', number: 281928},
];

function findByUsername(username, callback) {
	for (var i=0; i<users.length; i++) {
		if (users[i].username === username) {
			return callback(null, users[i]);
		}
	}
	return callback(null, null);
}

module.exports = function(passport) {
	passport.use(new LocalStrategy(
		function(username, password, done) {
			findByUsername(username, function(err, user) {
				console.log('find result: ' + user);
				if (err) { return done(err); }
				if (!user) { return done(null, false, {message: 'unknown user'}); }
				if (user.password != password) {
					return done(null, false, {message: 'wrong password'});
				}

				return done(null, user);
			});
		})
	);

	passport.serializeUser(function(user, done) {
		console.log('serializing ' + user);
		done(null, user.nickname);
	});

	passport.deserializeUser(function(nickname, done) {
		console.log('deserializing..');
		for (var i=0; i<users.length; i++) {
			if (users[i].nickname === nickname) {
				console.log('found! ' + users[i]);
				return done(null, users[i]);
			}
		}
		done(new Error('user doesnt exist'));
	});
};