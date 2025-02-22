"use strict";

const socket = io.connect();
const chatMessages = document.querySelector("#chat-messages");
const chatInput = document.querySelector("#chat-input");
const sendChatBtn = document.querySelector("#send-chat-btn");
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
const displayChatMessage = (message, senderName) => {
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message");
  messageElement.innerHTML = `<strong>${senderName}:</strong> ${message}`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the latest message
};

// Send chat message
sendChatBtn.addEventListener("click", () => {
  const message = chatInput.value.trim();
  if (message) {
    webrtc.sendChatMessage(message);
    chatInput.value = ""; // Clear the input field
  }
});

// Handle incoming chat messages
webrtc.addEventListener("chatMessage", (e) => {
  const { message, senderName } = e.detail;
  displayChatMessage(message, senderName);
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

    // Update the icon inside the button
    const icon = muteBtn.querySelector(".icon");
    icon.innerHTML = isAudioMuted
      ? '<i class="fa-solid fa-microphone-slash"></i>'
      : '<i class="fa-solid fa-microphone-lines"></i>';

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

    // Use innerHTML instead of textContent to render Font Awesome icons
    cameraBtn.querySelector(".icon").innerHTML = isVideoOff
      ? '<i class="fa-solid fa-video-slash"></i>'
      : '<i class="fa-solid fa-video"></i>';

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

// Add these near your mute/camera button declarations
const recordBtn = document.querySelector("#recordBtn");
const stopRecordBtn = document.querySelector("#stopRecordBtn");
let isRecording = false;

// Add these event listeners
recordBtn.addEventListener("click", () => {
  webrtc.startRecording();
  isRecording = true;
  recordBtn.disabled = true;
  stopRecordBtn.disabled = false;
  notify("Recording started...");
});

stopRecordBtn.addEventListener("click", () => {
  webrtc.stopRecording();
  isRecording = false;
  recordBtn.disabled = false;
  stopRecordBtn.disabled = true;
  notify("Recording stopped");
});

// Handle the recorded audio
webrtc.addEventListener("recordingComplete", (e) => {
  const audioBlob = e.detail.audioBlob;
  const audioUrl = URL.createObjectURL(audioBlob);

  // Create downloadable link
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = audioUrl;
  a.download = `recording-${Date.now()}.webm`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(audioUrl);

  notify("Recording saved!");
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

// Add this to your main.js file
const localVideoContainer = document.querySelector("#localVideo-container");

let isDragging = false;
let offsetX, offsetY;

// Mouse down event to start dragging
localVideoContainer.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - localVideoContainer.getBoundingClientRect().left;
  offsetY = e.clientY - localVideoContainer.getBoundingClientRect().top;
  localVideoContainer.style.cursor = "grabbing";
});

// Mouse move event to drag the window
document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

    // Ensure the window stays within the viewport
    const maxX = window.innerWidth - localVideoContainer.offsetWidth;
    const maxY = window.innerHeight - localVideoContainer.offsetHeight;

    localVideoContainer.style.left = `${Math.min(Math.max(x, 0), maxX)}px`;
    localVideoContainer.style.top = `${Math.min(Math.max(y, 0), maxY)}px`;
  }
});

// Mouse up event to stop dragging
document.addEventListener("mouseup", () => {
  isDragging = false;
  localVideoContainer.style.cursor = "grab";
});

const screenShareBtn = document.querySelector("#screenShareBtn");
let screenStream = null;

screenShareBtn.addEventListener("click", async () => {
  try {
    if (!screenStream) {
      // Start screen sharing
      screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          displaySurface: "window",
        },
        audio: false,
      });

      // Replace local video with screen share
      localVideo.srcObject = screenStream;

      // Update WebRTC with screen stream
      webrtc.replaceVideoTrack(screenStream.getVideoTracks()[0]);

      screenShareBtn.classList.add("active");
      notify("Screen sharing started");

      // Handle when user stops sharing via browser UI
      screenStream.getVideoTracks()[0].addEventListener("ended", () => {
        stopScreenShare();
      });
    } else {
      stopScreenShare();
    }
  } catch (err) {
    console.error("Screen share error:", err);
    notify("Failed to start screen sharing");
  }
});

function stopScreenShare() {
  if (screenStream) {
    screenStream.getTracks().forEach((track) => track.stop());
    screenStream = null;
  }

  // Restore camera stream
  const cameraStream = webrtc.localStream;
  localVideo.srcObject = cameraStream;

  // Restore original video track
  if (cameraStream) {
    webrtc.replaceVideoTrack(cameraStream.getVideoTracks()[0]);
  }

  screenShareBtn.classList.remove("active");
  notify("Screen sharing stopped");
}

webrtc.addEventListener("newUser", (e) => {
  const { socketId, stream, userName, isScreen } = e.detail;

  const videoContainer = document.createElement("div");
  videoContainer.className = `grid-item ${
    isScreen ? "screen-share" : "camera"
  }`;
  videoContainer.id = socketId;

  if (isScreen) {
    videoContainer.innerHTML = `
      <div class="screen-label">${userName}'s Screen</div>
      <video autoplay playsinline></video>
    `;
  } else {
    videoContainer.innerHTML = `
      <p>${userName}</p>
      <video autoplay playsinline muted></video>
    `;
  }

  videoContainer.querySelector("video").srcObject = stream;
  videoGrid.appendChild(videoContainer);
});
