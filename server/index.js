import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import memberRoutes from "./routes/members.js";
import attendanceRoutes from "./routes/attendance.js";
import planRoutes from "./routes/plans.js";
import paymentRoutes from "./routes/payments.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/gym-db")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/payments", paymentRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Gym QR Attendance API is running" });
});

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Gym QR Attendance & Membership System API" });
});

// Error handling middleware
/* eslint-disable @typescript-eslint/no-explicit-any */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});