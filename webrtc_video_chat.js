/**
 * Created by Haoyan.Li on 2017/3/29.
 */
'use strict';

var constraints = {
  video: true,
  audio: true,
};


var $localVideo = $('video.video#video_local')[0],
    $remoteVideo = $('video.video#video_remote')[0];

var $localCtrlBtn = $('button.btn#local_video_ctrl_btn'),
    // $remoteBtn = $('button.btn#remote_video_ctrl_btn'),
    $localInviteBtn = $('button.btn#local_video_invite_btn');
    // $remoteInviteBtn = $('button.btn#remote_video_invite_btn');

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
  // iceServers: [
  //     {url:'stun:stun01.sipphone.com'},
  //     {url:'stun:stun.ekiga.net'},
  //     {url:'stun:stun.fwdnet.net'},
  //     {url:'stun:stun.ideasip.com'},
  //     {url:'stun:stun.iptel.org'},
  //     {url:'stun:stun.rixtelecom.se'},
  //     {url:'stun:stun.schlund.de'},
  //     {url:'stun:stun.l.google.com:19302'},
  //     {url:'stun:stun1.l.google.com:19302'},
  //     {url:'stun:stun2.l.google.com:19302'},
  //     {url:'stun:stun3.l.google.com:19302'},
  //     {url:'stun:stun4.l.google.com:19302'},
  //     {url:'stun:stunserver.org'},
  //     {url:'stun:stun.softjoys.com'},
  //     {url:'stun:stun.voiparound.com'},
  //     {url:'stun:stun.voipbuster.com'},
  //     {url:'stun:stun.voipstunt.com'},
  //     {url:'stun:stun.voxgratia.org'},
  //     {url:'stun:stun.xten.com'},
  //     {
  //       url: 'turn:numb.viagenie.ca',
  //       credential: 'muazkh',
  //       username: 'webrtc@live.com'
  //     },
  //     {
  //       url: 'turn:192.158.29.39:3478?transport=udp',
  //       credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  //       username: '28224511:1379330808'
  //     },
  //     {
  //       url: 'turn:192.158.29.39:3478?transport=tcp',
  //       credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
  //       username: '28224511:1379330808'
  //     }
  // ]
};

var options = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
  iceRestart: true,
  voiceActivityDetection: true
};

$localInviteBtn.click(function () {
  peerConnection1 = new RTCPeerConnection(iceServers);

  peerConnection1.onicecandidate = HandleICECandidateEvent;

  // Chrome still uses addStream() function
  // videoTracks.forEach(function (p1, p2, p3) {
  //   peerConnection1.addTrack(p1, $localVideo);
  // });
  peerConnection1.addStream(stream);

  peerConnection1.onnegotiationneeded = function () {
    peerConnection1.createOffer(options)
      .then(function (offer) {
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
  peerConnection1.onicecandidate = HandleICECandidateEvent;

  // var sdp = offerPack.sdp;
  var sdp = new RTCSessionDescription(offerPack.sdp);
  var prevCaller = offerPack.caller;

  peerConnection1.addStream(stream);

  // peerConnection1.setRemoteDescription(sdp).then(function () {
  //   return navigator.mediaDevices.getUserMedia(constraints);
  // }).then(function (stream) {
  //   videoTracks = stream.getVideoTracks();
  //
  //   window.stream = stream;
  //   $localVideo.srcObject = stream;
  //
  //   // videoTracks.forEach(function (p1, p2, p3) {
  //   //   this.addTrack(p1, $localVideo);
  //   // });
  //   peerConnection1.addStream(stream);
  // })
  peerConnection1.setRemoteDescription(sdp).then(function () {
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
  console.log('A new ICE candidate has been added.');
  console.log('Candidate information: ' +
    JSON.stringify(candidatePack.candidate));
}

function HandleAddStreamEvent(event) {
  $remoteVideo.srcObject = event.stream;
}

function HandleICEConnectionStateEvent(event) {
  console.info('ICE Connection State Change to: ' +
    peerConnection1.iceConnectionState);

  switch (peerConnection1.iceConnectionState) {
    case "closed":
    case "failed":
    case "disconnected":

  }
}