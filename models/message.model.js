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
