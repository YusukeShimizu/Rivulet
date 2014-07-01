
//use socket.io(0.9.16)to enable real time communication
(function (){
    var connect = {};
    var setting = require(__dirname + '/setting');
    var templates = require(__dirname + '/templates');
    connect.init = function(server){
        connect.io = require('socket.io').listen(server);
        
        //connection will establish when auth is completed  
        connect.start = function(req,res){
            
            connect.io.sockets.on('connection', function (socket) {
                //candy always use JSON
                function send(data){
                    socket.emit('message', JSON.stringify(data));
                }
                if(req.user){
                    send({
                        action: "auth_OK",
                        info: req.user._json,
                        templates: templates
                    });
                    //setup node_twitter using token and token_secret
                    var node_twitter = setting.node_twitterUse(req.user.twitter_token,req.user.twitter_token_secret);

                    //start waiting any messages
                    node_twitter.stream('user', function(stream) {
                        stream.on('data', function(data) {
                            send({
                                tweet: data
                            });
                        });
                    });
                }else{
                    send({
                        action: "auth_NG"
                    });
                }

                socket.on('message', function(data){
                    //data always be JSON
                    data = JSON.parse(data);

                    if(data.action == "logout"){
                        //clear user_info
                        req.logout();
                        send({
                            action: "logout"
                        });
                    }
                });
            });
        }
    }
    module.exports = connect;
})();
