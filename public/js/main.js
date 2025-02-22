"use strict";

// const socket = io.connect();

const localVideo = document.querySelector("#localVideo-container video");
const videoGrid = document.querySelector("#videoGrid");
const notification = document.querySelector("#notification");
const notify = (message) => {
  notification.innerHTML = message;
};

const userNameInput = document.querySelector("#userName");
const roomInput = document.querySelector("#roomId");
const joinBtn = document.querySelector("#joinBtn");
const leaveBtn = document.querySelector("#leaveBtn");

const pcConfig = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
      ],
    },
    {
      urls: "turn:numb.viagenie.ca",
      credential: "muazkh",
      username: "webrtc@live.com",
    },
    {
      urls: "turn:numb.viagenie.ca",
      credential: "muazkh",
      username: "webrtc@live.com",
    },
    {
      urls: "turn:192.158.29.39:3478?transport=udp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },
  ],
};

/**
 * Initialize webrtc
 */
const webrtc = new Webrtc(socket, pcConfig, {
  log: true,
  warn: true,
  error: true,
});

/**
 * Create or join a room
 */
joinBtn.addEventListener("click", () => {
  const room = roomInput.value;
  const userName = userNameInput.value;

  if (!room) {
    notify("Room ID not provided");
    return;
  }

  if (!userName) {
    notify("Please enter your name");
    return;
  }

  webrtc.joinRoom(room, userName); // Pass the user's name to the joinRoom function
});

const setTitle = (status, e) => {
  const room = e.detail.roomId;

  console.log(`Room ${room} was ${status}`);

  notify(`Room ${room} was ${status}`);
  document.querySelector("h1").textContent = `Room: ${room}`;
  webrtc.gotStream();
};
webrtc.addEventListener("createdRoom", setTitle.bind(this, "created"));
webrtc.addEventListener("joinedRoom", setTitle.bind(this, "joined"));

/**
 * Leave the room
 */
leaveBtn.addEventListener("click", () => {
  webrtc.leaveRoom();
});
webrtc.addEventListener("leftRoom", (e) => {
  const room = e.detail.roomId;
  document.querySelector("h1").textContent = "";
  notify(`Left the room ${room}`);
});

/**
 * Handle media controls
 */
const muteBtn = document.querySelector("#muteBtn");
const cameraBtn = document.querySelector("#cameraBtn");
let isAudioMuted = false;
let isVideoOff = false;

muteBtn.addEventListener("click", () => {
  if (!webrtc.localStream) return;

  const audioTrack = webrtc.localStream.getAudioTracks()[0];
  if (audioTrack) {
    isAudioMuted = !isAudioMuted;
    audioTrack.enabled = !isAudioMuted;
    muteBtn.classList.toggle("muted");
    muteBtn.querySelector(".icon").textContent = isAudioMuted ? "🔇" : "🎤";
    notify(isAudioMuted ? "Audio muted" : "Audio unmuted");
  }
});

cameraBtn.addEventListener("click", () => {
  if (!webrtc.localStream) return;

  const videoTrack = webrtc.localStream.getVideoTracks()[0];
  if (videoTrack) {
    isVideoOff = !isVideoOff;
    videoTrack.enabled = !isVideoOff;
    cameraBtn.classList.toggle("muted");
    cameraBtn.querySelector(".icon").textContent = isVideoOff ? "🚫" : "📹";
    notify(isVideoOff ? "Camera turned off" : "Camera turned on");
  }
});

// Reset controls when leaving room
webrtc.addEventListener("leftRoom", (e) => {
  const room = e.detail.roomId;
  document.querySelector("h1").textContent = "";
  notify(`Left the room ${room}`);

  // Reset media controls
  isAudioMuted = false;
  isVideoOff = false;
  muteBtn.classList.remove("muted");
  cameraBtn.classList.remove("muted");
  muteBtn.querySelector(".icon").textContent = "🎤";
  cameraBtn.querySelector(".icon").textContent = "📹";
});

// Get local media stream
webrtc
  .getLocalStream(true, { width: 640, height: 480 })
  .then((stream) => (localVideo.srcObject = stream));

webrtc.addEventListener("kicked", () => {
  document.querySelector("h1").textContent = "You were kicked out";
  videoGrid.innerHTML = "";
});

webrtc.addEventListener("userLeave", (e) => {
  console.log(`user ${e.detail.socketId} left room`);
});

/**
 * Handle new user connection
 */
webrtc.addEventListener("newUser", (e) => {
  const socketId = e.detail.socketId;
  const stream = e.detail.stream;
  const userName = e.detail.userName; // Get the user's name

  const videoContainer = document.createElement("div");
  videoContainer.setAttribute("class", "grid-item");
  videoContainer.setAttribute("id", socketId);

  const video = document.createElement("video");
  video.setAttribute("autoplay", true);
  video.setAttribute("muted", true); // set to false
  video.setAttribute("playsinline", true);
  video.srcObject = stream;

  const p = document.createElement("p");
  p.textContent = userName; // Display the user's name instead of socketId

  videoContainer.append(p);
  videoContainer.append(video);

  // If user is admin add kick buttons
  if (webrtc.isAdmin) {
    const kickBtn = document.createElement("button");
    kickBtn.setAttribute("class", "kick_btn");
    kickBtn.textContent = "Kick";

    kickBtn.addEventListener("click", () => {
      webrtc.kickUser(socketId);
    });

    videoContainer.append(kickBtn);
  }
  videoGrid.append(videoContainer);
});

/**
 * Handle user got removed
 */
webrtc.addEventListener("removeUser", (e) => {
  const socketId = e.detail.socketId;
  if (!socketId) {
    // remove all remote stream elements
    videoGrid.innerHTML = "";
    return;
  }
  document.getElementById(socketId).remove();
});

/**
 * Handle errors
 */
webrtc.addEventListener("error", (e) => {
  const error = e.detail.error;
  console.error(error);

  notify(error);
});

/**
 * Handle notifications
 */
webrtc.addEventListener("notification", (e) => {
  const notif = e.detail.notification;
  console.log(notif);

  notify(notif);
});

// ============================
// Whiteboard Functionality
// ============================

// Initialize Fabric.js canvas
// const canvas = new fabric.Canvas("whiteboard", {
//   isDrawingMode: true, // Enable drawing mode
// });

// let isDrawing = false;

// Listen for drawing events on the canvas
canvas.on("mouse:down", (options) => {
  isDrawing = true;
  const pointer = canvas.getPointer(options.e);
  const data = {
    type: "start",
    x: pointer.x,
    y: pointer.y,
  };
  webrtc.sendDrawData(data); // Send drawing data to the server
});

canvas.on("mouse:move", (options) => {
  if (isDrawing) {
    const pointer = canvas.getPointer(options.e);
    const data = {
      type: "draw",
      x: pointer.x,
      y: pointer.y,
    };
    webrtc.sendDrawData(data); // Send drawing data to the server
  }
});

canvas.on("mouse:up", () => {
  isDrawing = false;
  const data = {
    type: "stop",
  };
  webrtc.sendDrawData(data); // Send drawing data to the server
});

// Handle drawing data from the server
webrtc.addEventListener("draw", (e) => {
  const data = e.detail;

  switch (data.type) {
    case "start":
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.onMouseDown(new fabric.Point(data.x, data.y));
      break;
    case "draw":
      canvas.freeDrawingBrush.onMouseMove(new fabric.Point(data.x, data.y));
      break;
    case "stop":
      canvas.freeDrawingBrush.onMouseUp();
      break;
  }
});