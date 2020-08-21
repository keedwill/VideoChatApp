const socket = io("/");

const videoGrid = document.getElementById("video-grid");
// create video element
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3000",
});

let myVidStream;

// get video and audio upload from chrome
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVidStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    //listen on user-connected
    socket.on("user-connected", (userId) => {
      connectNewUser(userId, stream);
    });
  });

//generate id automatically on a new conection
peer.on("open", (id) => {
  socket.emit("join-room", roomId, id);
});

const connectNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  // after loading all the data for the stream then play the video
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

let text = $("input");
$("html").keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    console.log(text.val());

    socket.emit("message", text.val());
    text.val("");
  }
});

socket.on("createMessage", (message) => {
  $("ul").append(`<li class="message"><b>user</b><br>${message}</li>`);
  scrollToBottom();
});

const scrollToBottom = () => {
  let d = $(".chat-window");
  d.scrollTop(d.prop("scrollHeight"));
};


//mute our video
const muteUnmute = () => {
  const enabled = myVidStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVidStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVidStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton=()=>{
  const html = `<i class="fas fa-microphone"></i>
  <span>Mute</span>`
  document.querySelector('.mute-button').innerHTML = html
}

const setUnmuteButton=()=>{
  const html = `<i class="unmute fas fa-microphone-slash"></i>
  <span>Unmute</span>`
  document.querySelector('.mute-button').innerHTML = html
}

//stop video

const playStop=()=>{
  const enabled = myVidStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVidStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVidStream.getVideoTracks()[0].enabled = true;
  }
}

const setStopVideo=()=>{
  const html = `<i class=" fas fa-video-slash"></i>
  <span>Stop Video</span>`
  document.querySelector('.video-button').innerHTML = html
}




const setPlayVideo=()=>{
  const html = `<i class="stop fas fa-video-slash"></i>
  <span>Play Video</span>`
  document.querySelector('.video-button').innerHTML = html
}