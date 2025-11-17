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

// Helper function to build hierarchical structure
const buildHierarchy = (flatTasks) => {
  const taskMap = new Map();
  const rootTasks = [];

  // First pass: create map of all tasks
  flatTasks.forEach(task => {
    taskMap.set(task.id, { ...task, subtasks: [] });
  });

  // Second pass: build hierarchy
  flatTasks.forEach(task => {
    const taskWithSubtasks = taskMap.get(task.id);
    if (task.parentId === null || task.parentId === undefined) {
      rootTasks.push(taskWithSubtasks);
    } else {
      const parent = taskMap.get(task.parentId);
      if (parent) {
        parent.subtasks.push(taskWithSubtasks);
      } else {
        rootTasks.push(taskWithSubtasks);
      }
    }
  });

  // Sort by order within each level
  const sortByOrder = (tasks) => {
    tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
    tasks.forEach(task => {
      if (task.subtasks && task.subtasks.length > 0) {
        sortByOrder(task.subtasks);
      }
    });
  };

  sortByOrder(rootTasks);
  return rootTasks;
};

// GET /api/tasks → return all tasks (hierarchical by default)
router.get("/", (req, res) => {
  const flat = req.query.flat === 'true';

  if (flat) {
    res.json(tasks);
  } else {
    res.json(buildHierarchy(tasks));
  }
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

// POST /api/tasks { title, description, details, parentId } → create task
router.post("/", (req, res) => {
  const { title, description, details, parentId, order } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  // Verify parent exists if provided
  if (parentId !== null && parentId !== undefined) {
    const parent = tasks.find(t => t.id === parentId);
    if (!parent) {
      return res.status(400).json({ error: "Parent task not found" });
    }
  }

  // Calculate order if not provided
  let taskOrder = order;
  if (taskOrder === undefined || taskOrder === null) {
    const siblings = tasks.filter(t => t.parentId === (parentId || null));
    taskOrder = siblings.length > 0 ? Math.max(...siblings.map(t => t.order || 0)) + 1 : 0;
  }

  const newTask = {
    id: nextId++,
    title,
    description: description || "",
    details: details || "",
    done: false,
    parentId: parentId || null,
    order: taskOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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

// PATCH /api/tasks/:id → update title, done, description, details, parentId, order
router.patch("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, done, description, details, parentId, order } = req.body;

  // Update only provided fields
  if (title !== undefined) {
    tasks[taskIndex].title = title;
  }

  if (done !== undefined) {
    tasks[taskIndex].done = done;
  }

  if (description !== undefined) {
    tasks[taskIndex].description = description;
  }

  if (details !== undefined) {
    tasks[taskIndex].details = details;
  }

  if (parentId !== undefined) {
    tasks[taskIndex].parentId = parentId || null;
  }

  if (order !== undefined) {
    tasks[taskIndex].order = order;
  }

  tasks[taskIndex].updatedAt = new Date().toISOString();

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

// DELETE /api/tasks/:id → remove by id (and all subtasks)
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

// POST /api/tasks/:id/subtask → create a subtask
router.post("/:id/subtask", (req, res) => {
  const parentId = parseInt(req.params.id);
  const parent = tasks.find(t => t.id === parentId);

  if (!parent) {
    return res.status(404).json({ error: "Parent task not found" });
  }

  const { title, description, details } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  // Calculate order for new subtask
  const siblings = tasks.filter(t => t.parentId === parentId);
  const taskOrder = siblings.length > 0 ? Math.max(...siblings.map(t => t.order || 0)) + 1 : 0;

  const newTask = {
    id: nextId++,
    title,
    description: description || "",
    details: details || "",
    done: false,
    parentId: parentId,
    order: taskOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PATCH /api/tasks/:id/move → move task to new parent and/or reorder
router.patch("/:id/move", (req, res) => {
  const id = parseInt(req.params.id);
  const { newParentId, newOrder } = req.body;

  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const task = tasks[taskIndex];
  const oldParentId = task.parentId;

  // Update parent if provided
  if (newParentId !== undefined) {
    // Verify new parent exists (unless moving to root)
    if (newParentId !== null) {
      const newParent = tasks.find(t => t.id === newParentId);
      if (!newParent) {
        return res.status(400).json({ error: "New parent task not found" });
      }

      // Prevent circular reference
      if (newParentId === id) {
        return res.status(400).json({ error: "Task cannot be its own parent" });
      }

      const isDescendant = (taskId, potentialDescendantId) => {
        const descendants = tasks.filter(t => t.parentId === taskId);
        if (descendants.some(d => d.id === potentialDescendantId)) return true;
        return descendants.some(d => isDescendant(d.id, potentialDescendantId));
      };

      if (isDescendant(id, newParentId)) {
        return res.status(400).json({ error: "Cannot create circular reference" });
      }
    }

    task.parentId = newParentId || null;
  }

  // Reorder siblings in old parent
  if (oldParentId !== task.parentId) {
    const oldSiblings = tasks.filter(t => t.parentId === oldParentId && t.id !== id);
    oldSiblings.sort((a, b) => a.order - b.order);
    oldSiblings.forEach((sibling, index) => {
      sibling.order = index;
    });
  }

  // Handle new order
  const newSiblings = tasks.filter(t => t.parentId === task.parentId && t.id !== id);
  newSiblings.sort((a, b) => a.order - b.order);

  if (newOrder !== undefined && newOrder !== null) {
    // Insert at specific position
    newSiblings.splice(newOrder, 0, task);
    newSiblings.forEach((sibling, index) => {
      sibling.order = index;
    });
  } else {
    // Add to end
    task.order = newSiblings.length;
  }

  task.updatedAt = new Date().toISOString();

  res.json(task);
});

module.exports = router;

