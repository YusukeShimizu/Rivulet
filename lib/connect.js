//use socket.io(0.9.16)to enable real time communication
(function (){
    var connect = {};
    connect.init = function(server){
        connect.io = require('socket.io').listen(server);
        
        //connection will establish when auth is completed  
        connect.start = function(req,res,templates,node_twitter){
            
            connect.io.sockets.on('connection', function (socket) {
                //candy always use JSON
                function send(data){
                    socket.emit('message', JSON.stringify(data));
                }
                socket.on('message', function(data){
                    data = JSON.parse(data);
                    if(data == "ping"){
                        send({
                            action: "pong",
                            info:req.user._json
                        });
                    }
                    else if(req.user._json){
                        send({
                            action: "auth_OK",
                            info: req.user._json,
                            templates: templates
                        });
                        //waiting any stream
                        node_twitter.stream('user', function(stream) {
                            stream.on('data', function(data) {
                                send({
                                    tweet: data
                                });
                            });
                        });
                    }
                    else if(data.action == "logout"){
                        //clear user_info
                        req.logout();
                        send({
                            action: "logout"
                        });
                    }
                    else{
                        send({
                            action: "auth_NG"
                        });
                    }
                });
            });
        }
    }
    module.exports = connect;
})();
