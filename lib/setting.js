
(function(){
    var setting = {};
    //passport���W���[��
    setting.passport = require('passport');
    setting.TwitterStrategy = require('passport-twitter').Strategy;

    //passport�̐ݒ�
    function passportSetup(passport){
		//�V���A���C�Y
		passport.serializeUser(function(user, done) {
	    	done(null, user);
		});

		//�f�V���A���C�Y
		passport.deserializeUser(function(obj, done) {
	    	done(null, obj);
		});	
    }

    //passsport���p����
    function passportUse(passport,TwitterStrategy,config){
		//oauth�F�؂ɕK�v�ȏ���o�^
	    passport.use(new TwitterStrategy({
	    	consumerKey: config.TWITTER_CONSUMER_KEY,
	    	consumerSecret: config.TWITTER_CONSUMER_SECRET,
	    	callbackURL: config.callbackURL
		},

		//callback��
		function(token,tokenSecret,profile,done){
	    	profile.twitter_token = token;
	    	profile.twitter_token_secret = tokenSecret;

	    	//�񓯊��C�x���g�Ƃ���inode.js�̋@�\�j
	    	process.nextTick(function(){
				//�V���A���C�Y�̈����Ƀv���t�@�C����ݒ�
				return done(null,profile);
	    	});
		}
		));
	}

    setting.init = function(app,config){
		passportSetup(setting.passport);
		passportUse(setting.passport,setting.TwitterStrategy,config);
		//passport�̏�����
		app.use(setting.passport.initialize());
		//passport�ł̃��O�C����Ԃ�ێ�����passport session�~�h���E�F�A��L���� 
		app.use(setting.passport.session()); 
    }
    module.exports = setting;
})();


