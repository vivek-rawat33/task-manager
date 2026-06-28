import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "http://localhost:5173",
//   }),
// );
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Task Tracker API is running" });
});

app.get("/api/debug", (req, res) => {
  res.json({
    message: "Latest backend code is running",
    time: new Date().toISOString(),
  });
});
app.use("/api/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
