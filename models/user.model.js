const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const userSchema = new Schema(
     {
          userName: {
               type: String,
               required: true,
               unique: true,
               trim: true,
          },
          email: {
               type: String,
               required: true,
          },
          password: {
               type: String,
               required: true,
          },
          resetPasswordToken: String,
          resetTokenExpiration: Number
          , image: {
               type: String,
               default: "my-profile.png",
          },
          friends: {
               type: [
                    {
                         name: String,
                         image: String,
                         _id: ObjectId,
                         chatId: ObjectId,
                    },
               ],
              default: ()=>[],
          },
          friendReqs: {
               type: [
                    { name: String, image: String, _id: ObjectId },
               ],
              default: ()=>[],
          },
          sentReqs: {
               type: [
                    { name: String, image: String, _id: ObjectId },
               ],
              default: ()=>[],
          },
     },
     {
          timestamps: true,
          statics: {
               async getFriends(userId) {
                    try {
                         return await this.findById(userId, { friends: true });
                    } catch {
                         throw error;
                    }
               }
          },
          methods: {
               hash_password: async function (newPass) {
                    try {
                         // console.log(this);
                         const password = newPass || this.password
                         const hashed = await bcrypt.hash(password, 13);
                         this.password = hashed;
                         await this.save()
                         return this;
                    } catch (error) {
                         throw error
                    }
               },
          },
     }
);


async function sendReqs(data) {
     try {
          await User.updateOne(
               { _id: data.userId },
               {
                    $push: {
                         friendReqs: {
                              _id: new ObjectId(data.myId),
                              name: data.myName,
                              image: data.myImg,
                         },
                    },
               }
          );

          await User.updateOne(
               { _id: data.myId },
               {
                    $push: {
                         sentReqs: {
                              _id: new ObjectId(data.userId),
                              name: data.userName,
                              image: data.userImg,
                         },
                    },
               }
          );
          // return res.redirect("/profile/" + data.userId);
          return;
     } catch (error) {
          console.log(error);
          return next(error);
     }
}

async function getOnlineFriends(id) {
     try {
          return await User.findOne({ _id: id }, { friends: true });
     } catch (error) {
          console.log(error);
          return next(error);
     }
}
async function search_username(data) {
     try {     
          return await User.find({ userName: { $regex: data.userName,$options: 'i' }, _id: { $ne: data.myId } })

     } catch (error) {
          console.log(error)
     }
}

const User = mongoose.model("User", userSchema);

// const user = new User({
//      userName: "ahmedgamel",
//      email: "ahmed@yahoo.com",
//      password: "$2b$13$tvMDZBkdwSrLMrkJCdpNzuk47JlcNaTHKdEGt6EqR5s1/5ZG8tk2C",
//      image: "my-profile.png",
// });
// User.insertMany([
//      {
//           userName: "ahmedgamel",
//           email: "ahmed@yahoo.com",
//           password:
//                "$2b$13$tvMDZBkdwSrLMrkJCdpNzuk47JlcNaTHKdEGt6EqR5s1/5ZG8tk2C",
//           image: "my-profile.png",
//      },
//      {
//           userName: "ahmedibraim",
//           email: "www@oulook.com",
//           password:
//                "$2b$13$KtPxhMt3fLhlxqCv5Br6OOgZ74TUhPwIyoJsOTNEghGrOQGRTSg/q",
//           image: "my-profile.png",
//      },
// ]).then((p) => console.log(p));
// user.save().then((p) );
module.exports = { User, sendReqs, getOnlineFriends, search_username };
