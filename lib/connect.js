//use socket.io(0.9.16)to enable real time communication
(function (){
    var connect = {};
    var isLogined = {};
    
    // when oauth is completed
    connect.start = function(req,res,setting){
        isLogined = {
            user: req.user,
            setting: setting
        }
    }

    connect.init = function(server){
        var io = require('socket.io').listen(server);
                
        io.sockets.on('connection', function (socket) {
            
            socket.on('message', function(data){

                //always use JSON
                function send(data){
                    socket.emit('message', JSON.stringify(data));
                }

                data = JSON.parse(data);
                console.log(data);
                if(data == 'isLogined'){
                    if(isLogined.user){
                        send({
                            action: "auth_OK",
                            info: isLogined.user._json,
                            templates: isLogined.setting.templates
                        });
                        //waiting any stream
                        isLogined.setting.node_twitterUse(isLogined.user.twitter_token,isLogined.user.twitter_token_secret,function(ntwitter){
                            ntwitter.stream('user', function(stream) {
                                stream.on('data', function(data) {
                                    send({
                                        tweet: data
                                    });
                                });
                            });
                        });
                    }
                    else{
                        send({
                            action: "auth_NG"
                        });                        
                    }
                }
                else if(data == 'ping'){
                    send("pong");
                }else{
                    console.log(data);
                }
            });
        });
    }
    module.exports = connect;
})();
