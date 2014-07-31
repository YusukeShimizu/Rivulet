//use socket.io(0.9.16)to enable real time communication
(function (){
    var connect = {};
    var isLogined = {};
    
    // when oauth is completed
    connect.start = function(req,res,templates,node_twitter){
        isLogined = {
            info: req.user._json,
            templates: templates,
            node_twitter: node_twitter
        }
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
                    if(isLogined.info){
                        send({
                            action: "auth_OK",
                            info: isLogined.info,
                            templates: isLogined.temlates
                        });
                        //waiting any stream
                        isLogined.node_twitter.stream('user', function(stream) {
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
