const myId = document.getElementById("myId").value;
const myName = document.getElementById("myName").value;
const myImg = document.getElementById("myImg").value;
const userId = document.getElementById("userId").value;
const userName = document.getElementById("userName").value;
const userImg = document.getElementById("userImg").value;
const addBtn = document.getElementById("addBtn");

const data = { myId, myName, myImg, userId, userName, userImg };
addBtn.onclick = (e) => {
     e.preventDefault();
     socket.emit("sentFriendReq", data);
};

socket.on("reqSent", () => {
     addBtn.remove();
     document.getElementById("friends-form").innerHTML += `
     <input type="submit" class="red-button" value="Cancel" formaction="/friends/cancel" />
     `;
});
