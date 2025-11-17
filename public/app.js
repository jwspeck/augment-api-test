// API Base URL
const API_URL = '/api/tasks';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const tasksList = document.getElementById('tasksList');
const searchInput = document.getElementById('searchInput');

// Current filter state
let currentFilter = 'all';
let currentSearchQuery = '';

// Theme Management
function setTheme(theme) {
    console.log('Setting theme to:', theme);

    // Remove active class from all theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to selected theme button
    const selectedBtn = document.querySelector(`.theme-btn[data-theme="${theme}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }

    // Apply theme to document
    if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }

    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);

    console.log('Theme applied. Current data-theme:', document.documentElement.getAttribute('data-theme'));
}

// Load saved theme on page load
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'default';
    setTheme(savedTheme);
}

// Load tasks and stats on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSavedTheme();
    loadTasks();
    loadStats();
});

// Form submit handler
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await createTask();
});

// Load all tasks
async function loadTasks() {
    try {
        let url = API_URL;

        // Apply filter
        if (currentFilter === 'completed') {
            url = `${API_URL}/completed`;
        } else if (currentFilter === 'pending') {
            url = `${API_URL}/pending`;
        }

        const response = await fetch(url);
        let tasks = await response.json();

        // Apply search if active
        if (currentSearchQuery) {
            tasks = tasks.filter(task =>
                task.title.toLowerCase().includes(currentSearchQuery.toLowerCase())
            );
        }

        displayTasks(tasks);
        await loadStats();
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasksList.innerHTML = '<p class="empty-state">Error loading tasks</p>';
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

// Create a new task
async function createTask() {
    const task = {
        title: taskTitle.value.trim()
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });

        if (response.ok) {
            taskTitle.value = '';
            await loadTasks();
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error creating task:', error);
        alert('Failed to create task');
    }
}

// Toggle task completion
async function toggleTask(id, currentStatus) {
    try {
        const updateResponse = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ done: !currentStatus })
        });

        if (updateResponse.ok) {
            await loadTasks();
        }
    } catch (error) {
        console.error('Error toggling task:', error);
        alert('Failed to update task');
    }
}

// Delete a task
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
    }
}

// Filter tasks
function filterTasks(filter) {
    currentFilter = filter;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    loadTasks();
}

// Search tasks
async function searchTasks() {
    currentSearchQuery = searchInput.value.trim();
    await loadTasks();
}

// Clear search
function clearSearch() {
    searchInput.value = '';
    currentSearchQuery = '';
    loadTasks();
}

// Complete all tasks
async function completeAllTasks() {
    if (!confirm('Mark all tasks as complete?')) return;

    try {
        const response = await fetch(`${API_URL}/complete-all`, {
            method: 'PATCH'
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        console.error('Error completing all tasks:', error);
        alert('Failed to complete all tasks');
    }
}

// Uncomplete all tasks
async function uncompleteAllTasks() {
    if (!confirm('Mark all tasks as incomplete?')) return;

    try {
        const response = await fetch(`${API_URL}/uncomplete-all`, {
            method: 'PATCH'
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        console.error('Error uncompleting all tasks:', error);
        alert('Failed to uncomplete all tasks');
    }
}

// Delete all completed tasks
async function deleteCompletedTasks() {
    if (!confirm('Delete all completed tasks? This cannot be undone.')) return;

    try {
        const response = await fetch(`${API_URL}/completed`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        console.error('Error deleting completed tasks:', error);
        alert('Failed to delete completed tasks');
    }
}

// Duplicate a task
async function duplicateTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/duplicate`, {
            method: 'POST'
        });

        if (response.ok) {
            await loadTasks();
        }
    } catch (error) {
        console.error('Error duplicating task:', error);
        alert('Failed to duplicate task');
    }
}

// Display tasks in the UI
function displayTasks(tasks) {
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p class="empty-state">No tasks yet. Add one above!</p>';
        return;
    }

    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.done ? 'completed' : ''}">
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
            </div>
            <div class="task-actions">
                <button class="btn-complete" onclick="toggleTask(${task.id}, ${task.done})">
                    ${task.done ? 'Undo' : 'Complete'}
                </button>
                <button class="btn-duplicate" onclick="duplicateTask(${task.id})">Duplicate</button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

