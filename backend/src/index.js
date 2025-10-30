import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Experience } from "./models.js";

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.get("/api/experiences", async (req, res) => {
  const experiences = await Experience.find();
  res.json(experiences);
});

app.listen(3000, () => console.log("Server running"));
