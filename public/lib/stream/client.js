//use socket.io(0.9.16)to enable real time communication
(function(){
    var client = {};
    var connectFail  = 0; 
    var connectCount = 0;
    var streamFailCount = 0;
    var pingTimeout;
    var interval;

    client.connect = function(cb){
        var wait = (connectFail < 0 ? 0 : connectFail) * 1000;
        var max  = 30 * 1000;
        if(wait > max) {
            wait = max;
        }
        console.log("[Connect] waiting for "+wait);
        setTimeout(function () {
            _connect(cb);
        }, wait);
    }

    function _connect(cb){
        // socket.io is loaded in page
        var socket = io.connect('http://localhost');
        socket.on('message', connect);

        var failed = false;
        var connected = true;

        //always use JSON
        function send(data){
            socket.emit('message', JSON.stringify(data));
        }
        //make this globally accessible
        client.send = function(data){
            send(data);
        }

        socket.on('message', function (msg) {
            if(failed) {
                console.log("[Backend] Ignoring messages after fail "+msg)
                return;
            }
            var data = JSON.parse(msg);
            if(data == "pong") {
                // we have a successful connection
                connectFail = -1; 
                connected = true;
            }
            else if(data.message) {
                failed = true;
                console.log("Backend error:"+ data.message);
                // We have an error on the backend connection to twitter.
                // Wait a short time and then reconnect.
                setTimeout(function () {
                    if(pingTimeout) {
                        clearTimeout(pingTimeout);
                    }
                    clearInterval(interval);
                    socket.disconnect();
                    console.log("[Connect] Reconnecting after error "+streamFailCount);
                    connect(cb);
                }, 1000 * (++streamFailCount))
            }
        });

        function ping() { // send a ping every N seconds
            connected = false;
            send('ping');
            if(pingTimeout) {
                clearTimeout(pingTimeout);
            }

            // if within 3 seconds there was no pong we assume the socket is gone and reconnect
            pingTimeout = setTimeout(function () { 
                if(!connected) {
                    clearInterval(interval);
                    connectFail++;
                    socket.disconnect(); 
                    console.log("[Connect] Reconnecting after connection failure");
                    connect(cb);
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
