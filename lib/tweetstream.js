/* 
  Check what kind of data we receive
  If data is tweet, return data
*/

(function(){

    var	sys = require('sys');
    var tweetstream = {};
    var tweet = "streaming_data";

    tweetstream.verify = function (data) {
	    if ( typeof data === 'string' ) {
		    console.log(data);
        } else if ( data.text && data.user && data.user.screen_name ){
		    console.log('"' + data.text + '" -- ' + data.user.screen_name);
            // we actially receive a tweet.
            tweet = data;
        } else if ( data.message ) {
		    console.log('ERROR: ' + sys.inspect(data));
        } else {
		    console.log(sys.inspect(data));
        }
        return tweet;
    }

    module.exports = tweetstream;
})();
