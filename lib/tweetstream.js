(function(){

    var	sys = require('sys');
    var tweet = {};

    tweet.filter = function (data) {
	    if ( typeof data === 'string' ) {
		    console.log(data);
        // we actially receive a tweet.
        } else if ( data.text && data.user && data.user.screen_name ){
		    console.log('"' + data.text + '" -- ' + data.user.screen_name);
            return data;
        } else if ( data.message ) {
		    console.log('ERROR: ' + sys.inspect(data));
        } else {
		    console.log(sys.inspect(data));
        }
    }

    module.exports = tweet;
})();
