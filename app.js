/**
 * Created by LiHaoyan on 3/31/2017.
 */
var express = require('express');
var app = express();


var http = require('http').Server(app);
// var io = require('socket.io')(https);
var fs = require('fs');

http.listen(8080);


var privateKey = fs.readFileSync('./cert/private.pem', 'utf-8');
var certificate = fs.readFileSync('./cert/file.crt', 'utf-8');
var credentials = {
  key: privateKey,
  cert: certificate,
};
var https = require('https').Server(credentials, app);
var io = require('socket.io')(https);

https.listen(8081);


app.use('/', express.static(__dirname + '/'));
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
  offer: 'offer',
  answer: 'answer',
  candidate: 'candidate',
};

var messagePack = {};
messagePack.caller = new User('', 0);
messagePack.callee = new User('', 0);
messagePack.msg = '';

io.on('connection', function (curr_socket) {
  welcome(curr_socket);

  registerNewUser(curr_socket);

  sendUserMessage(curr_socket);

  sendOfferMsg(curr_socket);

  sendAnswerMsg(curr_socket);

  sendCandidateMsg(curr_socket);
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

function sendOfferMsg(curr_socket) {
  curr_socket.on(onTypes.offer, function (msg) {
    var msg_pack = JSON.parse(msg);

    if (msg_pack.callee === undefined) {
      console.info('Caller: ' + msg_pack.caller.username);
      console.info('Message: ' + msg_pack.sdp);

      root.emit(onTypes.user_msg, msg);
    } else {
      console.info('Caller: ' + msg_pack.caller.username);
      console.info('Callee: ' + msg_pack.callee.username);
      console.info('SDP: ' + JSON.stringify(msg_pack.sdp));

      curr_socket.to(msg_pack.callee.userid).emit(onTypes.offer, msg);
    }
  })
}

function sendAnswerMsg(curr_socket) {
  curr_socket.on(onTypes.answer, function (msg) {
    var msg_pack = JSON.parse(msg);

    if (msg_pack.callee === undefined) {
      console.info('Caller: ' + msg_pack.caller.username);
      console.info('Message: ' + msg_pack.sdp);

      root.emit(onTypes.user_msg, msg);
    } else {
      console.info('Caller: ' + msg_pack.caller.username);
      console.info('Callee: ' + msg_pack.callee.username);
      console.info('SDP: ' + JSON.stringify(msg_pack.sdp));

      curr_socket.to(msg_pack.callee.userid).emit(onTypes.answer, msg);
    }
  })
}

function sendCandidateMsg(curr_socket) {
  curr_socket.on(onTypes.candidate, function (msg) {
    var msg_pack = JSON.parse(msg);

    if (msg_pack.callee === undefined) {
      console.info('Caller: ' + msg_pack.caller.username);
      console.info('Message: ' + msg_pack.candidate);

      root.emit(onTypes.user_msg, msg);
    } else {
      console.info('Caller: ' + msg_pack.caller.username);
      console.info('Callee: ' + msg_pack.callee.username);
      console.info('Candidate: ' + JSON.stringify(msg_pack.candidate));

      curr_socket.to(msg_pack.callee.userid).emit(onTypes.candidate, msg);
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
// var fs = require('fs');
var util = require('util');
var logFile = fs.createWriteStream('log.txt', {flags: 'a'});
// Or 'w' to truncate the file every time the process starts.
var logStdout = process.stdout;

console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n');
  logStdout.write(util.format.apply(null, arguments) + '\n');
};
console.error = console.log;