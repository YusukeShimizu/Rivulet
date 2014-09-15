/* 
  Stream shim.
*/

var node_twitter = require('twitter');
var queue = require(__dirname +  '/queue.js');

function verify(data) {
	if ( typeof data === 'string' ) {
        console.log(data);
    } else if ( data.text && data.user && data.user.screen_name ){
        // we actially receive a tweet.
        console.log('"' + data.text + '" -- ' + data.user.screen_name);
    } else if ( data.message ) {
        console.log('ERROR: ' + data);
    } else {
        console.log(data);
    }
}

function UserStreamConnection() {
    this.users = [];
    this.conID = 0;
}

UserStreamConnection.prototype.addUser = function (id, requester) {
    if(this.users.indexOf(id) == -1) {
        this.users.push(id);
        var conID = this.conID++;
        var connection = new node_twitter(requester).stream('user',function(stream){
            stream.on('data', function(data){                
                // check what kind of data we receive
                verify(data);
                queue.publish("stream-"+id, data);
            });
        });     
    } else {
        console.log("User already connected "+id + " "+this.users);
    }
}

var userStreamConnection = new UserStreamConnection();

// Subscribe to events for a userID. subscriptionCB is called for each event.
exports.subscribe = function (userID, subscriptionCB,requester) {
    userStreamConnection.addUser(userID,requester);
    return queue.subscribe(["stream-"+userID], subscriptionCB);
}
