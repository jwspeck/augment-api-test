const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// Import routes
const tasksRouter = require("./routes/tasks");
const apiTasksRouter = require("./routes/api-tasks");

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.json({ message: "Hello from Augment test API!" });
});

// Mount routes
app.use("/tasks", tasksRouter);
app.use("/api/tasks", apiTasksRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});