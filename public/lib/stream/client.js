//use socket.io(0.9.2)to enable real time communication
(function(){
    var client = {};
    // actual failed connects since last successfull connect
    var connectFail  = 0;  
    var connectCount = 0;
    var streamFailCount = 0;
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

    client.connect = function connect(cb) {
        var wait = (connectFail < 0 ? 0 : connectFail) * 1000;
        var max  = 30 * 1000;
        if(wait > max) {
            wait = max;
        }
        console.log("[Connect] waiting for "+wait);
        setTimeout(function () {
            _connect(cb)
        }, wait);
    }

    function _connect(cb){ 

        // send all messages to callback
        socket.on('message', cb);
        var failed = false;
        var connected = true;
        var auth = false;

        socket.on('message', function(msg){
            if(failed) {
                console.log("[Backend] Ignoring messages after fail "+msg);
                return;
            }
            var data = JSON.parse(msg);
            if(data == "pong") {
                // a successful connection
                connectFail = -1;
                connected = true;
            }
            else if(data.action == 'auth_OK'){
                auth = true;
                connected = true;
            }else if(data.message){
                failed = true;
                console.log("[Backend] Stream error "+data.streamError);
                // We have an error on the backend connection to twitter.
                // Wait a short time and then reconnect.
                setTimeout(function () {
                    if(pingTimeout) {
                        clearTimeout(pingTimeout);
                    }
                    clearInterval(interval);
                    socket.disconnect(); // just making sure
                    console.log("[Connect] Reconnecting after stream error "+streamFailCount);
                    client.connect(cb);
                }, 1000 * (++streamFailCount));
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
                    connectFail++;
                    console.log("[Connect] Reconnecting after connection failure");
                    client.connect(cb);
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
