//userId = myId
const socket=io()
const myId = document.getElementById("myId").value;

socket.emit("getOnlineFriends", myId);

socket.on("onlineFriends", (onlineFriends) => {
     const div = document.getElementById("onlineFriends");
     if (onlineFriends.length === 0)
          div.innerHTML = `<p class="alert alert-danger">No online friends</p>`;
     else {
          let html = `<div class="row">`;
          onlineFriends.forEach((friend) => {
               html += `
                         <div class="col col-12 col-md-6 col-lg-4 col-xl-3">
                          <div class="card" style="width: 16rem">
                              <img src="/images/${friend.image}" height="200" class="card-img-top" alt="..." />
                              <div class="card-body">
                              <h5 class="card-title">
                              <a style="text-decoration: none" href="/users/${friend._id}"> ${friend.name} </a>
                              </h5>
                              <a href='/chats/${friend.chatId}' class='btn btn-success'>Chat</a>
                              </div>
                          </div>
                         </div> `;
          });

          html += `</div>`;
          div.innerHTML = html;
     }
});
