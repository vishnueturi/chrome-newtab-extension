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


// Main initialization
document.addEventListener("DOMContentLoaded", () => {
    initializeTheme();
    initializeGreeting();
    initializeDate();

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
    
    // Allow Enter key to save
    const greetingInput = document.getElementById("greeting-input");
    greetingInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            saveGreeting();
        }
    });
});
