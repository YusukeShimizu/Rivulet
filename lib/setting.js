
(function(){
    var setting = {};
    // load passport modules
    setting.passport = require('passport');
    setting.TwitterStrategy = require('passport-twitter').Strategy;

    //passport setup
    function passportSetup(passport){
        //serialize
        passport.serializeUser(function(user, done) {
            done(null, user);
        });

        //serialize
        passport.deserializeUser(function(obj, done) {
	        done(null, obj);
        });	
    }
    
    function passportUse(passport,TwitterStrategy,config){
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

            //asynchronous communication
            process.nextTick(function(){
                //set profile to serialize
                return done(null,profile);
            });
        }));
    }

    setting.init = function(app,config){
        passportSetup(setting.passport);
        passportUse(setting.passport,setting.TwitterStrategy,config);
        //passport initialization
        app.use(setting.passport.initialize());
        //validate passport session 
        app.use(setting.passport.session()); 
        }
    module.exports = setting;
})();


