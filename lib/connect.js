
//use socket.io(0.9.16)to enable real time communication
(function (){
    var connect = {};
   
    connect.init = function(server){
        connect.io = require('socket.io').listen(server);
    }

    connect.send = function(req,res){
        connect.io.sockets.on('connection', function (socket) {

            //candy always use JSON
            function send(data){
                socket.emit('message', JSON.stringify(data));
            }
            
            send({
                action: "auth_OK"
            });
            
        });
    }
    
    module.exports = connect;
})();
