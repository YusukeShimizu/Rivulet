
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
    };
    
        function header(app,connect){
        //connect socket.io
        app.get("/header",function(req,res){
            connect.send("auth_OK",req,res);
            res.redirect('/');
        });
    }

    viewController.init = function (app,passport,connect){
        auth(app,passport);
        header(app,connect);
    }
    module.exports = viewController;
})();

