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

io.on('connection', function (curr_socket) {
    welcome(curr_socket);

    curr_socket.user = new User();

    curr_socket.on(onTypes.user_reg, function (user_info) {
        var system_message = '';

        curr_socket.user.username = user_info;
        curr_socket.user.userid = curr_socket.id;
        system_message = 'User #' + user_info + '# is coming.';

        console.info(system_message);
        curr_socket.emit(onTypes.sys_msg, system_message);
        test();
        // getConnectedUser('/');
        // curr_socket.emit(onTypes.userL_push, getConnectedUser('/'));
    });

    sendPrivateMessage(curr_socket);
});

function welcome(curr_socket) {
    const welcome = 'Someone has connected to the server.';

    console.info(welcome);
    curr_socket.emit('system_info', welcome);
}

// function registerNewUser(curr_socket) {
//     curr_socket.user = new User();
//
//     console.info('Warning!');
//     curr_socket.on(onTypes.user_reg, function (user_info) {
//         var system_message = '';
//
//         curr_socket.user.username = user_info;
//         curr_socket.user.userid = curr_socket.id;
//         system_message = 'User #' + user_info + '# is coming.';
//
//         console.info(system_message);
//         curr_socket.emit(onTypes.sys_msg, system_message);
//         curr_socket.emit(onTypes.userL_push, getConnectedUser('/'));
//     });
// }

function sendPrivateMessage(curr_socket) {
    curr_socket.on(onTypes.pri_msg, function (msg) {
        console.info('Caller: ' + msg.caller);
        console.info('Caller: ' + msg.caller);
        console.info('Message: ' + msg.msg);
        curr_socket.to(msg.callee.userid).emit(onTypes.pri_msg, msg.msg);
    })
}

function getConnectedUser() {
    // root.clients(function(error, clients){
    //     if (error) throw error;
    //     console.log(clients);
    //     return clients;
    // });
    console.info(root.connected);
    return root.connected;
}

io.getConnectedUser = function () {
    root.clients(function(error, clients){
        if (error) throw error;
        console.log(clients);
        var clients_pair = [];
        clients.forEach(function (p1, p2, p3) {

        })
    });
};

function test() {
    root.clients(function (error, clients) {
        if (error) throw error;
        var user_list = [];
        console.info(clients);
        clients.forEach(function (p1, p2, p3) {
            console.info(root.connected[p1]);
            user_list.push(root.connected[p1].user);
        });
        console.log(user_list);
    })
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