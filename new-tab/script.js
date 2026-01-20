// Detect system theme
function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Set initial theme
function initializeTheme() {
    const savedTheme = localStorage.getItem("theme");
    const systemTheme = getSystemTheme();

    const initialTheme = savedTheme || systemTheme; // Default to saved or system theme
    document.body.classList.toggle("dark", initialTheme === "dark");
    
    // Update theme toggle button icon
    updateThemeIcon();

    // Update localStorage with system theme if no saved preference exists
    if (!savedTheme) {
        localStorage.setItem("theme", systemTheme);
    }
}

// Update theme icon based on current theme
function updateThemeIcon() {
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector(".material-symbols-outlined");
        const isDarkMode = document.body.classList.contains("dark");
        // Show sun icon in dark mode, moon icon in light mode
        icon.textContent = isDarkMode ? "light_mode" : "dark_mode";
    }
}

// Toggle theme
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    updateThemeIcon();
}

// Initialize greeting
function initializeGreeting() {
    const greetingElement = document.getElementById("hello-world");
    const savedGreeting = localStorage.getItem("greeting");
    
    // Default to "Hello World!" for first-time users
    const greeting = savedGreeting || "Hello World!";
    greetingElement.textContent = greeting;
    
    // Save default greeting if not already saved
    if (!savedGreeting) {
        localStorage.setItem("greeting", greeting);
    }
}

// Open settings panel
function openSettingsPanel() {
    const panel = document.getElementById("settings-panel");
    const overlay = document.getElementById("overlay");
    const greetingInput = document.getElementById("greeting-input");
    
    // Close apps menu if open
    closeAppsMenu();
    
    // Populate input with current greeting
    const currentGreeting = localStorage.getItem("greeting") || "Hello World!";
    greetingInput.value = currentGreeting;
    
    // Open panel and overlay
    panel.classList.add("open");
    overlay.classList.add("active");
    
    // Focus on input
    setTimeout(() => greetingInput.focus(), 300);
}

// Close settings panel
function closeSettingsPanel() {
    const panel = document.getElementById("settings-panel");
    const overlay = document.getElementById("overlay");
    
    panel.classList.remove("open");
    overlay.classList.remove("active");
}

// Save greeting from panel
function saveGreeting() {
    const greetingInput = document.getElementById("greeting-input");
    const newGreeting = greetingInput.value.trim();
    
    if (newGreeting !== "") {
        localStorage.setItem("greeting", newGreeting);
        document.getElementById("hello-world").textContent = newGreeting;
        closeSettingsPanel();
    }
}

// Initialize Date
function initializeDate() {
    const dateElement = document.getElementById("date");

    // Use system's locale format for the date
    const currentDate = new Date().toLocaleDateString();
    dateElement.textContent = currentDate;

    // Optional: Allow the user to click on the date to refresh it
    dateElement.addEventListener("click", () => {
        const refreshedDate = new Date().toLocaleDateString();
        dateElement.textContent = refreshedDate;
    });
}

// --- Google Apps Menu Implementation ---

const googleApps = [
    // Option 2: Generic Blue Silhouette (Wikimedia)
    { name: 'Account', url: 'https://myaccount.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg' },
    { name: 'Gmail', url: 'https://mail.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg' },
    { name: 'Calendar', url: 'https://calendar.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg' },
    { name: 'Drive', url: 'https://drive.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg' },
    { name: 'Gemini', url: 'https://gemini.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg' },
    { name: 'YouTube', url: 'https://www.youtube.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
    { name: 'Maps', url: 'https://maps.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg' },
    { name: 'Search', url: 'https://www.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' },
    { name: 'News', url: 'https://news.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Google_News_icon.svg' },
    { name: 'Docs', url: 'https://docs.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Google_Docs_2020_Logo.svg' },
    // { name: 'Keep', url: 'https://keep.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Google_Keep_icon_%282020%29.svg' },
    // { name: 'Web Store', url: 'https://chrome.google.com/webstore', icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_Web_Store_icon_2015.svg' },
    { name: 'YT Music', url: 'https://music.youtube.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Youtube_Music_icon.svg' },
    // { name: 'NotebookLM', url: 'https://notebooklm.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Google_NotebookLM_logo.svg' },
    // { name: 'Saved', url: 'https://www.google.com/save', icon: 'https://www.gstatic.com/images/branding/product/2x/collections_48dp.png' },
    // { name: 'Earth', url: 'https://earth.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Google_Earth_logo.svg' }
];

function initializeAppsMenu() {
    const dropdown = document.getElementById('apps-dropdown');
    
    // Populate apps
    googleApps.forEach(app => {
        const link = document.createElement('a');
        link.className = 'app-item';
        link.href = app.url;
        link.target = '_blank'; // Open in new tab
        link.title = app.name;
        
        const img = document.createElement('img');
        img.src = app.icon;
        img.alt = app.name;
        img.draggable = false;
        
        const span = document.createElement('span');
        span.textContent = app.name;
        
        link.appendChild(img);
        link.appendChild(span);
        dropdown.appendChild(link);
    });
}

function toggleAppsMenu(event) {
    const dropdown = document.getElementById('apps-dropdown');
    const isActive = dropdown.style.display === 'grid';
    
    if (isActive) {
        closeAppsMenu();
    } else {
        dropdown.style.display = 'grid';
        // Add a small delay for the fade-in effect if using transitions
        setTimeout(() => dropdown.classList.add('active'), 10);
    }
    
    // Stop propagation to prevent immediate closing by document listener
    event.stopPropagation();
}

function closeAppsMenu() {
    const dropdown = document.getElementById('apps-dropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
        // Wait for transition to finish before hiding (optional, simplifies here)
        setTimeout(() => {
            if (!dropdown.classList.contains('active')) {
                dropdown.style.display = 'none';
            }
        }, 200);
    }
}

// Main initialization
document.addEventListener("DOMContentLoaded", () => {
    initializeTheme();
    initializeGreeting();
    initializeDate();
    initializeAppsMenu();

    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    themeToggleBtn.addEventListener("click", toggleTheme);
    
    const customizeBtn = document.getElementById("customize-btn");
    customizeBtn.addEventListener("click", openSettingsPanel);
    
    const closeBtn = document.getElementById("close-panel");
    closeBtn.addEventListener("click", closeSettingsPanel);
    
    const overlay = document.getElementById("overlay");
    overlay.addEventListener("click", closeSettingsPanel);
    
    const saveBtn = document.getElementById("save-greeting");
    saveBtn.addEventListener("click", saveGreeting);
    
    // Apps Menu Listeners
    const appsBtn = document.getElementById("apps-btn");
    appsBtn.addEventListener("click", toggleAppsMenu);
    
    // Close apps menu when clicking outside
    document.addEventListener("click", (event) => {
        const dropdown = document.getElementById('apps-dropdown');
        const appsBtn = document.getElementById('apps-btn');
        if (dropdown && appsBtn && !dropdown.contains(event.target) && !appsBtn.contains(event.target)) {
            closeAppsMenu();
        }
    });
    
    // Allow Enter key to save
    const greetingInput = document.getElementById("greeting-input");
    greetingInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            saveGreeting();
        }
    });
});
