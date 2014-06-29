
(function(){
    var viewController = {};

    function auth(app,passport){
        //twitter auth
        console.log(passport);
        app.get("/auth/twitter", passport.authenticate('twitter'));
        //twitter callback
        app.get("/auth/twitter/callback", passport.authenticate('twitter', {
        successRedirect: '/header',
        failureRedirect: '/'
        }));
    }
    
    function header(app,connect){
        //real time communication using socket.io
        app.get("/header",function(req,res){
            connect.start(req,res);
            res.redirect('/');
        });
    }

    viewController.init = function (app,connect,passport){
        auth(app,passport);
        header(app,connect);
    }
    module.exports = viewController;
})();

