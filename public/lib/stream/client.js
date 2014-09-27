//use socket.io(1.0)to enable real time communication
(function(){
    var client = {};
    var confirm_interval;
    var auth_interval;
    var streamFailCount = 0;

    // socket.io is loaded in page
    var socket = io.connect();

    //always use JSON
    function send(data){
        socket.emit('message', JSON.stringify(data));
    }

    // make this globally accessible
    client.send = function(data){
        send(data);
    } 

    client.connect = function connect(cb) {
        // send all messages to callback
        socket.on('message', cb);

        var auth = 'no_auth';
        // check the connection status
        socket.on('message', function(msg){
            var data = JSON.parse(msg);
            console.log(data);

            if(data.action == 'auth_OK'){
                auth = 'auth_OK';
            }else if(data.message){
                console.log("[Backend] Stream error "+data.message);

                // We have an error on the backend connection to twitter.
                // Wait a short time and then reconnect.
                setTimeout(function () {
                    clearInterval(confirm_interval);
                    socket.disconnect(); // just making sure
                    console.log("[Connect] Reconnecting after stream error "+streamFailCount);
                    client.connect(cb);
                }, 1000 * (++streamFailCount));    
        
            }
        });

        function confirm_connection(){
            if(auth == 'no_auth'){
                send('no_auth');

            }else{
                send('ping');
            }
        }

        function confirm_auth(){
            send('no_auth');
        }
        
        if(confirm_interval) {
            clearInterval(confirm_interval);
        }

        confirm_interval = setInterval(confirm_connection, 5000);
        auth_interval = setInterval(confirm_auth,360000);
        confirm_connection();
    }
    window.client = client;
})();
