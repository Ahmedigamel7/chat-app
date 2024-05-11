exports.init = (io, socket) => {
     socket.on("goOnline", (id) => {
          io.onlineUsers[id] = true;
     });
     socket.on("disconnect", (id) => {
          io.onlineUsers[id] = false;
     });
     socket.on("joinNotifyRoom", (id) => {
          socket.join(id);
     });
};
