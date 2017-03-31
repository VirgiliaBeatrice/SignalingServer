/**
 * Created by LiHaoyan on 3/31/2017.
 */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

var root = io.of('/');

io.on('connection', function (socket) {
    const welcome = 'Someone has connected to the server.';

    console.info(welcome);
    socket.emit('system_info', welcome);

   socket.on('name_register', function (user) {
       var system_message = 'User #' + user.name + '# is coming.';
       socket.username = user.name;

       console.info(system_message);
       socket.emit('system_info', welcome);
   });
   
   socket.on('send', function (msg_package) {
        socket.to()
   })
});