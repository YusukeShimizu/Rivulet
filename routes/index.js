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

exports.tweet = function(req,res){
    var twitter = new node_twitter({
        consumer_key: config.TWITTER_CONSUMER_KEY,
        consumer_secret: config.TWITTER_CONSUMER_SECRET,
        access_token_key: req.user.twitter_token,
        access_token_secret: req.user.twitter_token_secret
    })
    .updateStatus(req.body.tweet, function(data){
        console.log(data);
    });
    res.redirect('/');
}

exports.favorite = function(req,res){
    var twitter = new node_twitter({
        consumer_key: config.TWITTER_CONSUMER_KEY,
        consumer_secret: config.TWITTER_CONSUMER_SECRET,
        access_token_key: req.user.twitter_token,
        access_token_secret: req.user.twitter_token_secret
    })
    .post("/favorites/create.json?id="+escape(req.body.tweet_id), function(data){
        console.log(data);  
    });
    res.redirect('/');
}

exports.unfavorite = function(req,res){
    var twitter = new node_twitter({
        consumer_key: config.TWITTER_CONSUMER_KEY,
        consumer_secret: config.TWITTER_CONSUMER_SECRET,
        access_token_key: req.user.twitter_token,
        access_token_secret: req.user.twitter_token_secret
    })
    .post("/favorites/destroy.json?id="+escape(req.body.tweet_id), function(data){
        console.log(data);  
    });
    res.redirect('/');
}

exports.delete = function(req,res){
    var twitter = new node_twitter({
        consumer_key: config.TWITTER_CONSUMER_KEY,
        consumer_secret: config.TWITTER_CONSUMER_SECRET,
        access_token_key: req.user.twitter_token,
        access_token_secret: req.user.twitter_token_secret
    })
    .post("/statuses/destroy/"+escape(req.body.tweet_id)+".json", function(data){
        console.log(data);  
    });
    res.redirect('/');
}

exports.retweet = function(req,res){
    var twitter = new node_twitter({
        consumer_key: config.TWITTER_CONSUMER_KEY,
        consumer_secret: config.TWITTER_CONSUMER_SECRET,
        access_token_key: req.user.twitter_token,
        access_token_secret: req.user.twitter_token_secret
    })
    .post("/statuses/retweet/"+escape(req.body.tweet_id)+".json", function(data){
        console.log(data);  
    });
    res.redirect('/');
}
