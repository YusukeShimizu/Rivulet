/**
 * Module dependencies.
 */

var express = require('express');
var routes = require(__dirname + '/routes');
var user = require(__dirname + '/routes/user');
var http = require('http');
var path = require('path');

var app = express();

//load added modules
var setting = require(__dirname + '/lib/setting');
var router = require(__dirname + '/lib/router');
var connect = require(__dirname + '/lib/connect');

//node_modules environments
setting.init();

// all environments
app.set('port', process.env.PORT || 5000);
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
setting.session(app);

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

//setup router
router.init(app,connect,setting);

server = http.createServer(app);

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

//event based communication using socket.io
connect.init(server);
