var hbs = require('hbs');
var moment = require('moment');

hbs.registerHelper("ifeq", function(a, b, options) {
	if (a == b) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});


hbs.registerHelper("dformat", function(a, b, options) {
	return moment(a).format(b);
});

module.exports = hbs;