
(function(){
    var setting = {};
    //passportモジュール
    setting.passport = require('passport');
    setting.TwitterStrategy = require('passport-twitter').Strategy;

    //passportの設定
    function passportSetup(passport){
		//シリアライズ
		passport.serializeUser(function(user, done) {
	    	done(null, user);
		});

		//デシリアライズ
		passport.deserializeUser(function(obj, done) {
	    	done(null, obj);
		});	
    }

    //passsport利用準備
    function passportUse(passport,TwitterStrategy,config){
		//oauth認証に必要な情報を登録
	    passport.use(new TwitterStrategy({
	    	consumerKey: config.TWITTER_CONSUMER_KEY,
	    	consumerSecret: config.TWITTER_CONSUMER_SECRET,
	    	callbackURL: config.callbackURL
		},

		//callback時
		function(token,tokenSecret,profile,done){
	    	profile.twitter_token = token;
	    	profile.twitter_token_secret = tokenSecret;

	    	//非同期イベントとする（node.jsの機能）
	    	process.nextTick(function(){
				//シリアライズの引数にプロファイルを設定
				return done(null,profile);
	    	});
		}
		));
	}

    setting.init = function(app,config){
		passportSetup(setting.passport);
		passportUse(setting.passport,setting.TwitterStrategy,config);
		//passportの初期化
		app.use(setting.passport.initialize());
		//passportでのログイン状態を保持するpassport sessionミドルウェアを有効化 
		app.use(setting.passport.session()); 
    }
    module.exports = setting;
})();


