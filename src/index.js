import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config()

console.log(process.env.MONGODB_URI)
connectDB()





/*
const app = new express()(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("ERROR:", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`App is listening on ${process.env.PORT}`);
    });
  } catch (err) {
    console.log("Error: ", err);
    throw err;
  }
})();
*/
