
//use socket.io(0.9.16)to enable real time communication
(function(){
    var client = {};
    // socket.io is loaded in page
    var socket = io.connect('http://localhost');
    client.connect = function(connect){
        socket.on('message', connect);
    }
    window.client = client;
})();

