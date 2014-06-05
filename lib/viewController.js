
(function(){
    var viewController = {};

    function auth(app,passport){

        //twitter auth
        app.get("/auth/twitter", passport.authenticate('twitter'));
        //twitter call back
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

