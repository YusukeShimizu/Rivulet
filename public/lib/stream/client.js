
<script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io.connect('http://localhost');
  socket.on('auth', function (data) {
    console.log(data.auth);
  });
</script>
