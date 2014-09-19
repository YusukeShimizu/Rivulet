/* 
  use socket.io(0.9.2)to enable real time communication
*/

var connection = {};
var config;
var sessionStore;
var cookieParser;
var templates = require(__dirname + "/templates.js");
var twitter_connector = require(__dirname + '/twitter_connector.js');

connection.init = function (Config,SessionStore,CookieParser){
    config = Config;
    sessionStore = SessionStore;
    cookieParser = CookieParser;
}

debugger;

connection.handShake = function(handshakeData, callback) {

    if (handshakeData.headers.cookie) {
        cookieParser(handshakeData, null, function(err) {
            if (err) {
                return accept('Error parseCookie.', false);
            }
            var sessionID = handshakeData.signedCookies["connect.sid"];
 
            sessionStore.get(sessionID, function(err, Session) {
                if (err) {
                    console.dir(err);
                    callback(err.message, false);
                }
                else if (!Session) {
                    console.log('session not found');
                    callback('session not found', false);
                }
                else {
                    console.log("authorization success");
                    // set session things to handShakeData
                    handshakeData.session = Session;
                    
                    callback(null, true);
                }
            });
        });
    }
    else{
        return callback('cookie not found', false);
    }
}

connection.connect = function(socket){

    //always use JSON
    function send(data){
        socket.emit('message', JSON.stringify(data));
    }

    var subscription;

    socket.on('message',function(data){     
        
        data = JSON.parse(data);
        console.log(data);    

        if(data == 'ping'){
            send('pong');
        }
        else if(data == 'no_auth'){
            if(socket.handshake.session.user){
                send({
                    action: "auth_OK",
                    templates: templates,
                    info: socket.handshake.session.user._json
                });

                subscription = twitter_connector.subscribe(socket.handshake.session.user._json.id,function(data){
                    send({
                        tweet: data
                    });
                },{
                    // set requester
                    consumer_key: config.TWITTER_CONSUMER_KEY,
                    consumer_secret: config.TWITTER_CONSUMER_SECRET,
                    access_token_key: socket.handshake.session.user.twitter_token,
                    access_token_secret: socket.handshake.session.user.twitter_token_secret
                });
            }else {
                send('no_auth');
            }
        }   
    });
    // delete subscription 
    socket.on('disconnect', function(){
        if(subscription) {
            subscription.unsubscribe();
        }
    });

    // just making sure
    /*
    console.log('session data', socket.handshake.session);
    var sessionReloadIntervalID = setInterval(function() {
        socket.handshake.session.reload(function() {
            socket.handshake.session.touch().save();
        });
    }, 60 * 2 * 1000);
    socket.on("disconnect", function(message) {
        clearInterval(sessionReloadIntervalID);
    });
    */
}

module.exports = connection;
