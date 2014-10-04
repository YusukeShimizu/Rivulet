/*
 * model of RDBMS(using MySQL) 
 * Ugly code that seems to work follows. replacement is highly welcome
 */

var model = {};
var mysql = require('mysql');
var date = require('date-utils');
var config =  require(__dirname + "/config.js").config;

var connection = mysql.createConnection({
    host: config.MYSQL_HOST,
    user: config.MYSQL_USER,
    password: config.MYSQL_PASSWORD,
    database: config.MYSQL_DBNAME,
    connectionLimit: 50,
    queueLimit: 0,
    waitForConnection: true
});

model.insert_user = function(user){
    var sql = "insert into user(screen_name,twitter_token,twitter_token_secret) value(?,?,?)";
    var value = [user._json.screen_name,user.twitter_token,user.twitter_token_secret];

    // actual connection
    var query = connection.query(sql,value,function(err,result){
        model.insert_login_time(user);
        if(err){
            console.log(err);
        }
        else{
            console.log('--- results ---');
	        console.log(result);
        }
    });
}

model.insert_login_time = function(user){
    var sql = "insert into access_history(screen_name,login_time) value(?,?)";
    var value = [user._json.screen_name,new Date().toFormat("YYYY-MM-DD HH:MI:SS")];

    // actual connection
    var query = connection.query(sql,value,function(err,result){
        if(err){
            console.log(err);
        }
        else{
            console.log('--- results ---');
	        console.log(result);
        }
    });
}

module.exports = model;
