// ===========================
// GLASSMORPHIC UI/UX JAVASCRIPT
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initSidebar();
    initThemeToggle();
    initNavigation();
    initSearchBar();
    initResponsive();
    
    console.log('✨ Glassmorphic UI Initialized');
});

// ===========================
// SIDEBAR FUNCTIONALITY
// ===========================

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (!sidebar || !toggleBtn) return;
    
    // Toggle sidebar collapse
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        
        // Save state to localStorage
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    });
    
    // Restore sidebar state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
        sidebar.classList.add('collapsed');
    }
    
    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(event.target) && !toggleBtn.contains(event.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// ===========================
// THEME TOGGLE
// ===========================

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    if (!themeToggle) return;
    
    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        body.classList.add('dark-theme');
        updateThemeIcon(themeToggle, 'dark');
    }
    
    // Toggle theme
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-theme');
        
        const theme = body.classList.contains('dark-theme') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        updateThemeIcon(themeToggle, theme);
    });
}

function updateThemeIcon(toggleBtn, theme) {
    const icon = toggleBtn.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// ===========================
// NAVIGATION
// ===========================

function initNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.sidebar-nav li').forEach(li => {
                li.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.parentElement.classList.add('active');
            
            // Get the section from href
            const section = this.getAttribute('href').substring(1);
            
            // Show notification (in a real app, this would load content)
            showNotification(`Navigating to ${section}...`, 'info');
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('active');
            }
        });
    });
}

// ===========================
// SEARCH BAR
// ===========================

function initSearchBar() {
    const searchInput = document.querySelector('.search-bar input');
    
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        
        const query = e.target.value.trim();
        
        if (query.length >= 3) {
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 500); // Debounce search
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                performSearch(query);
            }
        }
    });
}

function performSearch(query) {
    console.log('Searching for:', query);
    // In a real app, this would make an API call
    showNotification(`Searching for "${query}"...`, 'info');
}

// ===========================
// RESPONSIVE BEHAVIOR
// ===========================

function initResponsive() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    
    // Handle mobile menu toggle
    if (window.innerWidth <= 768) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleResize();
        }, 250);
    });
}

function handleResize() {
    const sidebar = document.getElementById('sidebar');
    
    if (window.innerWidth > 768) {
        sidebar.classList.remove('active');
    } else {
        sidebar.classList.remove('collapsed');
    }
}

// ===========================
// NOTIFICATION SYSTEM
// ===========================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} glass-card`;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 350px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: white;
    `;
    
    // Add icon based on type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const colors = {
        success: '#43e97b',
        error: '#f5576c',
        warning: '#fa709a',
        info: '#4facfe'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type]}" style="font-size: 1.25rem; color: ${colors[type]}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===========================
// ACTION BUTTONS
// ===========================

// Initialize action buttons
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const action = this.querySelector('span').textContent;
        showNotification(`${action} clicked!`, 'success');
    });
});

// Logout button
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        showNotification('Logging out...', 'info');
        setTimeout(() => {
            // In a real app, this would redirect to login page
            console.log('User logged out');
        }, 1500);
    });
}

// Icon buttons in top bar
document.querySelectorAll('.icon-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const icon = this.querySelector('i').className;
        if (icon.includes('bell')) {
            showNotification('You have 3 new notifications', 'info');
        } else if (icon.includes('envelope')) {
            showNotification('You have 7 new messages', 'info');
        }
    });
});

// ===========================
// UTILITY FUNCTIONS
// ===========================

// Smooth scroll to element
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Debounce function
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

// Export functions for use in other scripts
window.BookPubApp = {
    showNotification,
    formatCurrency,
    formatNumber,
    debounce
};
