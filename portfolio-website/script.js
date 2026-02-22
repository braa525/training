// Task Management System - JavaScript

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');

// LocalStorage Key
const STORAGE_KEY = 'taskManagerTasks';

// Load tasks from LocalStorage on page load
document.addEventListener('DOMContentLoaded', loadTasks);

// Add task button click event
addTaskBtn.addEventListener('click', addTask);

// Add task on Enter key press
taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Function to add a new task
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        alert('الرجاء إدخال مهمة!');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };
    
    // Get existing tasks
    const tasks = getTasksFromStorage();
    tasks.push(task);
    
    // Save to LocalStorage
    saveTasksToStorage(tasks);
    
    // Render the task
    renderTask(task);
    
    // Hide empty message
    emptyMessage.classList.add('hidden');
    
    // Clear input
    taskInput.value = '';
    
    // Update stats
    updateStats();
}

// Function to get tasks from LocalStorage
function getTasksFromStorage() {
    const tasks = localStorage.getItem(STORAGE_KEY);
    return tasks ? JSON.parse(tasks) : [];
}

// Function to save tasks to LocalStorage
function saveTasksToStorage(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Function to load and render all tasks
function loadTasks() {
    const tasks = getTasksFromStorage();
    
    if (tasks.length === 0) {
        emptyMessage.classList.remove('hidden');
    } else {
        emptyMessage.classList.add('hidden');
        tasks.forEach(task => renderTask(task));
    }
    
    updateStats();
}

// Function to render a single task
function renderTask(task) {
    const li = document.createElement('li');
    li.setAttribute('data-id', task.id);
    
    if (task.completed) {
        li.classList.add('completed');
    }
    
    li.innerHTML = `
        <div class="task-content">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${escapeHtml(task.text)}</span>
        </div>
        <button class="delete-btn">حذف</button>
    `;
    
    // Add checkbox event listener
    const checkbox = li.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
    
    // Add delete button event listener
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    taskList.appendChild(li);
}

// Function to toggle task completion
function toggleTaskComplete(taskId) {
    const tasks = getTasksFromStorage();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasksToStorage(tasks);
        
        // Update UI
        const li = document.querySelector(`li[data-id="${taskId}"]`);
        if (tasks[taskIndex].completed) {
            li.classList.add('completed');
        } else {
            li.classList.remove('completed');
        }
        
        updateStats();
    }
}

// Function to delete a task
function deleteTask(taskId) {
    const tasks = getTasksFromStorage();
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    
    saveTasksToStorage(filteredTasks);
    
    // Remove from UI
    const li = document.querySelector(`li[data-id="${taskId}"]`);
    li.remove();
    
    // Show empty message if no tasks left
    if (filteredTasks.length === 0) {
        emptyMessage.classList.remove('hidden');
    }
    
    updateStats();
}

// Function to update statistics
function updateStats() {
    const tasks = getTasksFromStorage();
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;
    
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
}

// Function to escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
