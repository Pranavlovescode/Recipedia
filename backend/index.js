// Imports
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { userRouter } from "./routes/user.js";
import auth from "./middleware/auth.js";


dotenv.config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/user", userRouter);
app.use(auth);

// test endpoint
app.get("/test", (req, res) => {
  res.json({ msg: "Server working fine" });
});

// server creation
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`recipedia backend running on ${PORT}`);
});
