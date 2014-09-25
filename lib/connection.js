/* 
  use socket.io(1.0)to enable real time communication
*/

var connection = {};
var config;
var sessionStore;
var cookieParser;
var templates = require(__dirname + "/templates.js");
var twitter_connector = require(__dirname + '/twitter_connector.js');
var session = require('express-session');

connection.init = function (Config,SessionStore,CookieParser){
    config = Config;
    sessionStore = SessionStore;
    cookieParser = CookieParser;
}

connection.handShake = function(socket, next) {

    if (socket.request.headers.cookie) {
        cookieParser(socket.request, null, function(err) {
            if (err) {
                return accept('Error parseCookie.', false);
            }
            var sessionID = socket.request.signedCookies["connect.sid"];
 
            sessionStore.get(sessionID, function(err, data) {
                if (err) {
                    console.dir(err);
                    next(err.message);
                }
                else if (!data) {
                    console.log('session not found');
                    next('session not found');
                }
                else {
                    console.log("authorization success");
                    // set session things to handShakeData
                    socket.session = data;
                    next();
                }
            });
        });
    }
    else{
        return next('cookie not found');
    }
}

connection.connect = function(socket){

    //always use JSON
    function send(data){
        socket.emit('message',JSON.stringify(data));
    }

    var subscription;

    socket.on('message',function(data){     
        
        data = JSON.parse(data);
        console.log(data);    

        if(data == 'ping'){
            send('pong');
        }
        else if(data == 'no_auth'){
            if(socket.session.user){
                send({
                    action: "auth_OK",
                    templates: templates,
                    info: socket.session.user._json
                });

                subscription = twitter_connector.subscribe(socket.session.user._json.id,function(data){
                    send({
                        tweet: data
                    });
                },{
                    // set requester
                    consumer_key: config.TWITTER_CONSUMER_KEY,
                    consumer_secret: config.TWITTER_CONSUMER_SECRET,
                    access_token_key: socket.session.user.twitter_token,
                    access_token_secret: socket.session.user.twitter_token_secret
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
}

module.exports = connection;
