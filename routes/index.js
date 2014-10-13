/*
 * GET home page.
 */

var node_twitter = require('twitter');
var config = require(__dirname + '/../lib/config.js').config;
var googl = require('goo.gl');
var model = require(__dirname + '/../lib/model.js');

googl.setKey(config.GOOGLE_API_KEY);

exports.index = function(req, res){
  res.render('index', { title: 'Candy' });
};

exports.logout = function(req,res){
    req.logout();
    delete req.session.user;
    res.redirect('/');
};

exports.header = function(req,res){
    //user_info contains in the session
    req.session.user = req.user;
    model.insert_user(req.session.user);
    console.log("successfully login @" + req.user._json.screen_name);
    res.redirect('/');
};

exports.update = function(req,res){
    var twitter = new node_twitter({
        consumer_key: config.TWITTER_CONSUMER_KEY,
        consumer_secret: config.TWITTER_CONSUMER_SECRET,
        access_token_key: req.user.twitter_token,
        access_token_secret: req.user.twitter_token_secret
    })
    .updateStatus(req.body.request.query, function(data){
        console.log(data);  
    });
    res.redirect('/');
};

exports.post = function(req,res){
    var twitter = new node_twitter({
        consumer_key: config.TWITTER_CONSUMER_KEY,
        consumer_secret: config.TWITTER_CONSUMER_SECRET,
        access_token_key: req.user.twitter_token,
        access_token_secret: req.user.twitter_token_secret
    })
    .post(req.body.request.query, function(data){
        console.log(data);  
    });
    res.redirect('/');
};

exports.timeline = function(req,res){
    var twitter = new node_twitter({
        consumer_key: config.TWITTER_CONSUMER_KEY,
        consumer_secret: config.TWITTER_CONSUMER_SECRET,
        access_token_key: req.user.twitter_token,
        access_token_secret: req.user.twitter_token_secret
    })
    .get(req.body.request.query,{count:30}, function(data){
        console.log(data);
        res.send(data);
    });
};

exports.shortenURL = function(req,res){
    // Shorten a long url and output the result
    googl.shorten(req.body.request.query).then(function (shortUrl) {
        res.send(shortUrl);
    })
    .catch(function (err) {
        console.error(err.message);
    });
}
