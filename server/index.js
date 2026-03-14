const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const errorHandler = require("./middleware/errorHandler");
const startCronJobs = require("./jobs/cronJobs");

const app = express();

// Set up background workers
startCronJobs();

// ── Production Middleware ────────────────────────────────────────
// HTTP request logging
app.use(morgan("dev"));

// Rate Limiting: General API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: "Too many requests, please try again after 15 minutes." },
});

// Rate Limiting: Stricter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { msg: "Too many login/register attempts, please try again later." },
});

app.use(cors());
app.use(express.json());

// Apply rate limiters
app.use("/api/", apiLimiter);
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);

// routes
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/classes", require("./routes/class.routes"));
app.use("/api/assignments", require("./routes/assignment.routes"));
app.use("/api/submissions", require("./routes/submission.routes"));

// Global Error Handler Middleware
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on ${PORT}`)
);
