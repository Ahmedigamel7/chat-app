const { ObjectId } = require("mongodb");
const { User } = require("../models/user.model");
const { isAuth } = require("./guards/protect.routes");
const { param, validationResult } = require("express-validator");
const router = require("express").Router();

// router.get("/", isAuth, (req, res, next) => {
//      res.redirect("/profile/" + req.session.userId);
// });

// router.get('/:username', async (req, res, next) => {
//      try {
//           const { username } = req.params;
//           console.log(username, 'hereeeeeeeeee')
//           const user = await User.findOne({ userName: username })
//           console.log(user)
//           if (!user)
//                return next()
//           return res.render('profile', {
//                isUser: req.session.userId,
//                isOwner: String(user._id) === String(req.session.userId),
//                myId: req.session.userId,
//                myName: req.session.name,
//                myImg: req.session.img,
//                userId: user._id,
//                userName: user.userName,
//                userImg: user.image,
//                userEmail: user.email,
//                isFriend: user.friends && user.friends.find(
//                     (friend) => String(friend._id) === String(req.session.userId)
//                ),
//                isReqSent: user.friendReqs && user.friendReqs?.find(
//                     (friend) => String(friend._id) === String(req.session.userId)
//                ),
//                isReqRecieved: user.sentReqs && user.sentReqs?.find(
//                     (friend) => String(friend._id) === String(req.session.userId)
//                ),
//                friendReqs: req.friendReqs || null,
//           })
//      } catch (error) {
//           console.log(error)
//           next(error)
//      }
// })
//
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
