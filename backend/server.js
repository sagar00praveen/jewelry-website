const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Create Express app
const app = express();

// ===========================
// MIDDLEWARE
// ===========================
app.use(cors());
app.use(express.json());

// Logging in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ===========================
// ROUTES
// ===========================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);

// ===========================
// SERVE FRONTEND (PRODUCTION)
// ===========================
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// ===========================
// GLOBAL ERROR HANDLING
// (VERY IMPORTANT)
// ===========================
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((el) => el.message);
    err.message = `Validation failed: ${messages.join(". ")}`;
    err.statusCode = 400;
  }

  // Duplicate key error (email, phone, etc.)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.message = `Duplicate value for ${field}. Please use another ${field}.`;
    err.statusCode = 400;
  }

  // Invalid Mongo ID
  if (err.name === "CastError") {
    err.message = `Invalid ${err.path}: ${err.value}`;
    err.statusCode = 400;
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    err.message = "Invalid token. Please log in again!";
    err.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    err.message = "Token expired. Please log in again!";
    err.statusCode = 401;
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

// ===========================
// CONNECT TO MONGODB
// ===========================
const DB = process.env.MONGO_URI;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ DB connection error:", err));

// ===========================
// START SERVER
// ===========================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}...`);
});

// ===========================
// HANDLE UNHANDLED PROMISE REJECTIONS
// ===========================
process.on("unhandledRejection", (err) => {
  console.log("💥 UNHANDLED REJECTION! Shutting down...");
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});

// ===========================
// HANDLE SIGTERM (CLOUD DEPLOYMENT)
// ===========================
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("💥 Process terminated.");
  });
});
