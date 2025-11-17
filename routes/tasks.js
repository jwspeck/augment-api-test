const express = require("express");
const router = express.Router();
const taskStorage = require("../storage/taskStorage");

// Helper to get tasks array
const getTasks = () => taskStorage.getTasks();
const getNextId = () => taskStorage.incrementId();

// GET /tasks - Get all tasks (hierarchical structure)
router.get("/", (req, res) => {
  const hierarchical = req.query.hierarchical === 'true';
  const tasks = getTasks();

  if (hierarchical) {
    res.json(taskStorage.buildHierarchy(tasks));
  } else {
    res.json(tasks);
  }
});

// GET /tasks/:id - Get a single task by ID
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
});

// POST /tasks - Create a new task
router.post("/", (req, res) => {
  const { title, description, details, completed, parentId, order } = req.body;
  const tasks = getTasks();

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  // If parentId is provided, verify parent exists
  if (parentId !== null && parentId !== undefined) {
    const parent = tasks.find(t => t.id === parentId);
    if (!parent) {
      return res.status(400).json({ error: "Parent task not found" });
    }
  }

  // Calculate order if not provided
  let taskOrder = order;
  if (taskOrder === undefined || taskOrder === null) {
    // Find max order for tasks with same parent
    const siblings = tasks.filter(t => t.parentId === (parentId || null));
    taskOrder = siblings.length > 0 ? Math.max(...siblings.map(t => t.order || 0)) + 1 : 0;
  }

  const newTask = {
    id: getNextId(),
    title,
    description: description || "",
    details: details || "",
    completed: completed || false,
    parentId: parentId || null,
    order: taskOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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

  const { title, description, details, completed, parentId, order } = req.body;

  // If parentId is being changed, verify new parent exists and prevent circular reference
  if (parentId !== undefined && parentId !== tasks[taskIndex].parentId) {
    if (parentId !== null) {
      const parent = tasks.find(t => t.id === parentId);
      if (!parent) {
        return res.status(400).json({ error: "Parent task not found" });
      }

      // Prevent making a task its own parent or creating circular reference
      if (parentId === id) {
        return res.status(400).json({ error: "Task cannot be its own parent" });
      }

      // Check if new parent is a descendant of this task
      const isDescendant = (taskId, potentialDescendantId) => {
        const descendants = tasks.filter(t => t.parentId === taskId);
        if (descendants.some(d => d.id === potentialDescendantId)) return true;
        return descendants.some(d => isDescendant(d.id, potentialDescendantId));
      };

      if (isDescendant(id, parentId)) {
        return res.status(400).json({ error: "Cannot create circular reference" });
      }
    }
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: title !== undefined ? title : tasks[taskIndex].title,
    description: description !== undefined ? description : tasks[taskIndex].description,
    details: details !== undefined ? details : tasks[taskIndex].details,
    completed: completed !== undefined ? completed : tasks[taskIndex].completed,
    parentId: parentId !== undefined ? (parentId || null) : tasks[taskIndex].parentId,
    order: order !== undefined ? order : tasks[taskIndex].order,
    updatedAt: new Date().toISOString()
  };

  res.json(tasks[taskIndex]);
});

// DELETE /tasks/:id - Delete a task and all its subtasks
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Recursively delete all subtasks
  const deleteTaskAndSubtasks = (taskId) => {
    const subtasks = tasks.filter(t => t.parentId === taskId);
    subtasks.forEach(subtask => deleteTaskAndSubtasks(subtask.id));
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks.splice(index, 1);
    }
  };

  const deletedTask = tasks[taskIndex];
  deleteTaskAndSubtasks(id);

  res.json({ message: "Task and subtasks deleted successfully", task: deletedTask });
});

// PATCH /tasks/:id/reorder - Reorder a task
router.patch("/:id/reorder", (req, res) => {
  const id = parseInt(req.params.id);
  const { newOrder, newParentId } = req.body;

  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const task = tasks[taskIndex];
  const oldParentId = task.parentId;
  const oldOrder = task.order;

  // Update task's parent and order
  if (newParentId !== undefined) {
    task.parentId = newParentId || null;
  }
  if (newOrder !== undefined) {
    task.order = newOrder;
  }
  task.updatedAt = new Date().toISOString();

  // Reorder siblings in old parent
  if (oldParentId !== task.parentId) {
    const oldSiblings = tasks.filter(t => t.parentId === oldParentId && t.id !== id);
    oldSiblings.sort((a, b) => a.order - b.order);
    oldSiblings.forEach((sibling, index) => {
      sibling.order = index;
    });
  }

  // Reorder siblings in new parent
  const newSiblings = tasks.filter(t => t.parentId === task.parentId && t.id !== id);
  newSiblings.sort((a, b) => a.order - b.order);

  // Insert at new position
  newSiblings.splice(newOrder, 0, task);
  newSiblings.forEach((sibling, index) => {
    sibling.order = index;
  });

  res.json(task);
});

module.exports = router;

