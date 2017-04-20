/**
 * Created by LiHaoyan on 3/31/2017.
 */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(8080);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/main.html');
});

var root = io.of('/');

function User(username, userid) {
    this.username = username;
    this.userid = userid;
}

var onTypes = {
    sys_msg: 'system message',
    user_msg: 'user message',
    user_reg: 'user register',
    userL_push: 'user list push',
    offer: 'offer'
};

var messagePack = {};
messagePack.caller = new User('', 0);
messagePack.callee = new User('', 0);
messagePack.msg = '';

io.on('connection', function (curr_socket) {
    welcome(curr_socket);

    registerNewUser(curr_socket);

    sendUserMessage(curr_socket);
});

function welcome(curr_socket) {
    const welcome = 'Someone has connected to the server.';

    console.info(welcome);
    curr_socket.emit('system_info', welcome);
}

function registerNewUser(curr_socket) {
    curr_socket.user = new User();

    curr_socket.on(onTypes.user_reg, function (user_info) {
        var system_message = 'User #' + user_info + '# is coming.';

        curr_socket.user.username = user_info;
        curr_socket.user.userid = curr_socket.id;

        console.info(system_message);
        root.emit(onTypes.sys_msg, system_message);

        root.emit(onTypes.userL_push, JSON.stringify(pushUserList()));
    });
}

function sendPrivateMessage(curr_socket) {
    curr_socket.on(onTypes.pri_msg, function (msg) {
        console.info('Caller: ' + msg.caller);
        console.info('Caller: ' + msg.caller);
        console.info('Message: ' + msg.msg);
        curr_socket.to(msg.callee.userid).emit(onTypes.pri_msg, msg.msg);
    })
}

function sendOffer() {

}

function sendUserMessage(curr_socket) {
    curr_socket.on(onTypes.user_msg, function (msg) {
        var msg_pack = JSON.parse(msg);

        if (msg_pack.callee === undefined) {
            console.info('Caller: ' + msg_pack.caller.username);
            console.info('Message: ' + msg_pack.msg);

            root.emit(onTypes.user_msg, msg);
        } else {
            console.info('Caller: ' + msg_pack.caller.username);
            console.info('Callee: ' + msg_pack.callee.username);
            console.info('Message: ' + msg_pack.msg);

            curr_socket.to(msg_pack.callee.userid).emit(onTypes.user_msg, msg);
        }
    })
}

function pushUserList() {
    var user_list = [];
    var connected_clients = Object.values(root.connected);

    connected_clients.forEach(function (p1, p2, p3) {
        user_list.push(p1.user);
    });
    // console.log(user_list);

    return user_list;
}

// logging
var fs = require('fs');
var util = require('util');
var logFile = fs.createWriteStream('log.txt', { flags: 'a' });
// Or 'w' to truncate the file every time the process starts.
var logStdout = process.stdout;

console.log = function () {
    logFile.write(util.format.apply(null, arguments) + '\n');
    logStdout.write(util.format.apply(null, arguments) + '\n');
};
console.error = console.log;