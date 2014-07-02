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
            var node_twitter = setting.node_twitterUse(req.user.twitter_token,req.user.twitter_token_secret);
            connect.start(req,res,setting.templates,node_twitter);
            res.redirect('/');
        });
    }

    router.init = function (app,connect,setting){
        auth(app,setting.passport);
        header(app,connect,setting);
    }
    module.exports = router;
})();
