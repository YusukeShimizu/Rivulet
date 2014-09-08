
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Candy' });
};

exports.logout = function(req,res){
    req.logout();
    delete req.session.user;
    res.redirect('/');
};

exports.header = function(req,res){
    //user_info contains in the session
    req.session.user = req.user;
    console.log("successfully login @" + req.user._json.screen_name);
    res.redirect('/');
};

