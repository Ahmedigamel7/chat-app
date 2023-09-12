// require("dotenv").config();
const mongoose = require("mongoose");
exports.mongoDB_init= async()=> {
     const options = { useNewUrlParser: true, useUnifiedTopology: true, maxPoolSize: 10 };
     mongoose.set("strictQuery", true);

     mongoose.connection.on("disconnected", () => console.log("mongoose is disconnected."));
     mongoose.connection.on("connected", () => console.log("mongoose connected to db."));
     
     mongoose.connection.on("error", (err) => console.log(err.message));
     process.on("SIGINT", async () => {
          await mongoose.connection.close();
          process.exit(0);
     });
     return mongoose
          .connect(process.env.MONGO_URI, options)

}

