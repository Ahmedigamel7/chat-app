const mongoose = require("mongoose");
const { Chat } = require("./chat.model");
const { extractTime } = require("../helpers/time-formats");
const Schema = mongoose.Schema;

const messagesSchema = new Schema(
     {
          chatId: { type: Schema.Types.ObjectId, ref: "Chat" },
          content: String,
          sender: { type: Schema.Types.ObjectId, ref: "User" },
     },
     { timestamps: true }
);
const Message = mongoose.model("Message", messagesSchema);

async function getMessages(chaId) {
     try {
          console.log("getmes ChatId", chaId);
          // const newChat = new Message({
          //      chat: "64135cfcce20547eaa41e9dd",
          //      content: "hell",
          //      sender: "64135ccdce20547eaa41e9c3",
          // });
          // await newChat.save();
          const messages = await Message.findById( chaId ).populate({
               path: "chatId", //field
               model: "Chat", //model
               populate: {
                    path: "users",
                    model: "User",
                    select: "userName image",
               },
          });

          return messages;
     } catch (error) {
          console.error(error);
          throw new Error(error);
     }
}
async function newMessage(msg) {
     try {
          console.log("newMsg", msg);
          const newMsg = new Message(msg);
          const msgDoc =await newMsg.save();
          const result= await msgDoc.populate({  path: "sender", model: "User", select: "image" })
          result['time']= extractTime(result.updatedAt)
          return {chatId:msg.chatId, image:result.sender.image,content:msg.content, senderId:result.sender._id, time:result.time};
     
     } catch (error) {
          throw new Error(error);
     }
}
module.exports = { Message, getMessages, newMessage };
