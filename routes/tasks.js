const express = require("express");
const router = express.Router();

// In-memory storage for tasks
let tasks = [];
let nextId = 1;

// GET /tasks - Get all tasks
router.get("/", (req, res) => {
  res.json(tasks);
});

// GET /tasks/:id - Get a single task by ID
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  
  res.json(task);
});

// POST /tasks - Create a new task
router.post("/", (req, res) => {
  const { title, description, completed } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  
  const newTask = {
    id: nextId++,
    title,
    description: description || "",
    completed: completed || false,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id - Update a task
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  
  const { title, description, completed } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title,
    description: description || tasks[taskIndex].description,
    completed: completed !== undefined ? completed : tasks[taskIndex].completed,
    updatedAt: new Date().toISOString()
  };
  
  res.json(tasks[taskIndex]);
});

// DELETE /tasks/:id - Delete a task
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  
  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.json({ message: "Task deleted successfully", task: deletedTask });
});

module.exports = router;

