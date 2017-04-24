/**
 * Created by Haoyan.Li on 2017/3/29.
 */
'use strict';

var constraints = {
  video: true,
  audio: false,
};


var $localVideo = $('video.video#video_local')[0],
    $remoteVideo = $('video.video#video_remote')[0];

var $localCtrlBtn = $('button.btn#local_video_ctrl_btn'),
    $remoteBtn = $('button.btn#remote_video_ctrl_btn'),
    $localInviteBtn = $('button.btn#local_video_invite_btn'),
    $remoteInviteBtn = $('button.btn#remote_video_invite_btn');

var localVideo = document.getElementById('video_local');

var localStream,
    videoTracks,
    peerConnection1,
    peerConnection2;

$localCtrlBtn.click(function () {
  // var localMediaDevice = navigator.mediaDevices.getUserMedia(constraints);

  console.info('Loading video streaming.');

  navigator.mediaDevices.getUserMedia(constraints)
    .then(function (stream) {
    videoTracks = stream.getVideoTracks();

    console.log('Got stream with constraints: ', constraints);
    console.log('Using Video device: ' + videoTracks[0].label);

    stream.onremovetrack = function () {
      console.log('Stream ended.');
    };

    window.stream = stream;
    console.info(stream);
    $localVideo.srcObject = stream;
    console.info($localVideo);
      // $localVideo.src = window.URL.createObjectURL(stream);
  }).catch(function (error) {
    console.error(error);
  })
});

var iceServers = {
  iceServers: [{
    'urls': [
      'stun:stun.l.google.com:19302'
    ]
  }]
};


$localInviteBtn.click(function () {
  peerConnection1 =  new RTCPeerConnection(iceServers);

  peerConnection1.onicecandidate = HandleICECandidateEvent;

  // Chrome still uses addStream() function
  // videoTracks.forEach(function (p1, p2, p3) {
  //   peerConnection1.addTrack(p1, $localVideo);
  // });
  peerConnection1.addStream(stream);

  peerConnection1.onnegotiationneeded = function () {
    peerConnection1.createOffer({
      iceRestart: true,
      voiceActivityDetection: true
    }).then(function (offer) {
      return peerConnection1.setLocalDescription(offer)
    }).then(function () {
      SendOfferAndAnswer(peerConnection1.localDescription);
    }).catch(function (error) {
      console.error(error);
    })
  }
});

function HandleVideoOffer(offerPack) {
  peerConnection1 = new RTCPeerConnection(iceServers);

  peerConnection1.onaddstream = HandleAddStreamEvent;
  // var sdp = offerPack.sdp;
  var sdp = new RTCSessionDescription(offerPack.sdp);
  var prevCaller = offerPack.caller;

  peerConnection1.setRemoteDescription(sdp).then(function () {
    return navigator.mediaDevices.getUserMedia(constraints);
  }).then(function (stream) {
    videoTracks = stream.getVideoTracks();

    window.stream = stream;
    $localVideo.srcObject = stream;

    // videoTracks.forEach(function (p1, p2, p3) {
    //   this.addTrack(p1, $localVideo);
    // });
    peerConnection1.addStream(stream);
  }).then(function () {
    return peerConnection1.createAnswer();
  }).then(function (answer) {
    return peerConnection1.setLocalDescription(answer);
  }).then(function () {
    SendOfferAndAnswer(peerConnection1.localDescription, prevCaller);
  }).catch(function (error) {
    console.error(error);
  })
}

function HandleVideoAnswer(answerPack) {
  // peerConnection1
  var sdp = new RTCSessionDescription(answerPack.sdp);

  peerConnection1.onaddstream = HandleAddStreamEvent;

  peerConnection1.setRemoteDescription(sdp)
    .catch(function (error) {
      console.error(error);
    });


}

function HandleICECandidateEvent(event) {
  if (event.candidate) {
    SendICECandidate(event.candidate);
  }
}

function HandleNewICECandidateMsg(candidatePack) {
  var candidate = new RTCIceCandidate(candidatePack.candidate);

  peerConnection1.addIceCandidate(candidate)
    .catch(function (error) {
      console.error(error);
    });
  console.log('A new ICE candidate has been added.')
  console.log('Candidate information: ' + JSON.stringify(candidatePack.candidate));
}

function HandleAddStreamEvent(event) {
  $remoteVideo.srcObject = event.stream;
}
