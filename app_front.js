/**
 * Created by LiHaoyan on 4/21/2017.
 */
var socket = io();
var onTypes = {
  sys_msg: 'system message',
  user_msg: 'user message',
  user_reg: 'user register',
  userL_push: 'user list push',
  offer: 'offer'

};

function User(username, userid) {
  this.username = username;
  this.userid = userid;
}

var msg_pack = {},
  offerPack = {};

$('#name_btn').click(function () {

  var user_name = $('#name').val();

  socket.emit(onTypes.user_reg, user_name);
  msg_pack.caller = new User(user_name, socket.id);
  offerPack.caller = msg_pack.caller;

  $(this).before($('<p>')
    .text(user_name + '#' + socket.id));
  $(this).prevAll('#name')
    .hide();
  $(this).hide();

  return false;
});

$('#message_btn').click(function () {
  var msg_input = $('#message_form');
  var echo = 'Private Message to ' + msg_pack.callee.username + ': ';
  msg_pack.msg = msg_input.val();

  socket.emit(onTypes.user_msg, JSON.stringify(msg_pack));

  msg_input.val('');
  $('#message_detailed').append($('<li>')
    .text(echo + msg_pack.msg)
    .addClass('msg_line'));

  return false;
});

socket.on(onTypes.sys_msg, function (msg) {
  $('#message_detailed').append($('<li>').text(msg).addClass('msg_line'));
});

socket.on(onTypes.user_msg, function (msg) {
  var msg_pack = JSON.parse(msg);
  var echo = '';

  if (msg_pack.callee === undefined) {
    echo = 'Public Message: ';
  } else {
    echo = 'Private Message from ' + msg_pack.caller.username + ': ';
  }
  $('#message_detailed').append($('<li>')
    .text(echo + msg_pack.msg).addClass('msg_line'));
});

socket.on(onTypes.userL_push, function (user_list_json) {
  var user_list = JSON.parse(user_list_json);

  $('#user_list_detailed').empty();

  user_list.forEach(function (p1, p2, p3) {
    if (p1.hasOwnProperty('username')) {
      $('#user_list_detailed').append(
        $('<li>').text(p1.username).addClass('user_line').attr(
          {"isSelected": 'false', "id": p1.userid})
//                                (p2 + 1).toString()
      );
    }
  });

  $('li.user_line').click(function () {
//                        var selected_username = $(this).text();
    var selected_user = new User($(this).text(), $(this).attr('id'));

    if ($(this).attr("isSelected") === 'false') {
      $('label[for="message_form"]').after(
        $('<p>').text(selected_user.username).addClass("selected user").attr(
          {"username": selected_user.username}
        )
      );
      $(this).css({'color': 'red'}).attr({"isSelected": 'true'});
      msg_pack.callee = selected_user;
      offerPack.callee = msg_pack.callee;
    }
    else {
      var selector = 'p.selected.user[username="' + selected_user.username + '"]';
//                            console.info(selector);
      $(selector).remove();
      $(this).css({'color': 'black'}).attr({"isSelected": 'false'});
      msg_pack.callee = undefined;
      offerPack.callee = msg_pack.callee;
    }
    return false;
  });
});

function SendOffer(sdp) {
  offerPack.sdp = sdp;
  socket.emit(onTypes.offer, JSON.stringify(offerPack))
}

socket.on(onTypes.offer, function (offerPackReceived) {
  HandleVideoOffer(JSON.parse(offerPackReceived));
});

function SendAnswer(videoAnswer) {

}