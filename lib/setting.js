(function(){
    var setting = {};
    //load setting files
    var config = require(__dirname + '/config.js').config;
    setting.templates = require(__dirname + '/templates');
    // load node modules
    setting.passport = require('passport');
    setting.TwitterStrategy = require('passport-twitter').Strategy;
    var node_twitter = require('twitter');

    //passport setup
    function passportSetup(passport){
        //serialize
        passport.serializeUser(function(user, done) {
            done(null, user);
        });

        //deserialize
        passport.deserializeUser(function(obj, done) {
            done(null, obj);
        });	
    }
    
    function passportUse(passport,TwitterStrategy){
        //set passport infomation
        passport.use(new TwitterStrategy({
            consumerKey: config.TWITTER_CONSUMER_KEY,
            consumerSecret: config.TWITTER_CONSUMER_SECRET,
            callbackURL: config.callbackURL
        },

        //callback
        function(token,tokenSecret,profile,done){
            profile.twitter_token = token;
            profile.twitter_token_secret = tokenSecret;

            process.nextTick(function(){
                //credentials contained in the request
                return done(null,profile);
            });
        }));
    }

    //setup node_twitter to stream 
    setting.node_twitterUse = function(token,token_secret){
        var ntwitter = new node_twitter({
            consumer_key: config.TWITTER_CONSUMER_KEY,
            consumer_secret: config.TWITTER_CONSUMER_SECRET,
            access_token_key: token,
            access_token_secret: token_secret
        });
        return ntwitter;
    }

    setting.init = function(){
        passportSetup(setting.passport);
        passportUse(setting.passport,setting.TwitterStrategy);
    }

    //passport.session() middleware must be used.
    setting.session = function(app){
        //passport initialization
        app.use(setting.passport.initialize());
        //validate passport session 
        app.use(setting.passport.session()); 

    }
    module.exports = setting;
})();
