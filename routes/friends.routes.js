const { ObjectId } = require("mongodb");
const { User } = require("../models/user.model");
const { Chat } = require("../models/chat.model");

const { isAuth } = require("./guards/protect.routes");

const router = require("express").Router();

router.get("/", isAuth, async (req, res, next) => {
     const { friends } = await User.getFriends(req.session.userId);

     res.render("friends", {
          isUser: req.session.userId || null,
          friendReqs: req.friendReqs || null,
          friends,
          myId: req.session.userId
     });
});

// router.post("/add", isAuth, async (req, res, next) => {
//      try {
//           await User.updateOne(
//                { _id: req.body.userId },
//                {
//                     $push: {
//                          friendReqs: {
//                               _id: new ObjectId(req.body.myId),
//                               name: req.body.myName,
//                               image: req.body.myImg,
//                          },
//                     },
//                }
//           );

//           await User.updateOne(
//                { _id: req.body.myId },
//                {
//                     $push: {
//                          sentReqs: {
//                               _id: new ObjectId(req.body.userId),
//                               name: req.body.userName,
//                               image: req.body.userImg,
//                          },
//                     },
//                }
//           );
//           return res.redirect("/users/" + req.body.userId);
//      } catch (error) {
//           console.log(error);
//           return next(error);
//      }
// });
router.post("/cancel", isAuth, async (req, res, next) => {
     try {
          await User.updateOne(
               { _id: req.body.userId },
               {
                    $pull: {
                         friendReqs: {
                              _id: new ObjectId(req.body.myId),
                         },
                    },
               }
          );
          await User.updateOne(
               { _id: req.body.myId },
               {
                    $pull: {
                         sentReqs: {
                              _id: new ObjectId(req.body.userId),
                         },
                    },
               }
          );
          return res.redirect("/users/" + req.body.userId);
     } catch (error) {
          console.log(error);
          return next(error);
     }
});
router.post("/delete", isAuth, async (req, res, next) => {
     try {
          await User.updateOne(
               { _id: req.body.userId },
               {
                    $pull: {
                         friends: {
                              _id: new ObjectId(req.body.myId),
                         },
                    },
               }
          );
          await User.updateOne(
               { _id: req.body.myId },
               {
                    $pull: {
                         friends: {
                              _id: new ObjectId(req.body.userId),
                         },
                    },
               }
          );
          return res.redirect("/users/" + req.body.userId);
     } catch (error) {
          console.log(error);
          return next(error);
     }
});
router.post("/accept", isAuth, async (req, res, next) => {
     try {
          const newChat = new Chat({
               users: [req.body.userId, req.body.myId],
               messages: [],
          });
          const savedChat = await newChat.save();

          await User.updateOne(
               { _id: req.body.userId },
               {
                    $pull: { sentReqs: { _id: req.body.myId } },
                    $push: {
                         friends: {
                              _id: req.body.myId,
                              name: req.body.myName,
                              image: req.body.myImg,
                              chatId: savedChat._id,
                         },
                    },
               }
          );
          await User.updateOne(
               { _id: req.body.myId },
               {
                    $pull: { friendReqs: { _id: req.body.userId } },
                    $push: {
                         friends: {
                              _id: req.body.userId,
                              name: req.body.userName,
                              chatId: savedChat._id,
                              image: req.body.userImg,
                         },
                    },
               }
          );
          return res.redirect("/users/" + req.body.userId);
     } catch (error) {
          console.log(error);
          return next(error);
     }
});

router.post("/reject", isAuth, async (req, res, next) => {
     try {
          await User.updateOne(
               { _id: req.body.userId },
               {
                    $pull: {
                         sentReqs: {
                              _id: new ObjectId(req.body.myId),
                         },
                    },
               }
          );
          await User.updateOne(
               { _id: req.body.myId },
               {
                    $pull: {
                         friendReqs: {
                              _id: new ObjectId(req.body.userId),
                         },
                    },
               }
          );
          return res.redirect("/users/" + req.body.userId);
     } catch (error) {
          console.log(error);
          return next(error);
     }
});

router.post('/:id', isAuth, async (req, res, next) => {
     try {

          await Promise.all([
               await User.updateOne(
                    { _id: req.params.id },
                    {
                         $pull: {
                              friends: {
                                   _id: new ObjectId(req.body.myId),
                              },
                         },
                    }
               ),
               await User.updateOne(
                    { _id: req.body.myId },
                    {
                         $pull: {
                              friends: {
                                   _id: new ObjectId(req.params.id),
                              },
                         },
                    }
               )])
          return res.redirect("/friends");
     } catch (error) {
          console.log(error);
          return next(error);
     }
})

module.exports = router;
