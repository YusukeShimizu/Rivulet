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

// other modules
var config = require(__dirname + '/lib/config.js').config;
var templates = require(__dirname + '/lib/templates.js');
// var tweetstream = require(__dirname + '/lib/tweetstream.js');

// node_twitter object
var ntwitters = [];

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

// main app view
app.get('/', function(req, res){
    res.render('index', { title: "Candy" });
});
app.get('/users', user.list);
app.get("/auth/twitter", passport.authenticate('twitter'));
app.get("/auth/twitter/callback", passport.authenticate('twitter', {
    successRedirect: '/header',
    failureRedirect: '/'
}));
app.get('/logout/twitter', function(req,res){
        req.session.destroy(function (err) {
            res.redirect('/'); 
    });
});
app.get("/header", function(req,res){
    ntwitters.push(new node_twitter({
        consumer_key:config.TWITTER_CONSUMER_KEY,
        consumer_secret:config.TWITTER_CONSUMER_SECRET,
        access_token_key:req.user.twitter_token,
        access_token_secret:req.user.twitter_token_secret
    }));
    send({
        action: "auth_OK",
        templates: templates,
        info: req.user._json
    });
    console.log("successfully login @" + req.user._json.screen_name);
    res.redirect('/');
});

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

//always use JSON
function send(data){
    io.sockets.in(room).emit('message', JSON.stringify(data));
}

var room;

io.sockets.on('connection',function(socket){

    // identify user so we can emit to specific user
    room = socket.id || "anonymous";

    socket.on('message',function(data){     
        
        data = JSON.parse(data);
        console.log(data);    

        if(data == 'ping'){
            send('pong');
        }
        // try to find the user info
        if(ntwitter){
            if(room != "anonymous"){
                socket.join(room);
            }
            // connect to streaming api
            ntwitter.stream('user', function(stream) {
                stream.on('data', function(data) {
                    // check what kind of data we receive
                    // data = tweetstream.filter(data);
                    send({
                        tweet: data
                    });
                });
            });
        }else{
            console.log("something trouble at @" + room);
            send({
                action: "auth_NG"
            });

        }
    });         
});


