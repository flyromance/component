module.exports = {
    init: function () {
        return 123;
    },
    flatten: function (arr) {
    	return arr.reducer(function (prev, next) {
    		return prev.concat(Array.isArray(next))
    	});
    }
}