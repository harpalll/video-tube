import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 3000;

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.log("Error on server", err);
      throw err;
    });

    app.listen(PORT, () => {
      console.log(`\n Server is running on port : ${PORT}`);
    });
  })
  .catch((err) => console.log(`MongoDB connection failed`, err));
