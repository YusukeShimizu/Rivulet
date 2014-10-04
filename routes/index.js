/*
 * GET home page.
 */

var node_twitter = require('twitter');
var config = require(__dirname + '/../lib/config.js').config;

var model = require(__dirname + '/../lib/model.js');
var googl = require('goo.gl');

googl.setKey(config.GOOGLE_API_KEY);

exports.index = function(req, res){
  res.render('index', { title: 'Rivulet' });
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

exports.shortenURL = function(req,res){
    // Shorten a long url and output the result
    googl.shorten(req.body.request).then(function (shortUrl) {
        res.send(shortUrl);
    })
    .catch(function (err) {
        console.error(err.message);
    });
}

exports.expandURL = function(req,res){
    // expand a short url and output the result
    googl.expand(req.body.request).then(function (expandUrl) {
        res.send(expandUrl);
    })
    .catch(function (err) {
        console.error(err.message);
    });
}

