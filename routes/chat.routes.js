const { isAuth } = require("./guards/protect.routes");
const { body, validationResult, param } = require("express-validator");
const { getUsersAndMessages, Chat } = require("../models/chat.model");
const { extractTime } = require("../helpers/time-formats");
const { User } = require("../models/user.model");
const router = require("express").Router();

router.get('/not-found', function (req, res, next) {

     return res.status(404).render("404", {
          friendReqs: req.friendReqs || null,
          isUser: req.session.userId || null,
     });
});

router.get("/chat-group", isAuth, async (req, res, next) => {
     const { friends } = await User.getFriends(req.session.userId);
     try {
          res.render("new-group", {
               isUser: req.session.userId || null,
               friendReqs: req.friendReqs || null,
               friends,
          });
     } catch (error) {
          next(error);
     }
});

router.post(
     "/group",
     isAuth,
     [
          body("name").notEmpty().isString().trim(),
          body("users").custom((value) => {

               if (!(Array.isArray(value) ) && typeof value !== "string") throw new Error("not string or array");
               if (
                    Array.isArray(value) &&
                    value.some((id) => !/^[0-9a-fA-F]{24}$/.test(id))
               ) {
                    console.log("array but not ids");
                    throw new Error("not valid array");
               } else if (
                    typeof value === "string" &&
                    !/^[0-9a-fA-F]{24}$/.test(value)
               ) {
                    console.log("string but not id");
                    throw new Error("not valid string");

               } else return true;
          }),
     ],
     async (req, res, next) => {
          try {
               if (!validationResult(req).isEmpty()) 
                    return res.redirect("/chats/not-found");

               let { name, users } = req.body;

               if(typeof users === "string") users = [users];
                    
               await Chat.create({
                    users: [req.session.userId, ...users],
                    group: {
                         name: name,
                         image: "group-default.png"
                    },
                    admins: [req.session.userId]
               });
               return res.redirect("/groups");
          } catch (error) {
               next(error);
          }
     }
);



router.post(
     "/:chatId/leave",
     isAuth,
     [param("chatId").notEmpty().isString().isMongoId(), body("myId").notEmpty().isString().isMongoId()],
     async (req, res, next) => {
          try {
               if (!validationResult(req).isEmpty())
                    return res.redirect("/chats/not-found");

               const { chatId } = req.params;
               const { myId } = req.body;


               const updatedChat = await Chat.findByIdAndUpdate(
                    chatId,
                    { $pull: { users: myId, admins: myId } },
                    { new: true }
               );

               if (updatedChat)
                    return res.redirect("/chat-group");
               return res.redirect("/chats/not-found");
          } catch (error) {
               next(error);
          }
     }
);

router.get("/:id", isAuth, param('id').isMongoId(), async (req, res, next) => {
     try {
          if (!validationResult(req).isEmpty()) return res.redirect("/chats/not-found");
          const { id } = req.params;
          const chatData = await getUsersAndMessages(id);
          // console.log(JSON.stringify(chatData, null, 4));

          if (chatData) {
               if (chatData?.messages?.length > 0)
                    for (let message of chatData?.messages)
                         message['time'] = extractTime(message.updatedAt);

               if (chatData?.group?.name) {
                    return res.render("chat-group", {
                         chatId: chatData._id,
                         isUser: req?.session?.userId || null,
                         friendReqs: req?.friendReqs || null,
                         messages: chatData?.messages,
                         myId: req?.session?.userId,
                         groupName: chatData?.group?.name,
                         groupImage: chatData?.group?.image
                    })
               }
               else {
                    const friendData = chatData?.users.find(
                         (user) => String(user._id) !== String(req.session.userId));

                    return res.render("chat", {
                         chatId: chatData._id,
                         isUser: req.session.userId || null,
                         friendReqs: req.friendReqs || null,
                         messages: chatData.messages,
                         friendData,
                         myId: req.session.userId,
                    });
               }
          }
          return res.redirect("/chats/not-found")
     } catch (error) {
          return next(error);
     }
});

module.exports = router;
