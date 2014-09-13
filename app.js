/**
 * Module dependencies.
 */

var express = module.exports = require('express');
var routes = require(__dirname + '/routes');
var user = require(__dirname + '/routes/user');
var http = require('http');
var path = require('path');

// npm modules
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var config = require(__dirname + '/lib/config.js').config;
var templates = require(__dirname + '/lib/templates.js');
var twitter_connector = require(__dirname + '/lib/twitter_connector.js');

var app = express();
var server = http.createServer(app);

// using socket.io
var io = require('socket.io').listen(server);

var sessionStore = new express.session.MemoryStore();
var cookieParser = require('cookie-parser');
var parseCookie = cookieParser('cookieSessionKey');
    
//Passport will serialize and deserialize user instances to and from the session
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

//set passport infomation
passport.use(new TwitterStrategy({
    consumerKey: config.TWITTER_CONSUMER_KEY,
    consumerSecret: config.TWITTER_CONSUMER_SECRET,
    callbackURL: config.callbackURL
},function(token,tokenSecret,profile,done){
    profile.twitter_token = token;
    profile.twitter_token_secret = tokenSecret;

    process.nextTick(function(){
        //credentials contained in the request
        return done(null,profile);
    });
}));

// all environments
app.set('port', process.env.PORT || config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

//validate session middleware
app.use(express.cookieParser(app.get("cookieSessionKey")));
app.use(express.session({
    secret : 'cookieSessionKey',     
    store : sessionStore
}));
app.use(passport.initialize());
app.use(passport.session()); 

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// main app view
app.get('/', routes.index);
app.get('/users', user.list);
// passport Routes  
app.get("/header", routes.header);
app.get('/logout/twitter', routes.logout);
app.get("/auth/twitter", passport.authenticate('twitter'));
app.get("/auth/twitter/callback", passport.authenticate('twitter', {
    successRedirect: '/header',
    failureRedirect: '/'
}));

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

var cookieParser = require('cookie-parser');
var parseCookie = cookieParser('cookieSessionKey');
    
// share session between socket.io and express
io.configure(function(){
	io.set('authorization', function(handshakeData, callback) {

    	if (handshakeData.headers.cookie) {

            parseCookie(handshakeData, null, function(err) {
                if (err) {
                    return accept('Error parseCookie.', false);
                }
                var sessionID = handshakeData.signedCookies["cookieSessionKey"];
 
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
            });
        }
    	else{
        	return callback('cookie not found', false);
    	}
	});
});

// connect clients 
io.sockets.on('connection',function(socket){

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
});
