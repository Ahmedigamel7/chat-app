// require("dotenv").config();
const mongoose = require("mongoose");

const options = { useNewUrlParser: true, useUnifiedTopology: true, maxPoolSize: 10 };
mongoose.set("strictQuery", true);
mongoose
     .connect(process.env.MONGO_URI, options)
     .then(() => {
          console.log("mongodb connected.");
     })
     .catch((err) => {
          console.log(err.message);
     });

// mongoose.connection.on("connected", () => console.log("mongoose connected to db."));

mongoose.connection.on("disconnected", () => console.log("mongoose connection is disconnected."));

mongoose.connection.on("error", (err) => console.log(err.message));

process.on("SIGINT", async () => {
     await mongoose.connection.close();
     process.exit(0);
});

// console.log(mongoose.modelNames());
