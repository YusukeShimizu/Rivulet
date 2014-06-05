
(function(){
    var viewController = {};

    function auth(app,passport){
        // TwitterîFèÿ
        app.get("/auth/twitter", passport.authenticate('twitter'));
        // TwitterÇ©ÇÁÇÃcallback
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

