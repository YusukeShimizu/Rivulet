/**
 * Module dependencies.
 */

var express = require('express');
var routes = require(__dirname + '/routes');
var user = require(__dirname + '/routes/user');
var http = require('http');
var path = require('path');

// npm modules
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var node_twitter = require('twitter');
// create node_twitter object when oauth is completed
var ntwitter;

// other modules
var config = require(__dirname + '/lib/config.js').config;
var templates = require(__dirname + '/lib/templates.js');

var app = express();
var server = http.createServer(app);
// using socket.io
var io = require('socket.io').listen(server);    
               
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
app.use(express.cookieParser("cookieParser"));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session()); 

process.on('uncaughtException', function(err) {
    /* uncaughtException handling */
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get("/auth/twitter", passport.authenticate('twitter'));
app.get("/auth/twitter/callback", passport.authenticate('twitter', {
    successRedirect: '/header',
    failureRedirect: '/'
}));
app.get("/header", function(req,res){
    // create node_twitter object
    ntwitter = new node_twitter({
        consumer_key:config.TWITTER_CONSUMER_KEY,
        consumer_secret:config.TWITTER_CONSUMER_SECRET,
        access_token_key:req.user.twitter_token,
        access_token_secret:req.user.twitter_token_secret
    });
    res.redirect('/');
});

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

//event based communication using socket.io
io.sockets.on('connection',function(socket){
    
    socket.on('message',function(data){
        
        //always use JSON
        function send(data){
            console.log(socket.id);
            io.sockets.socket(socket.id).emit('message', JSON.stringify(data));
        }

        data = JSON.parse(data);
        console.log(data);

        if(ntwitter){
            send({
                action: "auth_OK",
                templates: templates
            });

            ntwitter.stream('user', function(stream) {
                stream.on('data', function(data) {
                    send({
                        tweet: data
                    });
                });
            });
            if(data == "ping"){
                send("pong");
            }
        }
    });
});
