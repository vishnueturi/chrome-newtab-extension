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
    document.getElementById("toggle-theme").checked = initialTheme === "dark";

    // Update localStorage with system theme if no saved preference exists
    if (!savedTheme) {
        localStorage.setItem("theme", systemTheme);
    }
}

// Toggle theme
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
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
    initializeDate();

    const themeToggle = document.getElementById("toggle-theme");
    themeToggle.addEventListener("change", toggleTheme);
});
