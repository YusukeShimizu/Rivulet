//use socket.io(0.9.2)to enable real time communication
(function(){
    var client = {};
    var interval;
    var pingTimeout;
    // socket.io is loaded in page
    var socket = io.connect('http://localhost');

    //candy always use JSON
    function send(data){
        socket.emit('message', JSON.stringify(data));
    }

    // make this globally accessible
    client.send = function(data){
        send(data);
    } 

    client.connect = function(connect){ 

        // send all messages to callback
        socket.on('message', connect);
        var connected = true;
        var auth = false;

        socket.on('message', function(msg){
            var data = JSON.parse(msg);
            if(data == "pong") {
                // a successful connection
                connected = true;
            }
            else if(data.action == 'auth_OK'){
                auth = true;
                connected = true;
            }
        });

        // send a ping every N seconds
        function confirm_connection() { 
            connected = false;
            if(!auth){
                send('no_auth');
            }
            else{
                send('ping');
            }
            if(pingTimeout) {
                clearTimeout(pingTimeout);
            }
            pingTimeout = setTimeout(function () { 
                if(!connected) {
                    clearInterval(interval);
                    socket.disconnect();
                    console.log("[Connect] Reconnecting after connection failure");
                    client.connect(connect);
                }
            }, 3000)
        }
        if(interval) {
            clearInterval(interval);
        }
        interval = setInterval(confirm_connection, 5000);
        confirm_connection();
    }
    window.client = client;
})();
