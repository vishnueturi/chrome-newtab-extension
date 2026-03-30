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
    document.body.classList.add("popup-open", "settings-open");
    
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
    document.body.classList.remove("popup-open", "settings-open");
}

// Save greeting from panel
function saveGreeting() {
    const greetingInput = document.getElementById("greeting-input");
    const newGreeting = greetingInput.value.trim();
    
    if (newGreeting !== "") {
        localStorage.setItem("greeting", newGreeting);
        const helloEl = document.getElementById("hello-world");
        helloEl.textContent = newGreeting;
        helloEl.classList.remove("greeting-refresh");
        void helloEl.offsetWidth;
        helloEl.classList.add("greeting-refresh");
        helloEl.addEventListener(
            "animationend",
            () => helloEl.classList.remove("greeting-refresh"),
            { once: true }
        );
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

const BUILTIN_APPS = [
    { name: 'Account', url: 'https://myaccount.google.com/', icon: 'V', type: 'initial' },
    { name: 'Drive', url: 'https://drive.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg' },
    { name: 'Business', url: 'https://business.google.com/', icon: 'https://www.gstatic.com/images/branding/product/1x/business_profile_48dp.png' },
    { name: 'Gmail', url: 'https://mail.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg' },
    { name: 'YouTube', url: 'https://www.youtube.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
    { name: 'Photos', url: 'https://photos.google.com/', icon: 'https://www.gstatic.com/images/branding/product/1x/photos_48dp.png' },
    { name: 'Gemini', url: 'https://gemini.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg' },
    { name: 'Maps', url: 'https://maps.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg' },
    { name: 'Calendar', url: 'https://calendar.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg' },
    { name: 'Search', url: 'https://www.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' },
    { name: 'News', url: 'https://news.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Google_News_icon.svg' },
    { name: 'Meet', url: 'https://meet.google.com/', icon: 'https://www.gstatic.com/images/branding/product/1x/meet_48dp.png' },
    { name: 'Translate', url: 'https://translate.google.com/', icon: 'https://www.gstatic.com/images/branding/product/1x/translate_48dp.png' },
    { name: 'Docs', url: 'https://docs.google.com/', icon: 'https://www.gstatic.com/images/branding/product/1x/docs_48dp.png' },
    { name: 'Sheets', url: 'https://sheets.google.com/', icon: 'https://www.gstatic.com/images/branding/product/1x/sheets_48dp.png' },
];

// Merged list of all apps (builtin + custom). Custom apps are loaded from storage.
let ALL_APPS = [...BUILTIN_APPS];
let customApps = []; // { name, url, icon, type: 'custom' }

// Default first 8 apps are favorites (leaving room for Add New)
const DEFAULT_FAVORITES = BUILTIN_APPS.slice(0, 8).map(a => a.name);

// State
let favoritesOrder = []; // names of favorite apps in order
let isEditMode = false;
let dragSrcIndex = null;
let dragPlaceholderIndex = null;
let preEditFavorites = [];

function loadCustomApps() {
    try {
        const saved = localStorage.getItem('apps_custom');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                customApps = parsed;
                ALL_APPS = [...BUILTIN_APPS, ...customApps];
            }
        }
    } catch (_) {}
}

function saveCustomApps() {
    localStorage.setItem('apps_custom', JSON.stringify(customApps));
}

function loadFavorites() {
    loadCustomApps();
    try {
        const saved = localStorage.getItem('apps_favorites');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Filter out any names no longer valid
                favoritesOrder = parsed.filter(n => ALL_APPS.some(a => a.name === n));
                if (favoritesOrder.length > 0) return;
            }
        }
    } catch (_) {}
    favoritesOrder = [...DEFAULT_FAVORITES];
}

function saveFavorites() {
    localStorage.setItem('apps_favorites', JSON.stringify(favoritesOrder));
}

function getAppByName(name) {
    return ALL_APPS.find(a => a.name === name);
}

function getFavoriteApps() {
    return favoritesOrder.map(n => getAppByName(n)).filter(Boolean);
}

function getNonFavoriteApps() {
    return ALL_APPS.filter(a => !favoritesOrder.includes(a.name));
}

// ---------- Letter Avatar fallback for custom apps ----------
const AVATAR_COLORS = [
    '#6442D6', '#E53935', '#00897B', '#1E88E5', '#F4511E',
    '#8E24AA', '#00ACC1', '#43A047', '#FB8C00', '#C62828'
];

function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function createAppIcon(app) {
    if (app.type === 'initial') {
        const iconWrap = document.createElement('div');
        iconWrap.className = 'app-icon-initial';
        iconWrap.textContent = app.icon;
        return iconWrap;
    } else if (app.type === 'custom') {
        // Custom: show favicon naturally; fall back to letter avatar circle only on error
        const iconWrap = document.createElement('div');
        iconWrap.className = 'app-icon-custom';
        // Try favicon first — no background/circle until we know it fails
        const img = document.createElement('img');
        img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(app.url)}&sz=64`;
        img.alt = app.name;
        img.draggable = false;
        img.className = 'app-icon-custom-img';
        img.onerror = () => {
            // Favicon unavailable: switch to letter-avatar style
            img.remove();
            iconWrap.style.backgroundColor = getAvatarColor(app.name);
            iconWrap.classList.add('app-icon-custom--letter');
            const letter = document.createElement('span');
            letter.textContent = app.name.charAt(0).toUpperCase();
            iconWrap.appendChild(letter);
        };
        iconWrap.appendChild(img);
        return iconWrap;
    } else {
        const img = document.createElement('img');
        img.src = app.icon;
        img.alt = app.name;
        img.draggable = false;
        return img;
    }
}

function createAppItem(app, showRemoveBadge) {
    const item = document.createElement(showRemoveBadge ? 'div' : 'a');
    item.className = 'app-item';
    if (!showRemoveBadge) {
        item.href = app.url;
        item.target = '_self';
    }
    item.title = app.name;
    item.dataset.name = app.name;

    // Icon container wrapper (needed for badge positioning)
    const iconContainer = document.createElement('div');
    iconContainer.className = 'app-icon-container';
    iconContainer.appendChild(createAppIcon(app));

    if (showRemoveBadge) {
        const badge = document.createElement('button');
        badge.className = 'app-remove-badge';
        badge.setAttribute('aria-label', `Remove ${app.name}`);
        badge.innerHTML = '<span class="material-symbols-outlined">close</span>';
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            animateRemoveItem(item, app.name);
        });
        iconContainer.appendChild(badge);
    }

    item.appendChild(iconContainer);

    const span = document.createElement('span');
    const displayName = app.name.length > 9 ? app.name.slice(0, 8) + '\u2026' : app.name;
    span.textContent = displayName;
    item.appendChild(span);

    return item;
}

function animateRemoveItem(itemEl, appName) {
    itemEl.classList.add('removing');
    itemEl.addEventListener('animationend', () => {
        removeFromFavorites(appName);
    }, { once: true });
}

function createAddNewItem() {
    const item = document.createElement('div');
    item.className = 'app-item app-item-add-new';
    item.id = 'add-new-shortcut-btn';
    item.title = 'Add New';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');

    const iconContainer = document.createElement('div');
    iconContainer.className = 'app-icon-container';

    const plusIcon = document.createElement('div');
    plusIcon.className = 'app-icon-add-placeholder';
    plusIcon.innerHTML = '<span class="material-symbols-outlined">add</span>';
    iconContainer.appendChild(plusIcon);
    item.appendChild(iconContainer);

    const span = document.createElement('span');
    span.textContent = 'Add New';
    item.appendChild(span);

    item.addEventListener('click', (e) => { e.stopPropagation(); openAddShortcutModal(); });
    item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAddShortcutModal(); } });
    return item;
}

function renderAppsMenu() {
    const dropdown = document.getElementById('apps-dropdown');
    if (!dropdown) return;

    // --- Header (always: title + pencil toggle) ---
    let header = dropdown.querySelector('.apps-dropdown-header');
    header.innerHTML = '';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'apps-header-title';
    titleSpan.textContent = 'Google Apps';

    const editBtn = document.createElement('button');
    editBtn.id = 'apps-edit-btn';
    editBtn.className = 'icon-btn edit-btn' + (isEditMode ? ' edit-btn-active' : '');
    editBtn.title = isEditMode ? 'Done editing' : 'Edit shortcuts';
    editBtn.innerHTML = '<span class="material-symbols-outlined">edit</span>';
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isEditMode) commitEditMode();
        else enterEditMode();
    });

    header.appendChild(titleSpan);
    header.appendChild(editBtn);

    // --- Grid ---
    const grid = document.getElementById('apps-grid');
    grid.innerHTML = '';

    const favorites = getFavoriteApps();

    if (isEditMode) {
        grid.classList.add('edit-mode');

        // Render each favorite with a remove badge
        favorites.forEach((app, idx) => {
            const item = createAppItem(app, true);
            item.dataset.idx = idx;
            // Staggered badge appearance
            item.style.setProperty('--badge-delay', `${idx * 30}ms`);
            grid.appendChild(item);
        });

        // "Add New" placeholder card
        grid.appendChild(createAddNewItem());

    } else {
        grid.classList.remove('edit-mode');
        favorites.forEach(app => {
            grid.appendChild(createAppItem(app, false));
        });
    }
}

// (renderDraggableGrid removed — edit mode now uses inline remove-badge approach per spec)

// --- Drag & Drop (Mouse) ---
let dragEl = null;
let ghostEl = null;

function onDragStart(e) {
    dragEl = e.currentTarget;
    dragSrcIndex = parseInt(dragEl.dataset.idx, 10);
    dragEl.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragSrcIndex);
    setTimeout(() => { if (dragEl) dragEl.style.opacity = '0.4'; }, 0);
}

function onDragEnd(e) {
    if (dragEl) {
        dragEl.style.opacity = '';
        dragEl.classList.remove('dragging');
    }
    document.querySelectorAll('.draggable-app-item').forEach(el => {
        el.classList.remove('drag-over');
    });
    dragEl = null;
    dragSrcIndex = null;
}

function onDragEnter(e) {
    e.preventDefault();
    const target = e.currentTarget;
    if (target !== dragEl && target.classList.contains('draggable-app-item')) {
        target.classList.add('drag-over');
    }
}

function onDragLeave(e) {
    const target = e.currentTarget;
    target.classList.remove('drag-over');
}

function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function onDrop(e) {
    e.preventDefault();
    const target = e.currentTarget;
    target.classList.remove('drag-over');
    if (!dragEl || target === dragEl) return;

    const toIdx = parseInt(target.dataset.idx, 10);
    if (isNaN(toIdx) || toIdx === dragSrcIndex) return;

    // Reorder favoritesOrder
    const moved = favoritesOrder.splice(dragSrcIndex, 1)[0];
    favoritesOrder.splice(toIdx, 0, moved);

    renderAppsMenu();
}

// --- Touch Drag Support ---
let touchDragApp = null;
let touchClone = null;
let touchOriginalIdx = null;

function onTouchStart(e) {
    const item = e.currentTarget;
    touchOriginalIdx = parseInt(item.dataset.idx, 10);
    touchDragApp = favoritesOrder[touchOriginalIdx];

    // Create a floating clone
    const rect = item.getBoundingClientRect();
    touchClone = item.cloneNode(true);
    touchClone.classList.add('touch-drag-clone');
    touchClone.style.width = rect.width + 'px';
    touchClone.style.height = rect.height + 'px';
    touchClone.style.left = rect.left + 'px';
    touchClone.style.top = rect.top + 'px';
    document.body.appendChild(touchClone);
    item.classList.add('dragging');

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
}

function onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    if (touchClone) {
        touchClone.style.left = (touch.clientX - 30) + 'px';
        touchClone.style.top = (touch.clientY - 30) + 'px';
    }
    // Highlight target
    document.querySelectorAll('.draggable-app-item').forEach(el => el.classList.remove('drag-over'));
    const elUnder = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetItem = elUnder ? elUnder.closest('.draggable-app-item') : null;
    if (targetItem && targetItem.dataset.idx !== String(touchOriginalIdx)) {
        targetItem.classList.add('drag-over');
    }
}

function onTouchEnd(e) {
    const touch = e.changedTouches[0];
    document.querySelectorAll('.draggable-app-item').forEach(el => el.classList.remove('drag-over'));

    const elUnder = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetItem = elUnder ? elUnder.closest('.draggable-app-item') : null;
    if (targetItem && targetItem.dataset.idx !== String(touchOriginalIdx)) {
        const toIdx = parseInt(targetItem.dataset.idx, 10);
        const moved = favoritesOrder.splice(touchOriginalIdx, 1)[0];
        favoritesOrder.splice(toIdx, 0, moved);
    }

    if (touchClone) { touchClone.remove(); touchClone = null; }
    document.querySelectorAll('.draggable-app-item').forEach(el => el.classList.remove('dragging'));
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);

    renderAppsMenu();
}

function addToFavorites(name) {
    if (!favoritesOrder.includes(name)) {
        favoritesOrder.push(name);
        renderAppsMenu();
    }
}

function removeFromFavorites(name) {
    favoritesOrder = favoritesOrder.filter(n => n !== name);
    saveFavorites();
    renderAppsMenu();
}

function enterEditMode() {
    preEditFavorites = [...favoritesOrder];
    isEditMode = true;
    renderAppsMenu();
}

function cancelEditMode() {
    favoritesOrder = [...preEditFavorites];
    isEditMode = false;
    renderAppsMenu();
}

function commitEditMode() {
    saveFavorites();
    isEditMode = false;
    renderAppsMenu();
}

// ---------- Add Shortcut Modal ----------
function openAddShortcutModal() {
    // Remove any existing modal
    const existing = document.getElementById('add-shortcut-modal-overlay');
    if (existing) existing.remove();

    // Build overlay
    const overlay = document.createElement('div');
    overlay.id = 'add-shortcut-modal-overlay';
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-title');

    // Build dialog
    const dialog = document.createElement('div');
    dialog.className = 'modal-dialog';
    dialog.addEventListener('click', e => e.stopPropagation());

    const title = document.createElement('h2');
    title.id = 'modal-title';
    title.className = 'modal-title';
    title.textContent = 'Add Favorite Shortcut';

    // Site Name field
    const nameGroup = buildTextField('modal-site-name', 'Site Name', 'e.g., My Site', 'text');
    const nameInput = nameGroup.querySelector('input');

    // URL field
    const urlGroup = buildTextField('modal-url', 'URL', 'https://...', 'url');
    const urlInput = urlGroup.querySelector('input');
    const helperText = document.createElement('span');
    helperText.className = 'modal-field-helper';
    urlGroup.appendChild(helperText);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'modal-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-btn-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', closeAddShortcutModal);

    const addBtn = document.createElement('button');
    addBtn.className = 'modal-btn-add';
    addBtn.textContent = 'Add';
    addBtn.disabled = true;
    addBtn.id = 'modal-add-btn';

    // Validation
    function validate() {
        const nameOk = nameInput.value.trim().length >= 1;
        let urlOk = false;
        try {
            const v = urlInput.value.trim();
            const u = new URL(/^https?:\/\//i.test(v) ? v : 'https://' + v);
            urlOk = (u.protocol === 'http:' || u.protocol === 'https:') && v.length > 0;
        } catch (_) {}
        addBtn.disabled = !(nameOk && urlOk);
        // URL helper
        if (urlInput.value.trim() && !urlOk) {
            helperText.textContent = 'Please enter a valid URL (e.g. https://example.com)';
            urlInput.classList.add('field-error');
        } else {
            helperText.textContent = '';
            urlInput.classList.remove('field-error');
        }
    }
    nameInput.addEventListener('input', validate);
    urlInput.addEventListener('input', validate);

    // Enter key on either field submits if valid, or advances focus
    function handleEnterKey(e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        if (!addBtn.disabled) {
            addBtn.click();
        } else if (e.currentTarget === nameInput) {
            // Advance to URL field if name is the only thing filled
            urlInput.focus();
        }
    }
    nameInput.addEventListener('keydown', handleEnterKey);
    urlInput.addEventListener('keydown', handleEnterKey);

    addBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        let url = urlInput.value.trim();
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        addCustomShortcut(name, url);
        closeAddShortcutModal();
        showSnackbar(`"${name}" added to your shortcuts!`);
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(addBtn);

    dialog.append(title, nameGroup, urlGroup, actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Scrim click closes
    overlay.addEventListener('click', closeAddShortcutModal);

    // Animate in
    requestAnimationFrame(() => overlay.classList.add('modal-overlay-active'));

    // Auto-focus site name
    setTimeout(() => nameInput.focus(), 50);
    document.body.classList.add("popup-open");

    // Escape closes
    overlay._escHandler = (e) => { if (e.key === 'Escape') closeAddShortcutModal(); };
    document.addEventListener('keydown', overlay._escHandler);
}

function buildTextField(id, label, placeholder, type) {
    const group = document.createElement('div');
    group.className = 'modal-field-group';

    const labelEl = document.createElement('label');
    labelEl.htmlFor = id;
    labelEl.className = 'modal-field-label';
    labelEl.textContent = label;

    const input = document.createElement('input');
    input.type = type || 'text';
    input.id = id;
    input.className = 'modal-field-input';
    input.placeholder = placeholder;
    input.autocomplete = 'off';

    group.appendChild(labelEl);
    group.appendChild(input);
    return group;
}

function closeAddShortcutModal() {
    const overlay = document.getElementById('add-shortcut-modal-overlay');
    if (!overlay) return;
    if (overlay._escHandler) document.removeEventListener('keydown', overlay._escHandler);
    overlay.classList.remove("modal-overlay-active");
    document.body.classList.remove("popup-open");
    const appsDropdown = document.getElementById("apps-dropdown");
    if (appsDropdown && appsDropdown.classList.contains("active")) {
        document.body.classList.add("popup-open");
    }
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
}

function addCustomShortcut(name, url) {
    // Avoid duplicate names
    const safeName = name;
    const app = { name: safeName, url, icon: '', type: 'custom' };
    customApps.push(app);
    ALL_APPS = [...BUILTIN_APPS, ...customApps];
    saveCustomApps();
    favoritesOrder.push(safeName);
    saveFavorites();
    renderAppsMenu();
}

function showSnackbar(message) {
    const existing = document.getElementById('apps-snackbar');
    if (existing) existing.remove();
    const sb = document.createElement('div');
    sb.id = 'apps-snackbar';
    sb.className = 'apps-snackbar';
    sb.textContent = message;
    document.body.appendChild(sb);
    requestAnimationFrame(() => sb.classList.add('apps-snackbar-visible'));
    setTimeout(() => {
        sb.classList.remove('apps-snackbar-visible');
        sb.addEventListener('transitionend', () => sb.remove(), { once: true });
    }, 3000);
}

function initializeAppsMenu() {
    loadFavorites();
    renderAppsMenu();
}

function toggleAppsMenu(event) {
    const dropdown = document.getElementById('apps-dropdown');
    const overlay = document.getElementById('overlay');
    const isActive = dropdown.classList.contains('active');

    if (isActive) {
        closeAppsMenu();
    } else {
        // Commit any in-progress edit before re-opening
        if (isEditMode) {
            saveFavorites();
            isEditMode = false;
            renderAppsMenu();
        }
        dropdown.style.display = 'flex';
        setTimeout(() => {
            dropdown.classList.add('active');
            overlay.classList.add('active');
            document.body.classList.add("popup-open", "apps-menu-open");
        }, 10);
    }

    event.stopPropagation();
}

function closeAppsMenu() {
    const dropdown = document.getElementById('apps-dropdown');
    const overlay = document.getElementById('overlay');
    if (dropdown) {
        // Auto-commit edit mode changes when user closes by clicking outside
        if (isEditMode) {
            saveFavorites();
            isEditMode = false;
            renderAppsMenu();
        }
        dropdown.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.classList.remove("popup-open", "apps-menu-open");
        
        setTimeout(() => {
            if (!dropdown.classList.contains('active')) {
                dropdown.style.display = 'none';
            }
        }, 400); // Match transition duration
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
    overlay.addEventListener("click", () => {
        closeSettingsPanel();
        closeAppsMenu();
    });
    
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
