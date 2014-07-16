//use socket.io(0.9.16)to enable real time communication
(function (){
    var connect = {};
    connect.init = function(server){
        connect.io = require('socket.io').listen(server);
        
        //connection will establish when auth is completed  
        connect.start = function(req,res,templates,node_twitter){
            
            connect.io.sockets.on('connection', function (socket) {
                //always use JSON
                function send(data){
                    socket.emit('message', JSON.stringify(data));
                }
                if(req.user){
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
                else{
                    send({
                        action: "auth_NG"
                    });
                }
                socket.on('message', function(data){
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
