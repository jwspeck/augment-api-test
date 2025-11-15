// Vercel Serverless Function for /api/tasks
const storage = require('./lib/storage');

// Initialize sample data on cold start
storage.initializeSampleData();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, url } = req;
  const path = url.replace('/api/tasks', '');

  try {
    // GET /api/tasks - Get all tasks
    if (method === 'GET' && path === '') {
      const tasks = storage.getAllTasks();
      return res.status(200).json(tasks);
    }

    // GET /api/tasks/completed
    if (method === 'GET' && path === '/completed') {
      const tasks = storage.getCompletedTasks();
      return res.status(200).json(tasks);
    }

    // GET /api/tasks/pending
    if (method === 'GET' && path === '/pending') {
      const tasks = storage.getPendingTasks();
      return res.status(200).json(tasks);
    }

    // GET /api/tasks/search?q=query
    if (method === 'GET' && path.startsWith('/search')) {
      const query = new URL(req.url, `http://${req.headers.host}`).searchParams.get('q');
      
      if (!query) {
        return res.status(400).json({ error: "Search query 'q' is required" });
      }
      
      const allTasks = storage.getAllTasks();
      const searchResults = allTasks.filter(task =>
        task.title.toLowerCase().includes(query.toLowerCase())
      );
      
      return res.status(200).json(searchResults);
    }

    // GET /api/tasks/stats
    if (method === 'GET' && path === '/stats') {
      const stats = storage.getStats();
      return res.status(200).json(stats);
    }

    // POST /api/tasks - Create task
    if (method === 'POST' && path === '') {
      const { title } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }
      
      const newTask = storage.createTask(title);
      return res.status(201).json(newTask);
    }

    // POST /api/tasks/bulk - Create multiple tasks
    if (method === 'POST' && path === '/bulk') {
      const { tasks: taskTitles } = req.body;
      
      if (!Array.isArray(taskTitles) || taskTitles.length === 0) {
        return res.status(400).json({ error: "Tasks array is required" });
      }
      
      const newTasks = storage.createBulkTasks(taskTitles);
      return res.status(201).json(newTasks);
    }

    // PATCH /api/tasks/complete-all
    if (method === 'PATCH' && path === '/complete-all') {
      const tasks = storage.completeAllTasks();
      return res.status(200).json({ message: "All tasks marked as complete", tasks });
    }

    // PATCH /api/tasks/uncomplete-all
    if (method === 'PATCH' && path === '/uncomplete-all') {
      const tasks = storage.uncompleteAllTasks();
      return res.status(200).json({ message: "All tasks marked as incomplete", tasks });
    }

    // PATCH /api/tasks/reorder
    if (method === 'PATCH' && path === '/reorder') {
      const { order } = req.body;
      
      if (!Array.isArray(order)) {
        return res.status(400).json({ error: "Order array is required" });
      }
      
      const tasks = storage.reorderTasks(order);
      
      if (!tasks) {
        return res.status(400).json({ error: "Invalid order array" });
      }
      
      return res.status(200).json({ message: "Tasks reordered successfully", tasks });
    }

    // DELETE /api/tasks/completed
    if (method === 'DELETE' && path === '/completed') {
      const completedTasks = storage.deleteCompletedTasks();
      return res.status(200).json({
        message: `Deleted ${completedTasks.length} completed tasks`,
        deletedTasks: completedTasks
      });
    }

    // Handle routes with :id parameter
    const idMatch = path.match(/^\/(\d+)(\/.*)?$/);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const subPath = idMatch[2] || '';

      // POST /api/tasks/:id/duplicate
      if (method === 'POST' && subPath === '/duplicate') {
        const duplicatedTask = storage.duplicateTask(id);
        
        if (!duplicatedTask) {
          return res.status(404).json({ error: "Task not found" });
        }
        
        return res.status(201).json(duplicatedTask);
      }

      // PATCH /api/tasks/:id
      if (method === 'PATCH' && subPath === '') {
        const { title, done } = req.body;
        const updatedTask = storage.updateTask(id, { title, done });
        
        if (!updatedTask) {
          return res.status(404).json({ error: "Task not found" });
        }
        
        return res.status(200).json(updatedTask);
      }

      // DELETE /api/tasks/:id
      if (method === 'DELETE' && subPath === '') {
        const deletedTask = storage.deleteTask(id);
        
        if (!deletedTask) {
          return res.status(404).json({ error: "Task not found" });
        }
        
        return res.status(200).json(deletedTask);
      }
    }

    // Route not found
    return res.status(404).json({ error: "Route not found" });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

