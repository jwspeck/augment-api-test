// API Configuration
const API_URL = '/api/tasks';

// No API key needed - using Azure Easy Auth for user authentication
// The server will automatically identify the logged-in user

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const tasksList = document.getElementById('tasksList');
const searchInput = document.getElementById('searchInput');
const detailsPanel = document.getElementById('detailsPanel');
const detailsOverlay = document.getElementById('detailsOverlay');

// Current state
let currentFilter = 'all';
let currentSearchQuery = '';
let allTasks = [];
let expandedTasks = new Set();
let currentEditingTask = null;

// Load and display user info
async function loadUserInfo() {
    try {
        const response = await fetch(`${API_URL}/user`);
        if (response.ok) {
            const user = await response.json();
            const userInfoDiv = document.getElementById('userInfo');
            const userNameSpan = document.getElementById('userName');
            userNameSpan.textContent = user.name || user.email || 'User';
            userInfoDiv.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        // In development mode, user info might not be available
    }
}

// Theme Management
function setTheme(theme) {
    console.log('Setting theme to:', theme);
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const selectedBtn = document.querySelector(`.theme-btn[data-theme="${theme}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    localStorage.setItem('theme', theme);
    console.log('Theme applied. Current data-theme:', document.documentElement.getAttribute('data-theme'));
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'default';
    setTheme(savedTheme);
}

// Load tasks and stats on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSavedTheme();
    loadUserInfo();
    loadTasks();
    loadStats();
});

// Form submit handler
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await createTask();
});

// Load all tasks (hierarchical)
async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        allTasks = await response.json();
        displayTasks(allTasks);
        await loadStats();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Display tasks hierarchically
function displayTasks(tasks) {
    if (!tasks || tasks.length === 0) {
        tasksList.innerHTML = '<div class="empty-state">No tasks yet. Create one above!</div>';
        return;
    }

    tasksList.innerHTML = '';
    tasks.forEach(task => {
        const taskElement = createTaskElement(task, 0);
        tasksList.appendChild(taskElement);
    });

    // Initialize drag and drop for root level
    initializeDragAndDrop(tasksList);
}

// Create task element with subtasks
function createTaskElement(task, level) {
    const div = document.createElement('div');
    div.className = 'task-wrapper';
    div.dataset.taskId = task.id;
    
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    
    div.innerHTML = `
        <div class="task-item ${task.done ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-header">
                <span class="drag-handle">⋮⋮</span>
                <span class="expand-icon ${hasSubtasks ? (isExpanded ? 'expanded' : '') : 'no-children'}" 
                      onclick="toggleSubtasks(${task.id})">
                    ${hasSubtasks ? '▶' : ''}
                </span>
                <div class="task-content" onclick="toggleTask(${task.id})">
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                </div>
                ${hasSubtasks ? `<span class="subtask-count">${task.subtasks.length}</span>` : ''}
                <div class="task-actions">
                    <button class="btn-details" onclick="openDetailsPanel(${task.id})">📝</button>
                    <button class="btn-add-subtask" onclick="addSubtask(${task.id})">+</button>
                    <button class="btn-toggle" onclick="toggleTask(${task.id})">${task.done ? '↺' : '✓'}</button>
                    <button class="btn-delete" onclick="deleteTask(${task.id})">🗑</button>
                </div>
            </div>
        </div>
    `;
    
    // Add subtasks container if there are subtasks
    if (hasSubtasks) {
        const subtasksContainer = document.createElement('div');
        subtasksContainer.className = `subtasks-container ${isExpanded ? 'expanded' : ''}`;
        subtasksContainer.dataset.parentId = task.id;
        
        task.subtasks.forEach(subtask => {
            const subtaskElement = createTaskElement(subtask, level + 1);
            subtasksContainer.appendChild(subtaskElement);
        });
        
        div.appendChild(subtasksContainer);
        
        // Initialize drag and drop for subtasks
        initializeDragAndDrop(subtasksContainer);
    }
    
    return div;
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Toggle subtasks expand/collapse
function toggleSubtasks(taskId) {
    if (expandedTasks.has(taskId)) {
        expandedTasks.delete(taskId);
    } else {
        expandedTasks.add(taskId);
    }
    loadTasks();
}

// Initialize drag and drop for a container
function initializeDragAndDrop(container) {
    if (!window.Sortable) {
        console.warn('Sortable.js not loaded');
        return;
    }

    new Sortable(container, {
        group: 'tasks',
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'dragging',
        dragClass: 'drag-over',
        onEnd: async function(evt) {
            const taskId = parseInt(evt.item.dataset.taskId);
            const newIndex = evt.newIndex;

            // Determine new parent
            let newParentId = null;
            if (evt.to.classList.contains('subtasks-container')) {
                newParentId = parseInt(evt.to.dataset.parentId);
            }

            // Move task
            try {
                await fetch(`${API_URL}/${taskId}/move`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        newParentId: newParentId,
                        newOrder: newIndex
                    })
                });

                await loadTasks();
            } catch (error) {
                console.error('Error moving task:', error);
                await loadTasks(); // Reload to reset state
            }
        }
    });
}

// Create new task
async function createTask() {
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();

    if (!title) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });

        if (response.ok) {
            taskTitle.value = '';
            taskDescription.value = '';
            await loadTasks();
        }
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

// Add subtask
async function addSubtask(parentId) {
    const title = prompt('Enter subtask title:');
    if (!title) return;

    try {
        const response = await fetch(`${API_URL}/${parentId}/subtask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });

        if (response.ok) {
            expandedTasks.add(parentId); // Auto-expand parent
            await loadTasks();
        }
    } catch (error) {
        console.error('Error creating subtask:', error);
    }
}

// Toggle task completion
async function toggleTask(taskId) {
    try {
        // Find task in hierarchy
        const task = findTaskById(allTasks, taskId);
        if (!task) return;

        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ done: !task.done })
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        console.error('Error toggling task:', error);
    }
}

// Find task by ID in hierarchical structure
function findTaskById(tasks, id) {
    for (const task of tasks) {
        if (task.id === id) return task;
        if (task.subtasks) {
            const found = findTaskById(task.subtasks, id);
            if (found) return found;
        }
    }
    return null;
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Delete this task and all its subtasks?')) return;

    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Open details panel
function openDetailsPanel(taskId) {
    const task = findTaskById(allTasks, taskId);
    if (!task) return;

    currentEditingTask = task;

    document.getElementById('detailsTitle').value = task.title || '';
    document.getElementById('detailsDescription').value = task.description || '';
    document.getElementById('detailsText').value = task.details || '';

    detailsPanel.classList.add('open');
    detailsOverlay.classList.add('open');
}

// Close details panel
function closeDetailsPanel() {
    detailsPanel.classList.remove('open');
    detailsOverlay.classList.remove('open');
    currentEditingTask = null;
}

// Save task details
async function saveTaskDetails() {
    if (!currentEditingTask) return;

    const title = document.getElementById('detailsTitle').value.trim();
    const description = document.getElementById('detailsDescription').value.trim();
    const details = document.getElementById('detailsText').value.trim();

    if (!title) {
        alert('Title is required');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${currentEditingTask.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, details })
        });

        if (response.ok) {
            closeDetailsPanel();
            await loadTasks();
        }
    } catch (error) {
        console.error('Error saving task details:', error);
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const stats = await response.json();

        document.getElementById('totalTasks').textContent = stats.total;
        document.getElementById('completedTasks').textContent = stats.completed;
        document.getElementById('pendingTasks').textContent = stats.pending;
        document.getElementById('completionRate').textContent = `${stats.completionRate}%`;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Search tasks
async function searchTasks() {
    currentSearchQuery = searchInput.value.trim();
    if (!currentSearchQuery) {
        await loadTasks();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(currentSearchQuery)}`);
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error('Error searching tasks:', error);
    }
}

// Clear search
async function clearSearch() {
    searchInput.value = '';
    currentSearchQuery = '';
    await loadTasks();
}

// Filter tasks
async function filterTasks(filter) {
    currentFilter = filter;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    let url = API_URL;
    if (filter === 'completed') {
        url = `${API_URL}/completed`;
    } else if (filter === 'pending') {
        url = `${API_URL}/pending`;
    }

    try {
        const response = await fetch(url);
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error('Error filtering tasks:', error);
    }
}

// Bulk actions
async function completeAllTasks() {
    if (!confirm('Mark all tasks as complete?')) return;

    try {
        await fetch(`${API_URL}/complete-all`, { method: 'PATCH' });
        await loadTasks();
    } catch (error) {
        console.error('Error completing all tasks:', error);
    }
}

async function uncompleteAllTasks() {
    if (!confirm('Mark all tasks as incomplete?')) return;

    try {
        await fetch(`${API_URL}/uncomplete-all`, { method: 'PATCH' });
        await loadTasks();
    } catch (error) {
        console.error('Error uncompleting all tasks:', error);
    }
}

async function deleteCompletedTasks() {
    if (!confirm('Delete all completed tasks?')) return;

    try {
        await fetch(`${API_URL}/completed`, { method: 'DELETE' });
        await loadTasks();
    } catch (error) {
        console.error('Error deleting completed tasks:', error);
    }
}

