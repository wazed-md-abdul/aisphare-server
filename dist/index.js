import "dotenv/config";
import dns from "node:dns";
// Windows: router IPv6 DNS breaks Node's SRV lookup for mongodb+srv URIs.
// Force public resolvers so querySrv works.
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth/auth.js";
import aiRoutes from "./routes/ai.routes.js";
import courseRoutes from "./routes/course.routes.js";
import { seedDatabase } from "./models/seed.js";
const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
// Better Auth handler — mount BEFORE express.json() so it can read the
// raw request body (spec §6.4).
app.all("/api/auth/*", toNodeHandler(auth));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
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
                dbName: "edusphere",
            });
            console.log("MongoDB connected to database: edusphere");
            await seedDatabase();
        }
        else {
            console.warn("MONGODB_URI not set — DB features disabled");
        }
    }
    catch (err) {
        console.warn("MongoDB connection failed — server will run but auth/DB routes will error:", err.message);
    }
}
// Skip app.listen in Vercel serverless environment and export the express instance
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    start().then(() => {
        app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
    });
}
else {
    // Trigger connection pool in Vercel context on boot
    start().catch((err) => console.error("Database connection failed on Vercel boot:", err));
}
export default app;
//# sourceMappingURL=index.js.map