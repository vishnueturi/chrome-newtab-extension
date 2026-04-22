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

const DAY_TRACKER_INSTALLED_AT = "dayTrackerInstalledAt";
const DAY_TRACKER_TOTAL_DAYS = "dayTrackerTotalDays";
const DAY_TRACKER_START_DAY = "dayTrackerStartDay";
const DAY_TRACKER_START_DAY_DATE = "dayTrackerStartDayDate";
const DEFAULT_DAY_TRACKER_TOTAL = 21;
const DEFAULT_DAY_TRACKER_START = 1;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Day index based on the user's LOCAL calendar date (not UTC).
// Two timestamps in the same local calendar day return the same number,
// so it auto-increments exactly at local 00:00.
function getLocalDayNumber(date = new Date()) {
    return Math.floor(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY
    );
}

// Milliseconds remaining until the next local midnight (00:00:00.000).
function msUntilNextLocalMidnight(now = new Date()) {
    const next = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0, 0
    );
    return next.getTime() - now.getTime();
}

function normalizeTotalDays(raw) {
    const n = parseInt(String(raw).trim(), 10);
    if (!Number.isFinite(n) || n < 1) return DEFAULT_DAY_TRACKER_TOTAL;
    return Math.min(9999, n);
}

function normalizeStartDay(raw) {
    const n = parseInt(String(raw).trim(), 10);
    if (!Number.isFinite(n) || n < 1) return DEFAULT_DAY_TRACKER_START;
    return Math.min(9999, n);
}

// Open settings panel
function openSettingsPanel() {
    const panel = document.getElementById("settings-panel");
    const overlay = document.getElementById("overlay");
    const greetingInput = document.getElementById("greeting-input");
    const totalDaysInput = document.getElementById("total-days-input");
    const startDayInput = document.getElementById("start-day-input");
    const header = document.getElementById("header");
    
    // Close apps menu if open
    closeAppsMenu();
    
    // Populate input with current greeting
    const currentGreeting = localStorage.getItem("greeting") || "Hello World!";
    greetingInput.value = currentGreeting;

    chrome.storage.local.get([DAY_TRACKER_TOTAL_DAYS, DAY_TRACKER_START_DAY], (data) => {
        const v = data[DAY_TRACKER_TOTAL_DAYS];
        totalDaysInput.value =
            v != null && Number.isFinite(v) && v >= 1 ? String(v) : String(DEFAULT_DAY_TRACKER_TOTAL);
        
        const s = data[DAY_TRACKER_START_DAY];
        startDayInput.value =
            s != null && Number.isFinite(s) && s >= 1 ? String(s) : String(DEFAULT_DAY_TRACKER_START);
    });
    
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

// Save greeting and day-tracker settings from panel
function saveGreeting() {
    const greetingInput = document.getElementById("greeting-input");
    const totalDaysInput = document.getElementById("total-days-input");
    const startDayInput = document.getElementById("start-day-input");
    const newGreeting = greetingInput.value.trim();
    const totalDays = normalizeTotalDays(totalDaysInput.value);
    const startDay = normalizeStartDay(startDayInput.value);
    const startDayDate = getLocalDayNumber();

    dayTrackerState.totalDays = totalDays;
    dayTrackerState.startDay = startDay;
    dayTrackerState.startDayDate = startDayDate;
    chrome.storage.local.set({ [DAY_TRACKER_TOTAL_DAYS]: totalDays, [DAY_TRACKER_START_DAY]: startDay, [DAY_TRACKER_START_DAY_DATE]: startDayDate }, refreshDayTrackerDisplay);

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
    }

    closeSettingsPanel();
}

let dayTrackerState = {
    installedAt: null,
    totalDays: DEFAULT_DAY_TRACKER_TOTAL,
    startDay: DEFAULT_DAY_TRACKER_START,
    startDayDate: null,
};

function dayNumberFromInstall(installedAtMs) {
    // Calendar-day diff between install date and today, both in local time.
    return getLocalDayNumber() - getLocalDayNumber(new Date(installedAtMs)) + 1;
}

function computeCurrentDayNumber() {
    if (dayTrackerState.installedAt == null) return null;
    if (dayTrackerState.startDay != null && dayTrackerState.startDayDate != null) {
        const daysSinceStart = getLocalDayNumber() - dayTrackerState.startDayDate;
        return dayTrackerState.startDay + daysSinceStart;
    }
    return dayNumberFromInstall(dayTrackerState.installedAt);
}

function refreshDayTrackerDisplay() {
    const dateElement = document.getElementById("date");
    if (!dateElement || dayTrackerState.installedAt == null) return;

    const dayNum = computeCurrentDayNumber();
    dateElement.textContent = `Day ${dayNum}/${dayTrackerState.totalDays}`;
}

async function ensureDayTrackerInstalledAt() {
    const data = await chrome.storage.local.get([DAY_TRACKER_INSTALLED_AT]);
    if (data[DAY_TRACKER_INSTALLED_AT] != null) {
        return data[DAY_TRACKER_INSTALLED_AT];
    }
    const now = Date.now();
    await chrome.storage.local.set({ [DAY_TRACKER_INSTALLED_AT]: now });
    return now;
}

async function loadDayTrackerState() {
    const installedAt = await ensureDayTrackerInstalledAt();
    const rest = await chrome.storage.local.get([DAY_TRACKER_TOTAL_DAYS, DAY_TRACKER_START_DAY, DAY_TRACKER_START_DAY_DATE]);
    let total = rest[DAY_TRACKER_TOTAL_DAYS];
    let start = rest[DAY_TRACKER_START_DAY];
    let startDate = rest[DAY_TRACKER_START_DAY_DATE];
    
    if (total == null || !Number.isFinite(total) || total < 1) {
        total = DEFAULT_DAY_TRACKER_TOTAL;
        await chrome.storage.local.set({ [DAY_TRACKER_TOTAL_DAYS]: total });
    } else {
        total = Math.min(9999, total);
    }
    
    if (start == null || !Number.isFinite(start) || start < 1) {
        start = DEFAULT_DAY_TRACKER_START;
        startDate = null;
    } else {
        start = Math.min(9999, start);
    }
    
    dayTrackerState = { installedAt, totalDays: total, startDay: start, startDayDate: startDate };
}

// Day tracker: counts in the user's LOCAL calendar; auto-increments at local 00:00.
async function initializeDayTracker() {
    await loadDayTrackerState();
    refreshDayTrackerDisplay();

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "local") return;
        if (changes[DAY_TRACKER_INSTALLED_AT] || changes[DAY_TRACKER_TOTAL_DAYS] || changes[DAY_TRACKER_START_DAY] || changes[DAY_TRACKER_START_DAY_DATE]) {
            loadDayTrackerState().then(() => {
                refreshDayTrackerDisplay();
                lastShownDay = computeCurrentDayNumber();
            });
        }
    });

    let lastShownDay = computeCurrentDayNumber();
    let midnightTimer = null;

    function updateIfNeeded() {
        const currentDay = computeCurrentDayNumber();
        if (currentDay !== lastShownDay) {
            lastShownDay = currentDay;
            refreshDayTrackerDisplay();
        }
    }

    // Schedule a one-shot timer that fires at the next local midnight,
    // updates the display, then re-schedules itself for the following midnight.
    // A small +1s buffer guards against early-fire timer drift.
    function scheduleMidnightTick() {
        if (midnightTimer != null) clearTimeout(midnightTimer);
        const delay = msUntilNextLocalMidnight() + 1000;
        midnightTimer = setTimeout(() => {
            updateIfNeeded();
            scheduleMidnightTick();
        }, delay);
    }

    // Catch DST shifts, system clock changes, or laptop wake-from-sleep:
    // re-check whenever the tab becomes visible again.
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            updateIfNeeded();
            scheduleMidnightTick();
        }
    });

    scheduleMidnightTick();
}

// --- Apps Menu Implementation ---

const BUILTIN_APPS = [
    
    { name: 'Drive', url: 'https://drive.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg' },
    
    
    { name: 'Maps', url: 'https://maps.google.com/', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg' },
    
    
];

// Merged list of all apps (builtin + custom). Custom apps are loaded from storage.
let ALL_APPS = [...BUILTIN_APPS];
let customApps = []; // { name, url, icon, type: 'custom' }

// Default first 8 apps are favorites (leaving room for Add New)
const DEFAULT_FAVORITES = BUILTIN_APPS.slice(0, 8).map(a => a.name);

// State
let favoritesOrder = []; // names of favorite apps in order
let isEditMode = false;
let isRemoveMode = false;
let removeSelection = new Set(); // names of apps marked for bulk removal
let dragSrcIndex = null;
let dragPlaceholderIndex = null;
let preEditFavorites = [];

// Phase derivation: remove mode is always entered from edit mode.
function getMenuPhase() {
    if (isRemoveMode) return 'remove';
    if (isEditMode) return 'edit';
    return 'normal';
}

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

// Single source of truth for the "no logo available" state.
// Always renders the same modern default: Material Symbols "language" glyph
// in a tonal M3 squircle. Called from custom-app `onerror` / size-fallback.
function applyDefaultAppLogo(iconWrap, img) {
    if (img && img.parentNode) img.remove();
    iconWrap.classList.remove('app-icon-custom--letter');
    iconWrap.classList.add('app-icon-custom--fallback');
    iconWrap.style.backgroundColor = '';
    iconWrap.innerHTML =
        '<span class="material-symbols-outlined app-icon-fallback-glyph" aria-hidden="true">language</span>';
}

function createAppIcon(app) {
    if (app.type === 'initial') {
        const iconWrap = document.createElement('div');
        iconWrap.className = 'app-icon-initial';
        iconWrap.textContent = app.icon;
        return iconWrap;
    } else if (app.type === 'custom') {
        // Custom: try a real favicon; on failure (or low-quality result) swap
        // in ONE consistent modern default logo (M3 "language" glyph on a
        // tonal squircle). Single source of truth — see applyDefaultAppLogo().
        const iconWrap = document.createElement('div');
        iconWrap.className = 'app-icon-custom';
        const img = document.createElement('img');
        // Use Google's faviconV2 endpoint with `fallback_opts=TYPE,SIZE,URL` —
        // when the site has no real favicon this returns 404 instead of
        // Google's pixelated default-globe, so our onerror branch fires.
        img.src = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(app.url)}&size=64`;
        img.alt = app.name;
        img.draggable = false;
        img.className = 'app-icon-custom-img';
        img.referrerPolicy = 'no-referrer';
        const useDefault = () => applyDefaultAppLogo(iconWrap, img);
        img.onerror = useDefault;
        img.onload = () => {
            // Defensive: if a real favicon comes back tiny (< 24px), it'll
            // look pixelated when scaled — treat it as missing and fall back.
            if (!img.naturalWidth || img.naturalWidth < 24) useDefault();
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

function createAppItem(app, phase) {
    const isCustom = app.type === 'custom';
    let item;

    if (phase === 'normal') {
        item = document.createElement('a');
        item.href = app.url;
        item.target = '_self';
    } else {
        item = document.createElement('div');
    }
    item.className = 'app-item';
    item.dataset.name = app.name;

    if (phase === 'edit') {
        if (isCustom) {
            item.classList.add('app-item-editable');
            item.title = `Edit ${app.name}`;
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            const openEdit = (e) => {
                e.stopPropagation();
                openShortcutModal({ mode: 'edit', app });
            };
            item.addEventListener('click', openEdit);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openEdit(e);
                }
            });
        } else {
            // Built-in apps are inert in edit mode (no editable data).
            item.title = app.name;
            item.classList.add('app-item-inert');
        }
    } else if (phase === 'remove') {
        const isSelected = removeSelection.has(app.name);
        item.classList.add('app-item-selectable');
        if (isSelected) item.classList.add('app-item-selected');
        item.title = isSelected ? `Deselect ${app.name}` : `Select ${app.name}`;
        item.setAttribute('role', 'checkbox');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-checked', String(isSelected));
        const toggle = (e) => {
            e.stopPropagation();
            toggleRemoveSelection(app.name);
        };
        item.addEventListener('click', toggle);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle(e);
            }
        });
    } else {
        item.title = app.name;
    }

    // Icon container wrapper (needed for badge positioning)
    const iconContainer = document.createElement('div');
    iconContainer.className = 'app-icon-container';
    iconContainer.appendChild(createAppIcon(app));

    if (phase === 'edit' && isCustom) {
        const editBadge = document.createElement('button');
        editBadge.className = 'app-edit-badge';
        editBadge.type = 'button';
        editBadge.setAttribute('aria-label', `Edit ${app.name}`);
        editBadge.innerHTML = '<span class="material-symbols-outlined">edit</span>';
        editBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            openShortcutModal({ mode: 'edit', app });
        });
        iconContainer.appendChild(editBadge);
    } else if (phase === 'remove') {
        const checkbox = document.createElement('span');
        const isSelected = removeSelection.has(app.name);
        checkbox.className = 'app-select-checkbox' + (isSelected ? ' app-select-checkbox--checked' : '');
        checkbox.setAttribute('aria-hidden', 'true');
        if (isSelected) {
            // Inline SVG checkmark — independent of Material Symbols font axes,
            // uses currentColor so it picks up the right contrast color from CSS.
            checkbox.innerHTML =
                '<svg class="app-select-checkbox-mark" viewBox="0 0 24 24" focusable="false" aria-hidden="true">' +
                '<path d="M9.55 17.575 4.225 12.25l1.425-1.425 3.9 3.9 8.825-8.825 1.4 1.45Z"/>' +
                '</svg>';
        }
        iconContainer.appendChild(checkbox);
    }

    item.appendChild(iconContainer);

    const span = document.createElement('span');
    const displayName = app.name.length > 9 ? app.name.slice(0, 8) + '\u2026' : app.name;
    span.textContent = displayName;
    item.appendChild(span);

    return item;
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

    const phase = getMenuPhase();

    // --- Header ---
    const header = dropdown.querySelector('.apps-dropdown-header');
    header.innerHTML = '';
    header.dataset.phase = phase;

    if (phase === 'remove') {
        renderRemoveModeHeader(header);
    } else {
        renderEditableHeader(header, phase);
    }

    // --- Grid ---
    const grid = document.getElementById('apps-grid');
    grid.innerHTML = '';
    grid.classList.toggle('edit-mode', phase === 'edit');
    grid.classList.toggle('remove-mode', phase === 'remove');

    const favorites = getFavoriteApps();

    if (phase === 'normal') {
        favorites.forEach(app => {
            grid.appendChild(createAppItem(app, 'normal'));
        });
    } else {
        favorites.forEach((app, idx) => {
            const item = createAppItem(app, phase);
            item.dataset.idx = idx;
            // Staggered badge / checkbox appearance
            item.style.setProperty('--badge-delay', `${idx * 30}ms`);
            grid.appendChild(item);
        });
        if (phase === 'edit') {
            grid.appendChild(createAddNewItem());
        }
    }
}

function renderEditableHeader(header, phase) {
    const titleSpan = document.createElement('span');
    titleSpan.className = 'apps-header-title';
    titleSpan.textContent = 'Apps';

    const actions = document.createElement('div');
    actions.className = 'apps-header-actions';

    if (phase === 'edit') {
        const removeBtn = document.createElement('button');
        removeBtn.id = 'apps-remove-btn';
        removeBtn.type = 'button';
        removeBtn.className = 'icon-btn apps-header-icon-btn';
        removeBtn.title = 'Remove shortcuts';
        removeBtn.setAttribute('aria-label', 'Remove shortcuts');
        removeBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            enterRemoveMode();
        });
        actions.appendChild(removeBtn);
    }

    const editBtn = document.createElement('button');
    editBtn.id = 'apps-edit-btn';
    editBtn.type = 'button';
    editBtn.className = 'icon-btn apps-header-icon-btn edit-btn' + (phase === 'edit' ? ' edit-btn-active' : '');
    editBtn.title = phase === 'edit' ? 'Done editing' : 'Edit shortcuts';
    editBtn.setAttribute('aria-label', editBtn.title);
    editBtn.innerHTML = '<span class="material-symbols-outlined">edit</span>';
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (phase === 'edit') commitEditMode();
        else enterEditMode();
    });
    actions.appendChild(editBtn);

    header.appendChild(titleSpan);
    header.appendChild(actions);
}

function renderRemoveModeHeader(header) {
    const count = removeSelection.size;

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'apps-text-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        exitRemoveMode();
    });

    const counter = document.createElement('span');
    counter.className = 'apps-remove-counter';
    counter.textContent = count === 0 ? 'Select shortcuts' : `${count} selected`;

    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'apps-filled-btn apps-filled-btn-danger';
    confirmBtn.textContent = count > 0 ? `Remove (${count})` : 'Remove';
    confirmBtn.disabled = count === 0;
    confirmBtn.setAttribute('aria-label', count > 0 ? `Remove ${count} selected shortcuts` : 'Remove');
    confirmBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        confirmBulkRemove();
    });

    header.appendChild(cancelBtn);
    header.appendChild(counter);
    header.appendChild(confirmBtn);
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
    isRemoveMode = false;
    removeSelection = new Set();
    renderAppsMenu();
}

function cancelEditMode() {
    favoritesOrder = [...preEditFavorites];
    isEditMode = false;
    isRemoveMode = false;
    removeSelection = new Set();
    renderAppsMenu();
}

function commitEditMode() {
    saveFavorites();
    isEditMode = false;
    isRemoveMode = false;
    removeSelection = new Set();
    renderAppsMenu();
}

// ---------- Bulk Remove Mode ----------
function enterRemoveMode() {
    removeSelection = new Set();
    isRemoveMode = true;
    renderAppsMenu();
}

function exitRemoveMode() {
    removeSelection = new Set();
    isRemoveMode = false;
    // Stay in edit mode (the user came from there).
    renderAppsMenu();
}

function toggleRemoveSelection(name) {
    if (removeSelection.has(name)) removeSelection.delete(name);
    else removeSelection.add(name);
    renderAppsMenu();
}

function confirmBulkRemove() {
    if (removeSelection.size === 0) return;
    const names = Array.from(removeSelection);

    // Trigger removal animation on selected items
    const items = Array.from(document.querySelectorAll('#apps-grid .app-item'));
    items.forEach(itemEl => {
        if (names.includes(itemEl.dataset.name)) {
            itemEl.classList.add('removing');
        }
    });

    // After animation, commit deletions
    setTimeout(() => {
        names.forEach(name => {
            const idx = customApps.findIndex(a => a.name === name && a.type === 'custom');
            if (idx !== -1) customApps.splice(idx, 1);
        });
        ALL_APPS = [...BUILTIN_APPS, ...customApps];
        saveCustomApps();
        favoritesOrder = favoritesOrder.filter(n => !names.includes(n));
        preEditFavorites = preEditFavorites.filter(n => !names.includes(n));
        saveFavorites();

        const count = names.length;
        removeSelection = new Set();
        isRemoveMode = false;
        // Remain in edit mode so the user can keep editing.
        renderAppsMenu();
        showSnackbar(`Removed ${count} shortcut${count === 1 ? '' : 's'}.`);
    }, 250);
}

// ---------- Shortcut Modal (Add / Edit) ----------
function openAddShortcutModal() {
    openShortcutModal({ mode: 'add' });
}

function openShortcutModal({ mode = 'add', app = null } = {}) {
    const isEdit = mode === 'edit' && app && app.type === 'custom';

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
    title.textContent = isEdit ? 'Edit Shortcut' : 'Add Favorite Shortcut';

    // Site Name field
    const nameGroup = buildTextField('modal-site-name', 'Site Name', 'e.g., My Site', 'text');
    const nameInput = nameGroup.querySelector('input');

    // URL field
    const urlGroup = buildTextField('modal-url', 'URL', 'https://...', 'url');
    const urlInput = urlGroup.querySelector('input');
    const helperText = document.createElement('span');
    helperText.className = 'modal-field-helper';
    urlGroup.appendChild(helperText);

    // Pre-fill in edit mode
    if (isEdit) {
        nameInput.value = app.name;
        urlInput.value = app.url;
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'modal-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-btn-cancel';
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', closeAddShortcutModal);

    const submitBtn = document.createElement('button');
    submitBtn.className = 'modal-btn-add';
    submitBtn.type = 'button';
    submitBtn.textContent = isEdit ? 'Save' : 'Add';
    submitBtn.id = 'modal-add-btn';

    // Validation
    function validate() {
        const trimmedName = nameInput.value.trim();
        const nameOk = trimmedName.length >= 1;
        let urlOk = false;
        try {
            const v = urlInput.value.trim();
            const u = new URL(/^https?:\/\//i.test(v) ? v : 'https://' + v);
            urlOk = (u.protocol === 'http:' || u.protocol === 'https:') && v.length > 0;
        } catch (_) {}

        let dirty = true;
        if (isEdit) {
            const normalizedUrl = (() => {
                const v = urlInput.value.trim();
                return /^https?:\/\//i.test(v) ? v : 'https://' + v;
            })();
            dirty = trimmedName !== app.name || normalizedUrl !== app.url;
        }

        submitBtn.disabled = !(nameOk && urlOk && dirty);
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

    // Initial validation (disables button if nothing changed in edit mode)
    submitBtn.disabled = true;
    validate();

    // Enter key on either field submits if valid, or advances focus
    function handleEnterKey(e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        if (!submitBtn.disabled) {
            submitBtn.click();
        } else if (e.currentTarget === nameInput) {
            // Advance to URL field if name is the only thing filled
            urlInput.focus();
        }
    }
    nameInput.addEventListener('keydown', handleEnterKey);
    urlInput.addEventListener('keydown', handleEnterKey);

    submitBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        let url = urlInput.value.trim();
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        if (isEdit) {
            updateCustomShortcut(app.name, name, url);
            closeAddShortcutModal();
            showSnackbar(`"${name}" updated.`);
        } else {
            addCustomShortcut(name, url);
            closeAddShortcutModal();
            showSnackbar(`"${name}" added to your shortcuts!`);
        }
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(submitBtn);

    dialog.append(title, nameGroup, urlGroup, actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Scrim click closes
    overlay.addEventListener('click', closeAddShortcutModal);

    // Animate in
    requestAnimationFrame(() => overlay.classList.add('modal-overlay-active'));

    // Auto-focus first field; in edit mode, place cursor at end of name
    setTimeout(() => {
        nameInput.focus();
        if (isEdit) {
            const len = nameInput.value.length;
            try { nameInput.setSelectionRange(len, len); } catch (_) {}
        }
    }, 50);
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

function updateCustomShortcut(originalName, newName, newUrl) {
    const idx = customApps.findIndex(a => a.name === originalName && a.type === 'custom');
    if (idx === -1) return false;

    const trimmedName = String(newName || '').trim();
    if (!trimmedName) return false;

    // Prevent collision with another existing app's name (built-in or other custom)
    const nameChanged = trimmedName !== originalName;
    if (nameChanged && ALL_APPS.some(a => a.name === trimmedName)) {
        showSnackbar(`A shortcut named "${trimmedName}" already exists.`);
        return false;
    }

    customApps[idx] = { ...customApps[idx], name: trimmedName, url: newUrl };
    ALL_APPS = [...BUILTIN_APPS, ...customApps];
    saveCustomApps();

    // Keep favorites order in sync if the name changed
    if (nameChanged) {
        const favIdx = favoritesOrder.indexOf(originalName);
        if (favIdx !== -1) {
            favoritesOrder[favIdx] = trimmedName;
            saveFavorites();
        }
        // Mirror the rename into the pre-edit snapshot so cancel/commit stays consistent
        const preIdx = preEditFavorites.indexOf(originalName);
        if (preIdx !== -1) preEditFavorites[preIdx] = trimmedName;
    }

    renderAppsMenu();
    return true;
}

// Single-app delete API. Currently used only as a fallback / utility; the
// in-UI removal flow uses the bulk-select "Remove" mode.
function deleteCustomShortcut(name) {
    const before = customApps.length;
    customApps = customApps.filter(a => !(a.name === name && a.type === 'custom'));
    if (customApps.length === before) {
        // Not a custom app — just drop it from favorites.
        removeFromFavorites(name);
        return;
    }
    ALL_APPS = [...BUILTIN_APPS, ...customApps];
    saveCustomApps();
    favoritesOrder = favoritesOrder.filter(n => n !== name);
    preEditFavorites = preEditFavorites.filter(n => n !== name);
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
        }
        if (isRemoveMode) {
            isRemoveMode = false;
            removeSelection = new Set();
        }
        renderAppsMenu();
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
        // Auto-commit edit mode changes; bulk-remove pending selection is discarded.
        let needsRender = false;
        if (isRemoveMode) {
            isRemoveMode = false;
            removeSelection = new Set();
            needsRender = true;
        }
        if (isEditMode) {
            saveFavorites();
            isEditMode = false;
            needsRender = true;
        }
        if (needsRender) renderAppsMenu();
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
    void initializeDayTracker();
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
    const totalDaysInput = document.getElementById("total-days-input");
    greetingInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            saveGreeting();
        }
    });
    totalDaysInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            saveGreeting();
        }
    });
});
