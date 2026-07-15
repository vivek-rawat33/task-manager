import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "https://task-manager-mu-jet-14.vercel.app",
  "https://task-manager-rho-one-47.vercel.app",
  "https://task-manager-git-main-vivek-rawat33s-projects.vercel.app",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

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
app.get("/api/tasks/direct-test", (req, res) => {
  res.json({ message: "Direct tasks route working" });
});

app.use("/api/teams", teamRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
