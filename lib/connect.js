
//use socket.io(0.9.16)to enable real time communication
(function (){
    var connect = {};
   
    connect.init = function(server){
        connect.io = require('socket.io').listen(server);
    }

    connect.send = function(auth,req,res){
        connect.io.sockets.on('connection', function (socket) {
            socket.emit('auth', { auth: 'auth_OK' });
        });
    }
    
    module.exports = connect;
})();
