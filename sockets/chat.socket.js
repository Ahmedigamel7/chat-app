const { newMessage } = require("../models/message.model");

exports.manageChat = (io,socket) => {
          socket.on("joinChat", (chatId) => {
               console.log('socketId',socket.id )
               socket.join(chatId);
          });
          socket.on("sendMessage", (msg, deleteMsg) => {
               
               newMessage(msg)
                    .then((newMsg) => {
                         io.to(msg.chatId).emit("newMessage", newMsg);
                         deleteMsg();
                    })
                    .catch((err) => {
                         console.log(err);
                    });
          });
          socket.on("reqPeerId", (chatId) => {
               socket.broadcast.to(chatId).emit("getPeerId");
          });
          socket.on("sendPeerId", (data) => {
               socket.broadcast
                    .to(data.chatId)
                    .emit("recievedPeerId", data.peerId);
          });
          socket.on("videoClosed", (chatId) => {
               socket.broadcast.to(chatId).emit("closeVideo");
          });
};
