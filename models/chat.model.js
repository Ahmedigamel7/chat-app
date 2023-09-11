const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const Schema = mongoose.Schema;
const chatSchema = new Schema(
     {
          users: { type: [{ type: ObjectId, ref: "User" }], default: () => [] },
          media: { type: [String], default: () => [] },
          admins: { type: [{ type: ObjectId, default: () => "" }], default: () => [] },
          group: {
               type: {
                    name: { type: String, default: ()=> ""},
                    image: { type: String, default: () => 'group-default.png' },

               }, default: () => { }
          }
     },
     {
          timestamps: true,
          toJSON: { virtuals: true },
          toObject: { virtuals: true },
     }
);

chatSchema.virtual('messages', {
     ref: 'Message',
     localField: '_id',
     foreignField: 'chatId'
})

const Chat = mongoose.model("Chat", chatSchema);


async function getUsersAndMessages(chatId) {
     try {

          const data = await Chat.findById(chatId)
               .populate({
                    path: "messages",
                    model: "Message",
                    select: "sender content updatedAt",
                    options: { sort: { updatedAt: 1 } } 
                    ,populate:{
                         path: 'sender',
                         model: 'User',
                         select: 'userName image'
                    }
               })
               .populate({
                    path: "users",
                    model: "User",
                    select: "userName image",
               })
          // console.log("New data", data, "\n");

          return data;
     } catch (error) {
          console.error(error);
     }
}
module.exports = { Chat, getUsersAndMessages };
