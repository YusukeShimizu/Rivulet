/**
 * Module dependencies.
 */

var express = require('express');
var routes = require(__dirname + '/routes');
var user = require(__dirname + '/routes/user');
var http = require('http');
var path = require('path');
var passport = require('passport');
var config = require(__dirname + '/lib/config.js').config;

var app = express();
server = http.createServer(app);
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
app.use(setting.passport.initialize());
app.use(setting.passport.session()); 

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
app.get("/header",routes.header);

//event based communication using socket.io
io.sockets.on('connection',routes.stream);

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});


var connect = {};
var isLogined = {};
 
io.sockets.on('connection', function (socket) {    
            
    socket.on('message', function(data){    

        //always use JSON    
        function send(data){    
            socket.emit('message', JSON.stringify(data));    
        }    

        data = JSON.parse(data);    
        console.log(data);    
        if(data == 'isLogined'){    
            if(isLogined.user){    
                send({    
                    action: "auth_OK",    
                    info: isLogined.user._json,    
                    templates: isLogined.setting.templates    
                });    
                //waiting any stream    
                isLogined.setting.node_twitterUse(isLogined.user.twitter_token,isLogined.user.twitter_token_secret,function(ntwitter){    
                    ntwitter.stream('user', function(stream) {    
                        stream.on('data', function(data) {    
                            send({    
                                tweet: data    
                            });    
                        });    
                    });    
                });    
            }    
            else{    
                send({    
                    action: "auth_NG"    
                });                            
            }    
        }    
        else if(data == 'ping'){    
            send("pong");    
        }else{    
            console.log(data);    
        }    
    });    
});    


