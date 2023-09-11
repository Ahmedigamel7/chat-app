const socket = io();
const friendReqsBtn = document.getElementById("friendResDropdown");
const friendReqs = document.getElementById("friendReqs");
const p = friendReqs.querySelector("p");
const a = friendReqs.querySelector("a");
const myId = document.getElementById("myId").value;
const username = document.getElementById('searchText')
const userList = document.getElementById("userList");

if(a){
     friendReqsBtn.classList.remove("btn-primary");
     friendReqsBtn.classList.add("btn-secondary");
}

socket.on("connect", () => {
     console.log("browser connected ", myId);
     socket.emit("joinNotifyRoom", myId);
     socket.emit("goOnline", myId);
});


socket.on("newFriendReq", (data) => {

     if (p) p.remove();
     friendReqs.innerHTML += `<li> <a class="dropdown-item" href="/users/${data._id}" 
                               style="text-align: center"> ${data.name} </a>
                            </li>`;
     friendReqsBtn.classList.remove("btn-primary");
     friendReqsBtn.classList.add("btn-secondary");
});

friendReqsBtn.onclick = () => {
     friendReqsBtn.classList.add("btn-primary");
     friendReqsBtn.classList.remove("btn-secondary");
};


// getting users by username 
username.addEventListener('input', (e) => {
     try {
          const userInput = e.target.value.trim();
          userList.innerHTML = "";
       
          if (userInput !== "") {
               const data = {userName:userInput,myId}
               socket.emit('getUserByUsername', data);
          }
     } catch (error) {
          console.error('Error in user input:', err);

     }


})

socket.on('userData', users => {
     try {
          userList.style = "display:block;"

          const div = document.createElement("div");
          users.forEach(user => {

               const userItem = document.createElement("li");
               const userLink = document.createElement("a");
               const userImg = document.createElement("img");
               const userName = document.createElement("span");
               userName.textContent = user.userName;
               userImg.src = `/images/${user.image}`
               userLink.href = `/users/${user._id}`;
               userLink.appendChild(userName)
               userItem.appendChild(userImg);
               userItem.appendChild(userLink);
               div.appendChild(userItem)
          });
          userList.appendChild(div);

     } catch (err) {
          console.error('Error fetching users:', err);
     }
})