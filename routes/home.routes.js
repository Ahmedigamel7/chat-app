const { isAuth } = require("./guards/protect.routes");
const router = require("express").Router();

router.get("/", isAuth, (req, res, next) => {
     res.render("index", {
          isUser: req.session.userId || null,
          friendReqs: req.friendReqs || null,
     });
});

module.exports = router;
