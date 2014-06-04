
(function(){
    var viewController = {};

    function auth(app,passport){
		// Twitter‚Ì”FØ
		app.get("/auth/twitter", passport.authenticate('twitter'));
		// Twitter‚©‚ç‚Ìcallback
		app.get("/auth/twitter/callback", passport.authenticate('twitter', {
            successRedirect: '/header',
            failureRedirect: '/'
        }));
    };

    viewController.init = function (app,passport){
        auth(app,passport);
    }
		module.exports = viewController;
})();

