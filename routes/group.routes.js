const { isAuth } = require("./guards/protect.routes");
const { Chat } = require("../models/chat.model");
const router = require("express").Router();

router.get("/", isAuth, async (req, res, next) => {
     try {
          const chatGroups = await Chat.find({ users: req.session.userId, 'group.name': { $exists: true } })

          // console.log(JSON.stringify(chatGroups, null, 2));
          res.render("groups", {
               isUser: req.session.userId || null,
               friendReqs: req.friendReqs || null,
               myId: req.session.userId,
               chatGroups
          });
     } catch (error) {
          next(error)
     }
});






module.exports = router;
