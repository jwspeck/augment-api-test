const express = require("express");
const router = express.Router();

// Module-level in-memory storage
let tasks = [];
let nextId = 1;

// Helper function to find task by id
const findTaskById = (id) => {
  const taskIndex = tasks.findIndex(t => t.id === id);
  return taskIndex !== -1 ? { task: tasks[taskIndex], index: taskIndex } : null;
};

// GET /api/tasks → return all tasks
router.get("/", (req, res) => {
  res.json(tasks);
});

// GET /api/tasks/completed → get all completed tasks
router.get("/completed", (req, res) => {
  const completedTasks = tasks.filter(t => t.done === true);
  res.json(completedTasks);
});

// GET /api/tasks/pending → get all pending (not done) tasks
router.get("/pending", (req, res) => {
  const pendingTasks = tasks.filter(t => t.done === false);
  res.json(pendingTasks);
});

// GET /api/tasks/search?q=query → search tasks by title
router.get("/search", (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Search query 'q' is required" });
  }

  const searchResults = tasks.filter(task =>
    task.title.toLowerCase().includes(query.toLowerCase())
  );

  res.json(searchResults);
});

// GET /api/tasks/stats → get task statistics
router.get("/stats", (req, res) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.done === true).length;
  const pending = tasks.filter(t => t.done === false).length;
  const completionRate = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;

  res.json({
    total,
    completed,
    pending,
    completionRate: parseFloat(completionRate)
  });
});

// POST /api/tasks { title } → create { id, title, done:false, createdAt }
router.post("/", (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newTask = {
    id: nextId++,
    title,
    done: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// POST /api/tasks/bulk → create multiple tasks at once
router.post("/bulk", (req, res) => {
  const { tasks: taskTitles } = req.body;

  if (!Array.isArray(taskTitles) || taskTitles.length === 0) {
    return res.status(400).json({ error: "Tasks array is required" });
  }

  const newTasks = taskTitles.map(title => {
    if (!title) {
      return null;
    }
    return {
      id: nextId++,
      title,
      done: false,
      createdAt: new Date().toISOString()
    };
  }).filter(task => task !== null);

  tasks.push(...newTasks);
  res.status(201).json(newTasks);
});

// PATCH /api/tasks/complete-all → mark all tasks as done
router.patch("/complete-all", (req, res) => {
  tasks.forEach(task => {
    task.done = true;
  });
  res.json({ message: "All tasks marked as complete", tasks });
});

// PATCH /api/tasks/uncomplete-all → mark all tasks as not done
router.patch("/uncomplete-all", (req, res) => {
  tasks.forEach(task => {
    task.done = false;
  });
  res.json({ message: "All tasks marked as incomplete", tasks });
});

// PATCH /api/tasks/reorder → reorder tasks by providing array of ids
router.patch("/reorder", (req, res) => {
  const { order } = req.body;

  if (!Array.isArray(order)) {
    return res.status(400).json({ error: "Order array is required" });
  }

  // Validate all ids exist
  const allIdsExist = order.every(id => tasks.some(t => t.id === id));
  if (!allIdsExist || order.length !== tasks.length) {
    return res.status(400).json({ error: "Invalid order array" });
  }

  // Reorder tasks
  const reorderedTasks = order.map(id => tasks.find(t => t.id === id));
  tasks = reorderedTasks;

  res.json({ message: "Tasks reordered successfully", tasks });
});

// PATCH /api/tasks/:id → update title and/or done
router.patch("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, done } = req.body;

  // Update only provided fields
  if (title !== undefined) {
    tasks[taskIndex].title = title;
  }

  if (done !== undefined) {
    tasks[taskIndex].done = done;
  }

  res.json(tasks[taskIndex]);
});

// DELETE /api/tasks/completed → delete all completed tasks
router.delete("/completed", (req, res) => {
  const completedTasks = tasks.filter(t => t.done === true);
  tasks = tasks.filter(t => t.done === false);
  res.json({
    message: `Deleted ${completedTasks.length} completed tasks`,
    deletedTasks: completedTasks
  });
});

// DELETE /api/tasks/:id → remove by id
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.json(deletedTask);
});

// POST /api/tasks/:id/duplicate → duplicate a task
router.post("/:id/duplicate", (req, res) => {
  const id = parseInt(req.params.id);
  const result = findTaskById(id);

  if (!result) {
    return res.status(404).json({ error: "Task not found" });
  }

  const duplicatedTask = {
    id: nextId++,
    title: `${result.task.title} (copy)`,
    done: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(duplicatedTask);
  res.status(201).json(duplicatedTask);
});

// PATCH /api/tasks/reorder → reorder tasks by providing array of ids
router.patch("/reorder", (req, res) => {
  const { order } = req.body;

  if (!Array.isArray(order)) {
    return res.status(400).json({ error: "Order array is required" });
  }

  // Validate all ids exist
  const allIdsExist = order.every(id => tasks.some(t => t.id === id));
  if (!allIdsExist || order.length !== tasks.length) {
    return res.status(400).json({ error: "Invalid order array" });
  }

  // Reorder tasks
  const reorderedTasks = order.map(id => tasks.find(t => t.id === id));
  tasks = reorderedTasks;

  res.json({ message: "Tasks reordered successfully", tasks });
});

module.exports = router;

