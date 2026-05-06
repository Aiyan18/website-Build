/* ===========================
   STUDENT SUCCESS HUB - SCRIPTS
   =========================== */

// ============================================================================
// 1. TASK MANAGEMENT & LOCAL STORAGE
// ============================================================================

class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.initializeTaskManager();
    }

    // Load tasks from localStorage
    loadTasks() {
        const stored = localStorage.getItem('studentSuccessHubTasks');
        return stored ? JSON.parse(stored) : [];
    }

    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('studentSuccessHubTasks', JSON.stringify(this.tasks));
    }

    // Add new task
    addTask(title) {
        if (!title.trim()) {
            alert('Please enter a task description.');
            return false;
        }

        const task = {
            id: Date.now(),
            title: title.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        return true;
    }

    // Delete task
    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    // Toggle task completion
    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    // Clear all completed tasks
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear.');
            return;
        }

        if (confirm(`Clear ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    // Render tasks to UI
    renderTasks() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');

        if (!taskList) return;

        let filteredTasks = this.tasks;
        if (this.currentFilter === 'pending') {
            filteredTasks = this.tasks.filter(t => !t.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTasks = this.tasks.filter(t => t.completed);
        }

        taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        filteredTasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskEl.innerHTML = `
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    aria-label="Mark task as complete"
                >
                <span class="task-text">${this.escapeHtml(task.title)}</span>
                <button class="task-delete" aria-label="Delete task">Delete</button>
            `;

            const checkbox = taskEl.querySelector('.task-checkbox');
            const deleteBtn = taskEl.querySelector('.task-delete');

            checkbox.addEventListener('change', () => this.toggleTask(task.id));
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

            taskList.appendChild(taskEl);
        });
    }

    // Update statistics
    updateStats() {
        const totalEl = document.getElementById('totalTasks');
        const completedEl = document.getElementById('completedTasks');
        const progressEl = document.getElementById('progressPercent');

        if (totalEl && completedEl && progressEl) {
            const total = this.tasks.length;
            const completed = this.tasks.filter(t => t.completed).length;
            const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

            totalEl.textContent = total;
            completedEl.textContent = completed;
            progressEl.textContent = `${percent}%`;
        }
    }

    // Initialize task manager event listeners
    initializeTaskManager() {
        const taskInput = document.getElementById('taskInput');
        const addTaskBtn = document.getElementById('addTaskBtn');
        const clearCompletedBtn = document.getElementById('clearCompletedBtn');
        const filterBtns = document.querySelectorAll('.filter-btn');

        // Add task button
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                if (taskInput && this.addTask(taskInput.value)) {
                    taskInput.value = '';
                    taskInput.focus();
                }
            });
        }

        // Add task on Enter key
        if (taskInput) {
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    if (this.addTask(taskInput.value)) {
                        taskInput.value = '';
                    }
                }
            });
        }

        // Clear completed button
        if (clearCompletedBtn) {
            clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        }

        // Filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTasks();
            });
        });

        this.renderTasks();
        this.updateStats();
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// ============================================================================
// 2. CALENDAR FUNCTIONALITY
// ============================================================================

class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.initializeCalendar();
    }

    initializeCalendar() {
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => this.previousMonth());
            nextBtn.addEventListener('click', () => this.nextMonth());
        }

        this.renderCalendar();
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        const currentMonthEl = document.getElementById('currentMonth');

        if (!calendar || !currentMonthEl) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Update month display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        currentMonthEl.textContent = `${monthNames[month]} ${year}`;

        // Clear calendar
        calendar.innerHTML = '';

        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;
            calendar.appendChild(dayEl);
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            calendar.appendChild(emptyCell);
        }

        // Add day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.textContent = day;

            // Highlight today
            if (
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {
                dayEl.classList.add('today');
            }

            calendar.appendChild(dayEl);
        }
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }
}

// ============================================================================
// 3. NAVIGATION & ACTIVE STATE
// ============================================================================

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = getCurrentPageFromURL();

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === currentPage) {
            link.classList.add('active');
        }

        // Remove active from all and add to clicked one
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function getCurrentPageFromURL() {
    const path = window.location.pathname;
    
    if (path.includes('study-tips')) return 'tips';
    if (path.includes('resources')) return 'resources';
    if (path.includes('planner')) return 'planner';
    if (path.includes('about')) return 'about';
    return 'home';
}

// ============================================================================
// 4. FORM VALIDATION & SUBMISSION
// ============================================================================

function initializeContactForm() {
    const form = document.getElementById('contactForm');
    const formNote = document.getElementById('formNote');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const message = document.getElementById('contactMessage').value.trim();

        // Validate inputs
        if (!name || !email || !message) {
            showFormMessage('Please fill in all fields.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showFormMessage('Please enter a valid email address.', 'error');
            return;
        }

        if (message.length < 10) {
            showFormMessage('Message must be at least 10 characters long.', 'error');
            return;
        }

        // Since this is front-end only, show success message
        showFormMessage('Thank you for your message! We appreciate your feedback.', 'success');
        form.reset();

        // Clear message after 5 seconds
        setTimeout(() => {
            if (formNote) formNote.textContent = '';
        }, 5000);
    });
}

function showFormMessage(message, type) {
    const formNote = document.getElementById('formNote');
    if (formNote) {
        formNote.textContent = message;
        formNote.className = `form-note ${type}`;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================================================
// 5. SMOOTH SCROLLING & ANCHOR LINKS
// ============================================================================

function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only prevent default for same-page links
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

// ============================================================================
// 6. SEARCH FUNCTIONALITY
// ============================================================================

function initializeSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                // Simple search: navigate to relevant pages based on keywords
                if (query.toLowerCase().includes('tip') || query.toLowerCase().includes('study')) {
                    window.location.href = 'study-tips.html';
                } else if (query.toLowerCase().includes('resource')) {
                    window.location.href = 'resources.html';
                } else if (query.toLowerCase().includes('task') || query.toLowerCase().includes('plan')) {
                    window.location.href = 'planner.html';
                } else {
                    alert('Search term not found. Try "tips", "resources", or "planner".');
                }
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
}

// ============================================================================
// 7. MOBILE NAVIGATION TOGGLE
// ============================================================================

function initializeMobileNav() {
    // Currently using CSS for mobile nav, but this hook is available
    // for future enhancements like hamburger menu
}

// ============================================================================
// 8. INITIALIZE ALL ON PAGE LOAD
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initializeNavigation();

    // Initialize smooth scrolling
    initializeSmoothScroll();

    // Initialize search
    initializeSearch();

    // Initialize contact form
    initializeContactForm();

    // Initialize task manager if on planner page
    if (document.getElementById('taskList')) {
        window.taskManager = new TaskManager();
    }

    // Initialize calendar if on planner page
    if (document.getElementById('calendar')) {
        window.calendarManager = new CalendarManager();
    }

    // Mobile nav initialization
    initializeMobileNav();

    // Log page load for debugging
    console.log('🎓 Student Success Hub loaded successfully!');
});

// ============================================================================
// 9. UTILITY FUNCTIONS
// ============================================================================

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Log current page info
window.addEventListener('load', function() {
    const pageInfo = {
        page: getCurrentPageFromURL(),
        timestamp: new Date().toISOString(),
        tasksLoaded: localStorage.getItem('studentSuccessHubTasks') ? true : false
    };
    console.log('📊 Page Info:', pageInfo);
});

// Save todo progress to localStorage when user navigates away
window.addEventListener('beforeunload', function() {
    if (window.taskManager) {
        window.taskManager.saveTasks();
    }
});
