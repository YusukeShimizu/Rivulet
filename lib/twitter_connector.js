/* 
  Stream shim.
*/

var node_twitter = require('twitter');

function verify(data) {
    var tweet = "";
	if ( typeof data === 'string' ) {
        console.log(data);
    } else if ( data.text && data.user && data.user.screen_name ){
        console.log('"' + data.text + '" -- ' + data.user.screen_name);
        // we actially receive a tweet.
        tweet = data;
    } else if ( data.message ) {
        console.log('ERROR: ' + data);
    } else {
        console.log(data);
    }
    return tweet;
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
                data = verify(data);
                try {
                    var obj = JSON.parse(data);
                } catch(e) {
                    console.log(""+e);
                }
                if(obj) {
                    queue.publish("stream-"+id, obj)
                }
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
