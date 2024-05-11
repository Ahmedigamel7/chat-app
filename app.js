process.on("uncaughtException", (err) => {
     console.error("Uncaught Exception:", err);
     process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
     console.log("Unhandled Rejection:", reason);
     process.exit(1);
});

require("dotenv").config();
require("./helpers/mongo_init");
const path = require("path");
const http = require("http");


const express = require("express");
const app = express();
const port = process.env.PORT || 5555;
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);


const morgan = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");
const SessionStore = require("connect-mongodb-session")(session);
const { v4: uuidv4 } = require("uuid");
const { manageFriends } = require("./sockets/friends.socket");
const { init } = require("./sockets/socket");

const homeRouter = require("./routes/home.routes");
const usersRouter = require("./routes/users.routes");
const authRouter = require("./routes/auth.routes");
const chatRouter = require("./routes/chat.routes");
const groupRouter = require("./routes/group.routes");
const friendsRouter = require("./routes/friends.routes");
const { User } = require("./models/user.model");
const { manageChat } = require("./sockets/chat.socket");
const { manage_search } = require("./sockets/search.socket");
const { mongoDB_init } = require("./helpers/mongo_init");


io.onlineUsers = {};
const onConnection = (socket) => {
     console.log("a user connected")
     init(io, socket);
     manageFriends(io, socket);
     manageChat(io, socket);
     manage_search(socket);
}

io.on("connection", onConnection);

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static("images"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const mongoStore = new SessionStore({
     uri: process.env.MONGO_URI,
     collection: "Sessions",
});

app.use(
     session({
          name: "SID",
          secret: process.env.SESSION_SECRET,
          genid: () => uuidv4(),
          saveUninitialized: true,
          resave: false,
          store: mongoStore,
     })
);

app.use(flash());
app.use(morgan("dev"));



app.use(async (req, res, next) => {
     try {
          if (req.session.userId) {
               const user = await User.findById(req.session.userId, {
                    _id: false,
                    friendReqs: true,
               });
               req.friendReqs = user?.friendReqs;
               return next();
          } else {
               return next();
          }
     } catch (error) {
          return next(error);
     }
});
app.get('/error', (req, res) => {
     res.status(500).render("500", {
          isUser: req.session.userId || null,
          friendReqs: req.friendReqs || null,

     })
})
app.use("/auth", authRouter);
app.use("/", homeRouter);
app.use("/users", usersRouter);
app.use("/chats", chatRouter);
app.use("/groups", groupRouter);
app.use("/friends", friendsRouter);


app.use((error, req, res, next) => {
     console.log(error)
     res.status(error?.status || 500);
     res.render("500", {
          error: {
               status: error?.status || 500,
               msg: error?.message || error?.msg || "Somthing went wrong, please try again",
          },
          friendReqs: req.friendReqs || null,
          isUser: req.session.userId || null,
     });

});

app.use(function (req, res, next) {
     const location = req.url;
     res.location(location);
     return res.status(404).render("404", {
          friendReqs: req.friendReqs || null,
          isUser: req.session.userId || null,
     });
});



(async () => {
     try {
          await mongoDB_init()
          server.listen(port, () => { console.log(`listen on port ${port}`) });
     } catch (error) {
          console.log(error)
     }
})()