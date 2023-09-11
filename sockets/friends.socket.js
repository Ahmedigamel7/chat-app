const { sendReqs, getOnlineFriends } = require("../models/user.model");

exports.manageFriends = (io) => {
     io.on("connection", (socket) => {
          socket.on("sentFriendReq", (data) => {
               // console.log("sent", data);
               sendReqs(data)
                    .then(() => {
                         socket.emit("reqSent");
                         io.to(data.userId).emit("newFriendReq", {
                              name: data.myName,
                              _id: data.myId,
                         });
                    })
                    .catch((err) => {
                         socket.emit("reqFailed");
                    });
          });
          socket.on("getOnlineFriends", (myId) => {
               getOnlineFriends(myId)
                    .then((data) => {
                         // console.log("friends", data.friends);
                         const onlineFriends = data.friends.filter(
                              (friend) => io.onlineUsers[friend._id]
                         );
                         // console.log("online", onlineFriends);
                         socket.emit("onlineFriends", onlineFriends);
                    })
                    .catch((err) => {
                         console.log(err);
                    });
          });
     });
};
