// Shared in-memory storage for tasks
let tasks = [];
let nextId = 1;

// Helper function to build hierarchical structure
function buildHierarchy(flatTasks) {
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
        // Parent not found, treat as root task
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
}

module.exports = {
  getTasks: () => tasks,
  setTasks: (newTasks) => { tasks = newTasks; },
  getNextId: () => nextId,
  incrementId: () => nextId++,
  setNextId: (id) => { nextId = id; },
  buildHierarchy
};

