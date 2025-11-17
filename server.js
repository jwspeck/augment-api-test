require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// Import middleware
const getUserAuth = require("./middleware/auth");
const { apiLimiter } = require("./middleware/rateLimiter");

// Import routes
const tasksRouter = require("./routes/tasks");
const apiTasksRouter = require("./routes/api-tasks");

// Middleware
app.use(express.json());

// Serve static files (no auth required)
app.use(express.static(path.join(__dirname, "public")));

// Home route (no auth required)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Apply rate limiting to all API routes
app.use("/api/", apiLimiter);
app.use("/tasks", apiLimiter);

// Apply user authentication to all API routes
app.use("/api/", getUserAuth);
app.use("/tasks", getUserAuth);

// Mount routes
app.use("/tasks", tasksRouter);
app.use("/api/tasks", apiTasksRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});