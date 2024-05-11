const socket = io();
const myId = document.getElementById("myId").value;

socket.on("connect", () => {
     console.log("browser connected ", myId);
     socket.emit("joinNotifyRoom", myId);
     socket.emit("goOnline", myId);
});
socket.on("disconnect", () => { console.log("browser disconnected ", myId); });
socket.on('error', (err) => { console.log('socket err',err) })

import { handle_friend_reqs } from "./funcs.js";
handle_friend_reqs(socket)



import { get_users_by_username } from "./funcs.js";

get_users_by_username(socket, myId)