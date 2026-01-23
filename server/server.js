import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import dns from "dns";
import showRouter from "./routes/showRoute.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

dns.setServers(["8.8.8.8", "8.8.4.4"]);

/* ===============================
   DATABASE
================================ */
await connectDB();

/* ===============================
   MIDDLEWARE
================================ */
app.use(express.json());
app.use(
  cors({
    origin: "*", // for development
    credentials: true,
  })
);
app.use(clerkMiddleware());

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("Server is live!");
});

/* ===============================
   ROUTES
================================ */
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

/* ===============================
   ERROR HANDLER (OPTIONAL BUT GOOD)
================================ */
app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

/* ===============================
   START SERVER
================================ */
app.listen(port, () =>
  console.log(`🚀 Server listening at http://localhost:${port}`)
);
