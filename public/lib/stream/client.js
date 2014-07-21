//use socket.io(0.9.16)to enable real time communication
(function(){
    var client = {};
    var streamFailCount = 0;
    
    client.connect =function connect(cb){
        // socket.io is loaded in page
        var socket = io.connect('http://candy-twitter.com/');
        
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
        // immediately after connect, start 
        socket.on('message', cb);

        // something wrong with streaming api 
        socket.on('message', function (msg) {
            if(failed) {
                console.log("[Backend] Ignoring messages after fail "+msg)
                return;
            }
            var data = JSON.parse(msg);
            if(data.message) {
                failed = true;
                console.log("Backend error:"+ data.message);
                // an error on the backend connection to twitter.
                // Wait a short time and then reconnect.
                setTimeout(function () {
                    socket.disconnect();
                    console.log("[Connect] Reconnecting after error "+streamFailCount);
                    client.connect(cb);
                }, 1000 * (++streamFailCount))
            }
        });
   }

    window.client = client;
})();
