
//use socket.io(0.9.16)to enable real time communication
(function (){
    var connect = {};
   
    connect.init = function(server){
        connect.io = require('socket.io').listen(server);

        connect.start = function(req,res){
            connect.io.sockets.on('connection', function (socket) {
                //candy always use JSON
                function send(data){
                    socket.emit('message', JSON.stringify(data));
                }
                if(req.user){
                    send({
                        action: "auth_OK"
                    });
                }else{
                    send({
                        action: "auth_NG"
                    });
                }

                socket.on('message', function(msg){                
                    if(msg == "logout"){
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
