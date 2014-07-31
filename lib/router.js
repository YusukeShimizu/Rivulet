(function(){
    var router = {};

    function auth(app,passport){
        //twitter auth
        app.get("/auth/twitter", passport.authenticate('twitter'));
        //twitter callback
        app.get("/auth/twitter/callback", passport.authenticate('twitter', {
            successRedirect: '/header',
            failureRedirect: '/'
        }));
    }
    
    function header(app,connect,setting){
        //real time communication using socket.io
        app.get("/header",function(req,res){
            connect.start(req,res,setting);
            res.redirect('/');
        });
    }

    router.init = function (app,connect,setting){
        auth(app,setting.passport);
        header(app,connect,setting);
    }
    module.exports = router;
})();
