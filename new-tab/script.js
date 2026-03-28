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
function updateThemeIcon(animate = false) {
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector(".material-symbols-outlined");
        const isDarkMode = document.body.classList.contains("dark");
        
        if (animate) {
            // Remove all animation classes first
            icon.classList.remove("slide-in-from-top", "slide-out-to-top", "slide-in-from-bottom", "slide-out-to-bottom");
            
            // Add appropriate animation based on current theme
            if (isDarkMode) {
                // Switching to dark: moon comes from top (previous sun goes out to top)
                icon.classList.add("slide-in-from-top");
            } else {
                // Switching to light: sun comes from bottom (previous moon goes out to bottom)
                icon.classList.add("slide-in-from-bottom");
            }
            
            // Remove animation class after it completes so it can be triggered again
            setTimeout(() => {
                icon.classList.remove("slide-in-from-top", "slide-out-to-top", "slide-in-from-bottom", "slide-out-to-bottom");
            }, 500);
        }
        
        // Show sun icon in dark mode, moon icon in light mode
        icon.textContent = isDarkMode ? "light_mode" : "dark_mode";
        // Update title attribute based on current theme
        themeToggleBtn.title = isDarkMode ? "Switch to light mode" : "Switch to dark mode";
    }
}

// Toggle theme
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    updateThemeIcon(true); // Pass true to trigger animation
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
    const header = document.getElementById("header");
    
    // Close apps menu if open
    closeAppsMenu();
    
    // Populate input with current greeting
    const currentGreeting = localStorage.getItem("greeting") || "Hello World!";
    greetingInput.value = currentGreeting;
    
    // Open panel and overlay
    panel.classList.add("open");
    overlay.classList.add("active");
    header.classList.add("panel-open");
    
    // Focus on input
    setTimeout(() => greetingInput.focus(), 300);
}

// Close settings panel
function closeSettingsPanel() {
    const panel = document.getElementById("settings-panel");
    const overlay = document.getElementById("overlay");
    const header = document.getElementById("header");
    
    panel.classList.remove("open");
    overlay.classList.remove("active");
    header.classList.remove("panel-open");
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
    let showWeekCounter = true;
    
    function calculateWeekNumber(now) {
        const date = new Date(now);
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 4 - (date.getDay() || 7));
        const yearStart = new Date(date.getFullYear(), 0, 1);
        return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    }
    
    function calculateDayNumber(now) {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
    }
    
    function updateDateDisplay() {
        const now = new Date();
        
        if (showWeekCounter) {
            const weekNumber = calculateWeekNumber(now);
            dateElement.textContent = `Week ${weekNumber}/52`;
        } else {
            const dayNumber = calculateDayNumber(now);
            dateElement.textContent = `Day ${dayNumber}/365`;
        }
    }

    updateDateDisplay();

    // Toggle between week and day counter on click with animation
    dateElement.addEventListener("click", () => {
        dateElement.classList.add("counter-switch");
        
        setTimeout(() => {
            showWeekCounter = !showWeekCounter;
            updateDateDisplay();
            dateElement.classList.remove("counter-switch");
            dateElement.classList.add("counter-switch-in");
        }, 150);
        
        setTimeout(() => {
            dateElement.classList.remove("counter-switch-in");
        }, 450);
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
        link.target = '_self'; // Open in new tab
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

// Fallback domains for inline autocomplete when history has no match (Chrome-style)
const FALLBACK_DOMAINS = [
    { prefix: "y", host: "youtube.com" },
    { prefix: "you", host: "youtube.com" },
    { prefix: "g", host: "google.com" },
    { prefix: "go", host: "google.com" },
    { prefix: "f", host: "facebook.com" },
    { prefix: "fa", host: "facebook.com" },
    { prefix: "a", host: "amazon.com" },
    { prefix: "am", host: "amazon.com" },
    { prefix: "n", host: "netflix.com" },
    { prefix: "w", host: "wikipedia.org" },
    { prefix: "wi", host: "wikipedia.org" },
];

// Search functionality with URL-bar style suggestions
function initializeSearch() {
    const searchInput = document.getElementById("search-input");
    const suggestionsEl = document.getElementById("search-suggestions");
    const searchWrapper = document.querySelector(".search-wrapper");
    const ghostEl = document.getElementById("search-ghost");
    const ghostCompletionEl = ghostEl ? ghostEl.querySelector(".search-ghost-completion") : null;
    const inputWrap = document.querySelector(".search-input-wrap");
    const measureEl = document.getElementById("search-measure");

    let suggestionsList = [];
    let selectedIndex = -1;
    let debounceTimer = null;
    let inlineCompletion = "";
    const DEBOUNCE_MS = 150;
    const MAX_SUGGESTIONS = 8;

    function performSearch(query) {
        if (!query || !query.trim()) return;
        const q = query.trim();
        
        // Check if it looks like a URL
        if (isUrlLike(q)) {
            // If it doesn't have a protocol, add https://
            let urlToOpen = q;
            if (!/^https?:\/\//i.test(q)) {
                urlToOpen = "https://" + q;
            }
            try {
                const url = new URL(urlToOpen);
                if (url.protocol === "http:" || url.protocol === "https:") {
                    window.open(urlToOpen, "_self");
                    return;
                }
            } catch (_) {}
        }
        
        // Fall back to Google search
        const searchUrl = new URL("https://www.google.com/search");
        searchUrl.searchParams.set("q", q);
        window.open(searchUrl.toString(), "_self");
    }

    function isUrlLike(text) {
        const t = text.trim();
        // Check for:
        // 1. URLs starting with http:// or https://
        // 2. Domain names with dots (e.g., example.com, subdomain.example.co.uk)
        // 3. localhost with optional port (e.g., localhost:3000)
        // 4. IP addresses with optional port (e.g., 192.168.1.1:8080)
        if (/^https?:\/\//i.test(t)) return true;
        if (/^localhost(:\d+)?$/i.test(t)) return true;
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(t)) return true;
        if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?$/i.test(t) && t.includes(".")) return true;
        return false;
    }

    function hideSuggestions() {
        suggestionsEl.hidden = true;
        suggestionsEl.setAttribute("aria-expanded", "false");
        selectedIndex = -1;
    }

    function showSuggestions() {
        if (suggestionsList.length === 0) {
            hideSuggestions();
            return;
        }
        suggestionsEl.hidden = false;
        suggestionsEl.setAttribute("aria-expanded", "true");
        selectedIndex = -1;
        updateHighlight();
    }

    function updateHighlight() {
        const items = suggestionsEl.querySelectorAll(".search-suggestion-item");
        items.forEach((el, i) => el.setAttribute("aria-selected", i === selectedIndex));
    }

    function getFaviconUrl(pageUrl) {
        try {
            const u = new URL(pageUrl);
            return "https://www.google.com/s2/favicons?domain=" + u.hostname + "&sz=32";
        } catch (_) {
            return "";
        }
    }

    function getHostname(urlStr) {
        try {
            return new URL(urlStr).hostname.replace(/^www\./, "") || "";
        } catch (_) {
            return "";
        }
    }

    function updateInlineGhost() {
        if (!ghostCompletionEl || !inputWrap || !measureEl) return;
        if (!inlineCompletion) {
            ghostCompletionEl.textContent = "";
            inputWrap.classList.remove("has-ghost");
            return;
        }
        const value = searchInput.value;
        ghostCompletionEl.textContent = inlineCompletion;
        measureEl.textContent = value;
        const left = measureEl.offsetWidth;
        ghostEl.style.left = left + "px";
        inputWrap.classList.add("has-ghost");
    }

    function clearInlineGhost() {
        inlineCompletion = "";
        updateInlineGhost();
    }

    function pickInlineCompletion(query, list) {
        const q = (query || "").trim().toLowerCase();
        if (!q) return "";
        for (const s of list) {
            if (s.type !== "url" || !s.url) continue;
            const host = getHostname(s.url);
            if (!host) continue;
            if (host.toLowerCase().startsWith(q)) {
                const rest = host.slice(q.length);
                if (rest) return rest;
            }
        }
        for (const { prefix, host } of FALLBACK_DOMAINS) {
            if (q === prefix.toLowerCase() && host.toLowerCase().startsWith(q)) {
                const rest = host.slice(q.length);
                if (rest) return rest;
            }
        }
        return "";
    }

    function renderSuggestions(query, historyItems) {
        suggestionsList = [];
        const q = (query || "").trim().toLowerCase();

        if (q.length >= 1) {
            suggestionsList.push({
                type: "search",
                title: (query || "").trim() + " - Google Search",
                url: "",
                displayUrl: "",
            });
        }

        (historyItems || []).forEach((item) => {
            const title = item.title || getHostname(item.url) || item.url;
            const displayUrl = item.url;
            suggestionsList.push({
                type: "url",
                title,
                url: item.url,
                displayUrl,
                favicon: getFaviconUrl(item.url),
            });
        });

        const existingHosts = new Set(suggestionsList.filter((s) => s.type === "url").map((s) => getHostname(s.url).toLowerCase()));
        FALLBACK_DOMAINS.forEach(({ prefix, host }) => {
            if (q.length >= 1 && (q === prefix.toLowerCase() || host.toLowerCase().startsWith(q)) && !existingHosts.has(host.toLowerCase())) {
                suggestionsList.push({
                    type: "url",
                    title: host,
                    url: "https://" + host,
                    displayUrl: "https://" + host,
                    favicon: getFaviconUrl("https://" + host),
                });
                existingHosts.add(host.toLowerCase());
            }
        });

        inlineCompletion = pickInlineCompletion(query, suggestionsList);
        updateInlineGhost();

        suggestionsEl.innerHTML = "";
        suggestionsList.forEach((s, i) => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "search-suggestion-item";
            item.setAttribute("role", "option");
            item.setAttribute("aria-selected", "false");
            item.setAttribute("data-index", String(i));

            if (s.type === "search") {
                const icon = document.createElement("span");
                icon.className = "material-symbols-outlined search-suggestion-icon material-icon";
                icon.textContent = "search";
                item.appendChild(icon);
            } else {
                const icon = document.createElement("img");
                icon.className = "search-suggestion-icon";
                icon.src = s.favicon || "";
                icon.alt = "";
                icon.onerror = () => {
                    const fallback = document.createElement("span");
                    fallback.className = "material-symbols-outlined search-suggestion-icon material-icon";
                    fallback.textContent = "language";
                    icon.replaceWith(fallback);
                };
                item.appendChild(icon);
            }

            const content = document.createElement("div");
            content.className = "search-suggestion-content";
            const titleEl = document.createElement("span");
            titleEl.className = "search-suggestion-title";
            titleEl.textContent = s.title;
            content.appendChild(titleEl);
            if (s.displayUrl) {
                const urlEl = document.createElement("span");
                urlEl.className = "search-suggestion-url";
                urlEl.textContent = s.displayUrl;
                content.appendChild(urlEl);
            }
            item.appendChild(content);

            item.addEventListener("click", (e) => {
                e.preventDefault();
                selectSuggestion(i);
            });
            suggestionsEl.appendChild(item);
        });

        showSuggestions();
    }

    function selectSuggestion(index) {
        if (index < 0 || index >= suggestionsList.length) return;
        const s = suggestionsList[index];
        hideSuggestions();
        if (s.type === "search") {
            const query = searchInput.value.trim();
            performSearch(query || s.title.replace(" - Google Search", ""));
        } else {
            window.open(s.url, "_self");
        }
    }

    function fetchAndShowSuggestions(query) {
        const q = (query || "").trim();
        if (q.length === 0) {
            suggestionsList = [];
            hideSuggestions();
            clearInlineGhost();
            return;
        }

        if (typeof chrome !== "undefined" && chrome.history && chrome.history.search) {
            chrome.history.search(
                { text: q, maxResults: MAX_SUGGESTIONS, startTime: 0 },
                (results) => {
                    if (!results) results = [];
                    renderSuggestions(query, results);
                }
            );
        } else {
            renderSuggestions(query, []);
        }
    }

    function onInput() {
        clearTimeout(debounceTimer);
        const value = searchInput.value;
        if (!value.trim()) {
            hideSuggestions();
            clearInlineGhost();
            return;
        }
        clearInlineGhost();
        debounceTimer = setTimeout(() => fetchAndShowSuggestions(value), DEBOUNCE_MS);
    }

    function onKeydown(e) {
        if (e.key === "ArrowRight") {
            if (inlineCompletion) {
                e.preventDefault();
                searchInput.value = searchInput.value + inlineCompletion;
                clearInlineGhost();
            }
            return;
        }
        if (suggestionsEl.hidden || suggestionsList.length === 0) {
            if (e.key === "Enter") performSearch(searchInput.value);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % suggestionsList.length;
            updateHighlight();
            suggestionsEl.querySelectorAll(".search-suggestion-item")[selectedIndex]?.scrollIntoView({ block: "nearest" });
            return;
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            selectedIndex = selectedIndex <= 0 ? suggestionsList.length - 1 : selectedIndex - 1;
            updateHighlight();
            suggestionsEl.querySelectorAll(".search-suggestion-item")[selectedIndex]?.scrollIntoView({ block: "nearest" });
            return;
        }
        if (e.key === "Enter") {
            e.preventDefault();
            selectSuggestion(selectedIndex >= 0 ? selectedIndex : 0);
            return;
        }
        if (e.key === "Escape") {
            e.preventDefault();
            hideSuggestions();
            clearInlineGhost();
            searchInput.focus();
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", onInput);
        searchInput.addEventListener("keydown", onKeydown);
        searchInput.addEventListener("focus", () => {
            if (searchInput.value.trim() && suggestionsList.length > 0) showSuggestions();
        });
    }

    document.addEventListener("click", (e) => {
        if (searchWrapper && !searchWrapper.contains(e.target)) hideSuggestions();
    });
}

// Main initialization
document.addEventListener("DOMContentLoaded", () => {
    initializeTheme();
    initializeGreeting();
    initializeDate();
    initializeAppsMenu();
    initializeSearch();

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
