
//use socket.io(0.9.16)to enable real time communication
(function(){
    var client = {};
    // socket.io is loaded in page
    var socket = io.connect('http://localhost');

    //candy always use JSON
    function send(data){
        socket.emit('message', JSON.stringify(data));
    }

    client.connect = function(connect){
        socket.on('message', connect);
    }

    client.send = function(data){
        send(data);
    }
    window.client = client;
})();

