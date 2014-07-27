//use socket.io(0.9.16)to enable real time communication
(function (){
    var connect = {};
    var user_info;
   
     connect.start = function(req,res){
        user_info = req.user._json;
    }

    connect.init = function(server){
        var io = require('socket.io').listen(server);
                
        io.sockets.on('connection', function (socket) {

            //always use JSON
            function send(data){
                socket.emit('message', JSON.stringify(data));
            }
            
            socket.on('message', function(data){
                data = JSON.parse(data);
                console.log(data);
                if(data == 'isLogined'){
                    if(user_info){
                        send({
                            action: "auth_OK"
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
