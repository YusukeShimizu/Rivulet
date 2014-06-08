
(function(){
    var viewController = {};

    function auth(app,passport){
        //twitter auth
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

    function logout(app,connect){
        //logout twitter
        app.get("/logout/twitter",function(req,res){
            req.logout();
            res.redirect('/');
        });
    }

    viewController.init = function (app,connect,passport){
        auth(app,passport);
        header(app,connect);
        logout(app);
    }
    module.exports = viewController;
})();

