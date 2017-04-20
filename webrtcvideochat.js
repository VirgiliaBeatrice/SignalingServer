/**
 * Created by Haoyan.Li on 2017/3/29.
 */
'use strict';

var constraints = {
  video: true,
  audio: false,
};


var $localVideo = $('.video-frame#video_local video'),
    $remoteVideo = $('.video-frame#video_remote video');

var $localBtn = $('.btn#local_video_ctrl_btn button'),
    $remoteBtn = $('.btn#remote_video_ctrl_btn button'),
    $localInviteBtn = $('.btn#local_video_invite_btn button'),
    $remoteInviteBtn = $('.btn#remote_video_invite_btn button');
var localStream;

$localBtn.click(function () {
  var localMediaDevice = navigator.mediaDevices.getUserMedia(constraints);

  localMediaDevice.then(function (stream) {
    var videoTracks = stream.getVideoTracks();

    console.log('Got stream with constraints: ', constraints);
    console.log('Using Video device: ' + videoTracks[0].label);

    stream.onremovetrack = function () {
      console.log('Stream ended.');
    };

    window.stream = stream;
    $localVideo.srcObject = stream;
  }).catch(function (error) {

  })
});

var iceServers = {
  iceServers: [{
    'url': [
      'stun:stun.l.google.com:19302'
    ]
  }]
};

$localInviteBtn.click(function () {
  var activePeer =  new RTCPeerConnection(iceServers);

  activePeer.addTrack()
});




function signalingChannel() {
  this.socket = new io();
  this.onreceive = new Event('receive', {"bubbles": true, "cancelable": false});

  function send(msg) {
    this.socket.emit('message', msg);
  }
}

localPeer.addIceCandidate();