const { User } = require("../models/user.model");
const { isAuth } = require("./guards/protect.routes");
const { param, validationResult } = require("express-validator");
const router = require("express").Router();

router.get("/:id", isAuth, param("id").isMongoId(), async (req, res, next) => {
     try {
          if (!validationResult(req).isEmpty())
               return res.redirect("/not-found");
          else {
               const user = await User.findById(req.params.id);

               if (user) {
                    // res.location(`/users/${user.userName}`) ;
                    return res.render("profile", {
                         isUser: req.session.userId,
                         isOwner: String(user._id) === String(req.session.userId),
                         myId: req.session.userId,
                         myName: req.session.name,
                         myImg: req.session.img,
                         userId: user._id,
                         userName: user.userName,
                         userImg: user.image,
                         userEmail: user.email,
                         // isOnline: user.isOnline ? "online" : "offline",
                         isFriend: user.friends.find(
                              (friend) => String(friend._id) === String(req.session.userId)
                         ),
                         isReqSent: user.friendReqs.find(
                              (friend) => String(friend._id) === String(req.session.userId)
                         ),
                         isReqRecieved: user.sentReqs.find(
                              (friend) => String(friend._id) === String(req.session.userId)
                         ),
                         friendReqs: req.friendReqs || null,
                    });
               }
               else return res.redirect("/not-found");
          }
     } catch (error) {
          console.log(error);
          return next(error);
     }
});

module.exports = router;
