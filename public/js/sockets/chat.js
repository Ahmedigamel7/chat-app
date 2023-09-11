const socket = io();
const myId = document.getElementById("myId").value;
const chatId = document.getElementById("chatId").value;
const sendBtn = document.getElementById("sendBtn");
const message = document.getElementById("message");
const callBtn = document.getElementById("call");
const chatMessages = document.querySelector(".chat-messages");
let chatMessage = document.getElementById("chatMessage");
const videoContainer = document.getElementById("video-container");
const videoPlayer = document.getElementById("main-video");
// const openButton = document.getElementById("call");
const closeBtn = document.getElementById("close-video-btn");

chatMessages.scrollTop = chatMessages.scrollHeight;

function closeVideo() {
  console.log("video closed", peer.id);
  videoPlayer.srcObject = null;
  videoPlayer.pause();
  peer.disconnect();
  peer.destroy();
  videoContainer.classList.add("hidden");

  location.reload();

  // window.location = window.location;
}

// console.log(chatMessage);

socket.emit("joinChat", chatId);

sendBtn.onclick = () => {
  if (message.value.trim() !== "") {
    let content = message.value;
    socket.emit(
      "sendMessage",
      {
        chatId,
        content,
        sender: myId,
      },
      () => {
        message.value = ``;
      }
    );
  }
};
// const dt = new Date();
// console.log(dt.getTimezoneOffset())
socket.on("newMessage", (msg) => {
  // console.log("newMSSSG", msg.sender, myId);
  if (String(msg.senderId) !== myId) {
//     console.log("notme", msg.content);

    chatMessage.innerHTML += `<div id="messageReceived" class="message received">
          <div class="message-header">
          <img src="/images/${msg.image}" alt="friend-image" /> 
          <span>${msg.time}</span>    
          </div>
          <p> ${msg.content} </p>
          </div> `;
  } else if (String(msg.senderId) === myId) {
//     console.log("me", msg.content);
    chatMessage.innerHTML += `<div id="messageSent" class="message sent">
          <div class="message-header">
          <img src="/images/${msg.image}" alt="friend-image" /> 
          <span>${msg.time}</span>    
          </div>
          <p> ${msg.content} </p>
          </div> `;
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
//"id", {
//      host: "localhost",
//      port: 443,
//      secure: true,
// }

// function showCall(stream) {
//      let video = document.createElement("video");
//      video.srcObject = stream;
//      document.body.append(video);
//      video.play();
// }
let peer = new Peer();
let peerId = null;
peer.on("open", (id) => {
  peerId = id;
  console.log("open my id", id);
});

callBtn.onclick = () => {
  socket.emit("reqPeerId", chatId);
};

socket.on("getPeerId", () => {
  socket.emit("sendPeerId", {
    chatId,
    peerId,
  });
});

socket.on("recievedPeerId", (id) => {
  console.log("id", id);

  navigator.mediaDevices
    .getUserMedia({ audio: true, video: true })
    .then((stream) => {
      const call = peer.call(id, stream);

      call.on("stream", function (remoteStream) {
        videoContainer.classList.remove("hidden");
        videoPlayer.srcObject = remoteStream;
      });
      call.on("close", () => {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      });
    })
    .catch((err) => console.error(err));
});

closeBtn.onclick = closeVideo;

peer.on("call", (call) => {
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: true })
    .then((stream) => {
      call.answer(stream);

      call.on("stream", function (remoteStream) {
        videoContainer.classList.remove("hidden");
        videoPlayer.srcObject = remoteStream;
      });
      call.on("close", () => {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      });
    })
    .catch((err) => console.error(err));
});

socket.on("closeVideo", () => closeVideo());
peer.on("close", () => {
  console.log("closed");
  socket.emit("videoClosed", chatId);
});

let isDragging = false;
let dragStartX, dragStartY;

// Function to handle mouse down or touch start event on the video container
function handleStart(event) {
  isDragging = true;
  if (event.type === "mousedown") {
    dragStartX = event.clientX - videoContainer.offsetLeft;
    dragStartY = event.clientY - videoContainer.offsetTop;
  } else if (event.type === "touchstart") {
    dragStartX = event.touches[0].clientX - videoContainer.offsetLeft;
    dragStartY = event.touches[0].clientY - videoContainer.offsetTop;
  }
}

// Function to handle mouse move or touch move event on the document
function handleMove(event) {
  if (isDragging) {
    event.preventDefault();
    if (event.type === "mousemove") {
      videoContainer.style.left = event.clientX - dragStartX + "px";
      videoContainer.style.top = event.clientY - dragStartY + "px";
    } else if (event.type === "touchmove") {
      videoContainer.style.left = event.touches[0].clientX - dragStartX + "px";
      videoContainer.style.top = event.touches[0].clientY - dragStartY + "px";
    }
  }
}

// Function to handle mouse up or touch end event on the document
function handleEnd(event) {
  isDragging = false;
}

// Add event listeners to handle the dragging behavior
videoContainer.addEventListener("mousedown", handleStart);
videoContainer.addEventListener("touchstart", handleStart);
document.addEventListener("mousemove", handleMove);
document.addEventListener("touchmove", handleMove);
document.addEventListener("mouseup", handleEnd);
document.addEventListener("touchend", handleEnd);
