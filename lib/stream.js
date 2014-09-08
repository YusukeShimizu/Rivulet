/*
 * use socket.io(0.9.16)to enable real time communication
 */

var config = require(__dirname + '/config.js').config;
var templates = require(__dirname + '/templates.js');
var twitter_connector = require(__dirname + '/twitter_connector.js');
var sessionStore = new module.parent.exports.express.session.MemoryStore();

exports.init = function(handshakeData, callback) {

    if (handshakeData.headers.cookie) {
        var cookie = require('cookie').parse(decodeURIComponent(handshakeData.headers.cookie));
        cookie = require('express/node_modules/connect').utils.parseSignedCookies(cookie, module.parent.exports.app.get('cookieParser'));
        var sessionID = cookie[module.parent.exports.app.get('cookieSessionKey')];
 
        sessionStore.get(sessionID, function(err, session) {
            if (err) {
                console.dir(err);
                callback(err.message, false);
            }
            else if (!session) {
                console.log('session not found');
                callback('session not found', false);
            }
            else {
                console.log("authorization success");
 
                // set session things to handShakeData
                handshakeData.cookie = cookie;
                handshakeData.sessionID = sessionID;
                handshakeData.sessionStore = sessionStore;
                handshakeData.session = new Session(handshakeData, session);
 
                callback(null, true);
            }
        });
    }
    else {
        return callback('cookie not found', false);
    }
};
 

exports.connect = function(socket){

    //always use JSON
    function send(data){
        socket.emit('message', JSON.stringify(data));
    }

    socket.on('message',function(data){     
        
        data = JSON.parse(data);
        console.log(data);    

        if(data == 'ping'){
            send('pong');
        }
        else if(socket.handshake.session.user){
            send({
                action: "auth_OK",
                templates: templates,
                info: socket.handshake.session.user._json
            });

            var subscription = twitter_connector.subscribe(socket.handshake.session.user._json.user_id,function(data){
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
        }
    });

    console.log('session data', socket.handshake.session);
    var sessionReloadIntervalID = setInterval(function() {
        socket.handshake.session.reload(function() {
            socket.handshake.session.touch().save();
        });
    }, 60 * 2 * 1000);
    socket.on("disconnect", function(message) {
        clearInterval(sessionReloadIntervalID);
    });
}
