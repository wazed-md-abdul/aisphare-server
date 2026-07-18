import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth/auth.js";
import aiRoutes from "./routes/ai.routes.js";
import courseRoutes from "./routes/course.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Better Auth handler — mount BEFORE express.json() so it can read the
// raw request body (spec §6.4).
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/ai", aiRoutes);
app.use("/api/courses", courseRoutes);

async function start() {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("MongoDB connected");
    } else {
      console.warn("MONGODB_URI not set — DB features disabled");
    }
  } catch (err) {
    console.warn(
      "MongoDB connection failed — server will run but auth/DB routes will error:",
      (err as Error).message
    );
  }
  app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
}

start();
