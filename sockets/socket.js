exports.init = (io) => {
     io.on("connection", (socket) => {
          // console.log("new user connected");
          socket.on("disconnect", () => {
               console.log("disconnected");
          });
          socket.on("joinNotifyRoom", (id) => {
               socket.join(id);
               // console.log("joined", id);
          });
          socket.on("goOnline", (id) => {
               io.onlineUsers[id] = true;
               // console.log("online", io.onlineUsers);
               socket.on("disconnect", () => {
                    io.onlineUsers[id] = false;
                    // console.log("offline", io.onlineUsers);
               });
          });
     });
};
