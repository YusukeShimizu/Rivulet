
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
//passport module
var passport = require('passport');
//passport-twitter
var TwitterStrategy = require('passport-twitter').Strategy;
var config = require('./lib/config').config;
//var stream = require('./lib/twitter-site-stream-connector');
var TWITTER_CONSUMER_KEY = config.oauthKey;
var TWITTER_CONSUMER_SECRET = config.oauthSecret;
var callbackURL = config.callbackURL;
var MEMORY_STORE = config.MEMORY_STORE;

//リアライズ、デシリアライズ
passport.serializeUser(function(user, done){
                       done(null, user);
                       });
passport.deserializeUser(function(obj, done){
                         done(null, obj);
                         });

passport.use(new TwitterStrategy({
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET,
        callbackURL: callbackURL
    },
    function(token, tokenSecret, profile, done) {
        profile.twitter_token = token;
        profile.twitter_token_secret = tokenSecret;
                                 
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(express.cookieParser());
app.use(express.session({secret: MEMORY_STORE}));
//passport initialize
app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var socketIO = require('socket.io');
// クライアントの接続を待つ(IPアドレスとポート番号を結びつけ)
var io = socketIO.listen(server);

// リクエストがあったとき、ログイン済みかどうか確認する関数
var isLogined = function(req, res, next){
    if(req.isAuthenticated())
        return next();  // ログイン済み
    // ログインしてなかったらログイン画面に飛ばす
    res.redirect("/login");
};

// Twitter認証
app.get("/auth/twitter", passport.authenticate('twitter'));

// Twitter callback
app.get("/auth/twitter/callback", passport.authenticate('twitter', {
    successRedirect: '/ ',
    failureRedirect: '/'
}));

app.get("/access", isLogined, function(req, res){
        
        io.on('connection', function(client){
                  console.log("Connection");
        
        function send(data) {
        client.send(JSON.stringify(data))
        }
        
        function now() {
        return (new Date).getTime();
        }
        
        // On Socket.io connections
        io.on('connection', function(client){
            console.log("Connection");
            var subscription;
            var last = now();
                  
            client.on('message', function(msg){
                var data = JSON.parse(msg);
                last = now();
                            
                if(data == "ping") {
                    send("pong")
                }
                      
                send({
                    action: "auth_ok"
                })
                   
            });
        });
        });
        
});

app.get('/logout/twitter', function(req, res){
    req.logout();
    res.redirect('/');
});


