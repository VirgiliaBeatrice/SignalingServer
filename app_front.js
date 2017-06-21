/**
 * Created by LiHaoyan on 4/21/2017.
 */
var socket = io();
var onTypes = {
  sys_msg: 'system message',
  user_msg: 'user message',
  user_reg: 'user register',
  userL_push: 'user list push',
  offer: 'offer',
  answer: 'answer',
  candidate: 'candidate',
};

function User(username, userid) {
  this.username = username;
  this.userid = userid;
}

var msgPack = {},
    offerPack = {},
    candidatePack = {};

$('#name_btn').click(function () {
  var user_name = $('#name').val();

  socket.emit(onTypes.user_reg, user_name);

  // Set current user name into the caller portion of each message pack.
  msgPack.caller = new User(user_name, socket.id);
  offerPack.caller = msgPack.caller;
  candidatePack.caller = msgPack.caller;

  $(this).before($('<p>')
    .text(user_name + '#' + socket.id));
  $(this).prevAll('#name')
    .hide();
  $(this).hide();

  return false;
});


$('#message_btn').click(function () {
  var msgInput = $('#message_form');
  msgPack.msg = msgInput.val();

  if (msgPack.callee !== undefined) {
    var echo = 'Private Message to ' + msgPack.callee.username + ': ';

    console.info(msgPack.callee);
    socket.emit(onTypes.user_msg, JSON.stringify(msgPack));

    AddLiElement('#message_detailed', 'msg_line', echo + msgPack.msg);
  }
  else {
    console.info("No callee has been set up.");
  }

  // Clean previous input.
  msgInput.val('');

  return false;
});


$('button.btn#full_screen_btn').click(
  function () {
    if ($(this).attr("isFullScreen") === "false"){
      console.info("Change to Full screen mode.");

      $(this).attr("isFullScreen", "true");
      $('div#video_frame').addClass("overlay");
      $('.overlay').css({"width": "100%", "position": "fixed"});

      $("div#video_elem").css({
        "width": "100%",
        "height": "100%"
      });

      $("div#ctrl_btns").css({
        "position": "fixed",
        "bottom": "0"
      });

    }
    else {
      console.info("Change to normal layout.");

      $(this).attr("isFullScreen", "false");
      $('.overlay').removeAttr("style").removeAttr("class");
      $("div#video_elem").removeAttr("style");
      $("div#ctrl_btns").removeAttr("style");
    }



    return false;
  }
);


socket.on(onTypes.sys_msg, function (msg) {
  AddLiElement('#message_detailed', 'msg_line', msg);
});


socket.on(onTypes.user_msg, function (msg) {
  var msgPack = JSON.parse(msg);
  var echo = '';

  if (msgPack.callee === undefined) {
    echo = 'Public Message: ';
  }
  else {
    echo = 'Private Message from ' + msgPack.caller.username + ': ';
  }

  AddLiElement('#message_detailed', 'msg_line', echo + msgPack.msg);
});


socket.on(onTypes.userL_push, function (user_list_json) {
  var user_list = JSON.parse(user_list_json);

  $('#user_list_detailed').empty();

  user_list.forEach(function (p1, p2, p3) {
    if (p1.hasOwnProperty('username')) {
      AddLiElement(
        '#user_list_detailed',
        'user_line',
        p1.username,
        {"isSelected": 'false', "id": p1.userid}
      );
    }
  });

  $('a.user_line').click(function () {
//                        var selected_username = $(this).text();
    var selected_user = new User($(this).text(), $(this).parent().attr('id'));

    if ($(this).attr("isSelected") === 'false') {
      $('label[for="message_form"]').after(
        $('<p>').text(selected_user.username).addClass("selected user").attr(
          {"username": selected_user.username}
        )
      );
      $(this).css({'color': 'red'}).attr({"isSelected": 'true'});
      msgPack.callee = selected_user;
      offerPack.callee = msgPack.callee;
      candidatePack.callee = msgPack.callee;
    }
    else {
      var selector = 'p.selected.user[username="' + selected_user.username + '"]';

      $(selector).remove();
      $(this).attr({"isSelected": 'false'}).removeAttr('style');

      // Clear the callee setting of each message pack.
      msgPack.callee = undefined;
      offerPack.callee = msgPack.callee;
      candidatePack.callee = msgPack.callee;
    }

    return false;
  });
});

function SendOfferAndAnswer(sdp, prevCaller) {
  offerPack.sdp = sdp;
  if (prevCaller !== undefined) {
    offerPack.callee = prevCaller;
  }
  console.info(offerPack);
  if (offerPack.sdp.type === 'offer') {
    socket.emit(onTypes.offer, JSON.stringify(offerPack))
  }else if (offerPack.sdp.type === 'answer') {
    socket.emit(onTypes.answer, JSON.stringify(offerPack))
  }
}

function SendICECandidate(candidate) {
  candidatePack.candidate = candidate;

  console.info(candidatePack);
  socket.emit(onTypes.candidate, JSON.stringify(candidatePack));
}

socket.on(onTypes.offer, function (offerPackReceived) {
  HandleVideoOffer(JSON.parse(offerPackReceived));
});

socket.on(onTypes.answer, function (answerPackReceived) {
  HandleVideoAnswer(JSON.parse(answerPackReceived));
});

socket.on(onTypes.candidate, function (candidatePackReceived) {
  HandleNewICECandidateMsg(JSON.parse(candidatePackReceived));
});


function AddLiElement(tarUlName, tarClsName, content, attrVal) {
  $tarUl = $(tarUlName);

  $tarUl.append($('<li>'));
  $tarUl.children().last().append($('<a>').text(content).addClass(tarClsName));

  if (attrVal !== undefined) {
    $tarUl.children().last().attr(attrVal);
  }
  else {
    console.info("No attribute.");
  }
  return $tarUl;
}
