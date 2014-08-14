/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.header = function(req,res){
    //yay? connect.start(req,res,setting);
    res.redirect('/');
};

exports.stream = function(socket){};
