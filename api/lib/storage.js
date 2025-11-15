// Simple in-memory storage for Vercel
// Note: This resets on each deployment and cold start
// For production, use a database like Vercel KV, MongoDB, or PostgreSQL

let tasks = [];
let nextId = 1;

// Initialize with some sample data (optional)
function initializeSampleData() {
  if (tasks.length === 0) {
    tasks = [
      { id: nextId++, title: "Welcome to Task Manager!", done: false, createdAt: new Date().toISOString() },
      { id: nextId++, title: "Try adding a new task", done: false, createdAt: new Date().toISOString() },
      { id: nextId++, title: "Mark tasks as complete", done: false, createdAt: new Date().toISOString() }
    ];
  }
}

// Get all tasks
function getAllTasks() {
  return tasks;
}

// Get task by ID
function getTaskById(id) {
  const taskIndex = tasks.findIndex(t => t.id === id);
  return taskIndex !== -1 ? { task: tasks[taskIndex], index: taskIndex } : null;
}

// Get completed tasks
function getCompletedTasks() {
  return tasks.filter(t => t.done === true);
}

// Get pending tasks
function getPendingTasks() {
  return tasks.filter(t => t.done === false);
}

// Create task
function createTask(title) {
  const newTask = {
    id: nextId++,
    title,
    done: false,
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  return newTask;
}

// Update task
function updateTask(id, updates) {
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return null;
  
  if (updates.title !== undefined) {
    tasks[taskIndex].title = updates.title;
  }
  if (updates.done !== undefined) {
    tasks[taskIndex].done = updates.done;
  }
  
  return tasks[taskIndex];
}

// Delete task
function deleteTask(id) {
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return null;
  
  const deletedTask = tasks.splice(taskIndex, 1)[0];
  return deletedTask;
}

// Delete all completed tasks
function deleteCompletedTasks() {
  const completedTasks = tasks.filter(t => t.done === true);
  tasks = tasks.filter(t => t.done === false);
  return completedTasks;
}

// Complete all tasks
function completeAllTasks() {
  tasks.forEach(task => {
    task.done = true;
  });
  return tasks;
}

// Uncomplete all tasks
function uncompleteAllTasks() {
  tasks.forEach(task => {
    task.done = false;
  });
  return tasks;
}

// Duplicate task
function duplicateTask(id) {
  const result = getTaskById(id);
  if (!result) return null;
  
  const duplicatedTask = {
    id: nextId++,
    title: `${result.task.title} (copy)`,
    done: false,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(duplicatedTask);
  return duplicatedTask;
}

// Get statistics
function getStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.done === true).length;
  const pending = tasks.filter(t => t.done === false).length;
  const completionRate = total > 0 ? parseFloat(((completed / total) * 100).toFixed(2)) : 0;
  
  return { total, completed, pending, completionRate };
}

// Reorder tasks
function reorderTasks(order) {
  const allIdsExist = order.every(id => tasks.some(t => t.id === id));
  if (!allIdsExist || order.length !== tasks.length) {
    return null;
  }
  
  tasks = order.map(id => tasks.find(t => t.id === id));
  return tasks;
}

// Create multiple tasks
function createBulkTasks(taskTitles) {
  const newTasks = taskTitles.map(title => {
    if (!title) return null;
    return {
      id: nextId++,
      title,
      done: false,
      createdAt: new Date().toISOString()
    };
  }).filter(task => task !== null);
  
  tasks.push(...newTasks);
  return newTasks;
}

module.exports = {
  initializeSampleData,
  getAllTasks,
  getTaskById,
  getCompletedTasks,
  getPendingTasks,
  createTask,
  updateTask,
  deleteTask,
  deleteCompletedTasks,
  completeAllTasks,
  uncompleteAllTasks,
  duplicateTask,
  getStats,
  reorderTasks,
  createBulkTasks
};

