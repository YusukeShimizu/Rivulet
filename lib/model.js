/*
 * model of RDBMS(using MySQL) 
 */

var model = {};
var mysql = require('mysql');
var config =  require(__dirname + "/config.js").config;

var connection = mysql.createConnection({
    host: config.MYSQL_HOST,
    user: config.MYSQL_USER,
    password: config.MYSQL_PASSWORD,
    database: config.MYSQL_DBNAME
});

model.record_user = function(user){
    var sql = "insert into user_record(screen_name,twitter_token,twitter_token_secret) value(?,?,?)";
    var value = [user._json.screen_name,user.twitter_token,user.twitter_token_secret];

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
