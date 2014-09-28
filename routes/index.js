/*
 * GET home page.
 */

var node_twitter = require('twitter');
var config = require(__dirname + '/../lib/config.js').config;

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
    .updateStatus(req.body.request, function(data){
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
    .post(req.body.request, function(data){
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
    .get(req.body.request,{include_entities:true}, function(data){
        console.log(data);
        res.send(data);
    });
};

