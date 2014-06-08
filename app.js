/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

//load added modules
var config = require('./lib/config.js').config;
var setting = require('./lib/setting');
var viewController = require('./lib/viewController');
var connect = require('./lib/connect');

//node_modules environments
setting.init(app,config);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

//validate session middleware
app.use(express.cookieParser(config.MEMORY_STORE));
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

//setup viewcontroller
viewController.init(app,connect,setting.passport);

server = http.createServer(app);

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

//event based communication using socket.io
connect.init(server);

