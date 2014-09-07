/* 
  Stream shim.
  It helps in testing when you do not have access to 
  the site stream API which is only available for priviledged users.
*/

var node_twitter = require('twitter');
var tweetstream = require(__dirname + '/tweetstream.js');

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
                data = tweetstream.verify(data);
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
// To support the userStream fallback pass in the requester function
exports.subscribe = function (userID, subscriptionCB,requester) {
    userStreamConnection.addUser(userID,requester);
    return queue.subscribe(["stream-"+userID], subscriptionCB);
}
