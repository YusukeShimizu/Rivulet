var express = module.exports = require('express');
var routes = require(__dirname + '/routes');
var user = require(__dirname + '/routes/user');
var http = require('http');
var path = require('path');

// npm modules
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var config = require(__dirname + '/lib/config.js').config;

var app = express();
var server = http.createServer(app);

// using socket.io
var io = require('socket.io').listen(server);
var MySQLSessionStore = require('connect-mysql-session')(express);
var sessionStore = new MySQLSessionStore(config.MYSQL_DBNAME, config.MYSQL_USER, config.MYSQL_PASSWORD, {});
var cookieParser = express.cookieParser("cookieParser");
var connection = require(__dirname + '/lib/connection.js');

connection.init(config,sessionStore,cookieParser);

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
app.use(cookieParser);
app.use(express.session({
    secret: "cookieParser",
    store : sessionStore,
}));
app.use(passport.initialize());
app.use(passport.session()); 
app.use(express.bodyParser());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// for uncaughtexeption
app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500', {title: "Unknown err. Sorry :)"});
})

// main app routes
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/header', routes.header);
app.post('/post',routes.post);
app.post('/update',routes.update);
app.post('/timeline',routes.timeline);
app.post('/oldTimeline',routes.oldTimeline);
app.post('/shortenURL',routes.shortenURL);
//app.post('/expandURL',routes.expandURL);
app.get('/logout/twitter', routes.logout);
app.get("/auth/twitter", passport.authenticate('twitter'));
app.get("/auth/twitter/callback", passport.authenticate('twitter', {
    successRedirect: '/header',
    failureRedirect: '/'
}));

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

// share session between socket.io and express
io.sockets.use(connection.handShake);

// connect clients 
io.sockets.on('connection', connection.connect);
