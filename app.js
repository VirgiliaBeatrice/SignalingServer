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

function User(username, userid) {
    this.username = username;
    this.userid = userid;
}

var onTypes = {
    sys_msg: 'system message',
    pri_msg: 'private message',
    pub_msg: 'public message',
    userL_req: 'user list request',
    user_reg: 'user register',
    userL_push: 'user list push'
};

var messagePack = {};
messagePack.caller = new User('', 0);
messagePack.callee = new User('', 0);
messagePack.msg = '';

io.on('connection', function (socket) {
    const welcome = 'Someone has connected to the server.';

    console.info(welcome);
    socket.emit('system_info', welcome);

    registerNewUser(socket);
   
   socket.on('send', function (msg_pack) {
       console.info('S: ' + msg_pack.caller.username + ' R: ' + msg_pack.callee.username + ' - ' + msg_pack.msg);
        socket.to(msg_pack.callee.userid).emit('private_msg', msg_pack.msg);
   })
});

function registerNewUser(socket) {
    socket.user = new User();

    socket.on(onTypes.user_reg, function (user_info) {
        var system_message = 'User #' + socket.user.username + '# is coming.';

        socket.user.username = user_info;
        socket.user.userid = socket.id;

        console.info(system_message);
        socket.emit(onTypes.sys_msg, system_message);
        socket.emit(onTypes.userL_push, getConnectedUser('/'));
    });
}

function getConnectedUser(path) {
    return io.of(path).connected;
}