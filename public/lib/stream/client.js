//use socket.io(0.9.16)to enable real time communication
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
        // init auth token from cookie. Backend like to receive a value so we use "EMPTY"
        var token = cookie.get("token") || "EMPTY";
        // immediately after connect, send the auth token
        socket.send(JSON.stringify({
            token: token
        }));

        // send all messages to callback
        socket.on('message', connect);
        var connected = true;

        socket.on('message', function(msg){
            var data = JSON.parse(msg);
            if(data == "pong") {
                // a successful connection
                connected = true;
            }
        });

        // send a ping every N seconds
        function ping() { 
            connected = false;
            send('ping');
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
        interval = setInterval(ping, 5000);
        ping();
    }
    window.client = client;
})();
