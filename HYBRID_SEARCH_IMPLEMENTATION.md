# Hybrid Search Bar Implementation Guide

## Overview
This document provides a phase-wise implementation guide for building a hybrid search bar with Google, YouTube, and Perplexity AI integration. The search bar follows Material Design 3 principles and supports real-time suggestions with same-tab redirects.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SEARCH BAR CONTAINER                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [🔍] [━━ Search Input ━━] [⚡AI]                         │
│        ├─ Suggestions Dropdown                             │
│        ├─ Google Results                                   │
│        ├─ YouTube Results                                  │
│        └─ Perplexity Results                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

STATE MACHINE:
┌─────────┐      cycle()      ┌─────────┐      cycle()      ┌─────┐
│ GOOGLE  │────────────────>  │ YOUTUBE │────────────────>  │  AI │
│  (🔍)   │                   │  (▶️)   │                   │ (⚡)│
└─────────┘  <────────────────  └─────────┘  <────────────────  └─────┘
              cycle()                             cycle()
```

---

## Phase-Wise Implementation

### PHASE 1: HTML Structure (Foundation)

**File**: `new-tab/index.html`

**Goal**: Create semantic HTML structure with proper accessibility

```html
<!-- Replace existing search container with new structure -->
<div id="search-container" class="search-container">
  <!-- Left Engine Switcher -->
  <button 
    id="engine-switcher-btn" 
    class="engine-switcher-btn" 
    title="Switch search engine (G, Y, A)"
    aria-label="Search engine switcher"
  >
    <svg id="engine-icon" class="engine-icon" viewBox="0 0 24 24" width="24" height="24">
      <!-- Google icon will be injected by JS -->
    </svg>
  </button>

  <!-- Search Input Wrapper -->
  <div class="search-input-wrapper">
    <span class="material-symbols-outlined search-icon">search</span>
    <input 
      type="text" 
      id="search-input" 
      class="search-input" 
      placeholder="Search Google or type a URL"
      autocomplete="off"
      spellcheck="false"
      aria-label="Search input"
    />
    <!-- Suggestions Dropdown -->
    <div id="suggestions-dropdown" class="suggestions-dropdown" role="listbox">
      <!-- Suggestions will be injected here -->
    </div>
  </div>

  <!-- Right AI Toggle -->
  <button 
    id="ai-toggle-btn" 
    class="ai-toggle-btn" 
    title="Toggle AI Search (Perplexity)"
    aria-label="AI search toggle"
    aria-pressed="false"
  >
    <svg class="ai-icon" viewBox="0 0 24 24" width="24" height="24">
      <!-- Perplexity/Lightning icon -->
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
    </svg>
  </button>
</div>

<!-- Hidden template for suggestions -->
<template id="suggestion-item-template">
  <div class="suggestion-item" role="option">
    <span class="suggestion-icon"></span>
    <span class="suggestion-text"></span>
    <span class="suggestion-engine-indicator"></span>
  </div>
</template>
```

**Key Points**:
- Semantic HTML with ARIA labels
- Template for dynamic suggestion rendering
- Button IDs for JS hooks
- Proper role attributes for accessibility

---

### PHASE 2: CSS Styling (Material Design 3)

**File**: `new-tab/styles.css`

**Goal**: Create minimal, responsive design with light/dark theme support

```css
/* ============================================
   SEARCH BAR - HYBRID IMPLEMENTATION
   ============================================ */

/* Search Container */
.search-container {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    margin: var(--spacing-lg) auto;
    max-width: 640px;
    width: 100%;
    background: var(--md-sys-color-surface);
    border-radius: var(--border-radius-md);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    transition: box-shadow var(--transition-medium) var(--transition-easing-standard);
}

.search-container:focus-within {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

/* Dark theme */
body.dark .search-container {
    background: var(--md-sys-color-surface-container);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4);
}

body.dark .search-container:focus-within {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4), 0 3px 6px rgba(0, 0, 0, 0.5);
}

/* ---- Engine Switcher Button (Left) ---- */
.engine-switcher-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    padding: var(--spacing-sm);
    background: transparent;
    border: none;
    border-radius: var(--border-radius-md);
    color: var(--md-sys-color-on-surface);
    cursor: pointer;
    transition: all var(--transition-fast) var(--transition-easing-standard);
    flex-shrink: 0;
}

.engine-switcher-btn:hover {
    background: var(--hover-icon-bg);
}

.engine-switcher-btn:active {
    background: rgba(25, 118, 210, 0.16);
}

.engine-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
}

/* ---- Search Input Wrapper ---- */
.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 200px;
}

.search-icon {
    position: absolute;
    left: var(--spacing-md);
    color: var(--md-sys-color-on-surface);
    opacity: 0.54;
    pointer-events: none;
    font-size: 20px;
}

.search-input {
    width: 100%;
    height: 40px;
    padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 36px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--md-sys-color-on-surface);
    font-family: var(--font-family-primary);
    font-size: var(--font-size-body);
    outline: none;
    transition: border-color var(--transition-fast);
}

.search-input::placeholder {
    color: var(--opacity-placeholder-light);
}

.search-input:focus {
    border-bottom-color: var(--md-sys-color-primary);
}

body.dark .search-input::placeholder {
    color: rgba(255, 255, 255, 0.38);
}

/* ---- Suggestions Dropdown ---- */
.suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: var(--spacing-sm);
    background: var(--md-sys-color-surface);
    border-radius: var(--border-radius-md);
    box-shadow: var(--md-elevation-level-2);
    max-height: 360px;
    overflow-y: auto;
    z-index: 1000;
    display: none;
    min-width: 100%;
}

.suggestions-dropdown.active {
    display: block;
    animation: slideDown var(--transition-fast) var(--transition-easing-emphasized);
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

body.dark .suggestions-dropdown {
    background: var(--md-sys-color-surface-container-high);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Suggestion Item */
.suggestion-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    cursor: pointer;
    transition: background-color var(--transition-fast);
    border-bottom: 1px solid var(--opacity-border-light);
}

.suggestion-item:last-child {
    border-bottom: none;
}

.suggestion-item:hover {
    background-color: var(--md-sys-color-surface-container-high);
}

.suggestion-item[aria-selected="true"] {
    background-color: var(--md-sys-color-surface-container-high);
    border-left: 3px solid var(--md-sys-color-primary);
    padding-left: calc(var(--spacing-lg) - 3px);
}

body.dark .suggestion-item:hover {
    background-color: var(--md-sys-color-surface-container-highest);
}

/* Suggestion Icon (Engine indicator) */
.suggestion-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 16px;
}

/* Suggestion Text */
.suggestion-text {
    flex: 1;
    font-size: var(--font-size-body);
    color: var(--md-sys-color-on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.suggestion-engine-indicator {
    font-size: 12px;
    opacity: 0.54;
    color: var(--md-sys-color-on-surface);
    flex-shrink: 0;
}

/* ---- AI Toggle Button (Right) ---- */
.ai-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    padding: var(--spacing-sm);
    background: transparent;
    border: none;
    border-radius: var(--border-radius-md);
    color: var(--md-sys-color-on-surface);
    cursor: pointer;
    transition: all var(--transition-fast) var(--transition-easing-standard);
    flex-shrink: 0;
}

.ai-toggle-btn:hover {
    background: var(--hover-icon-bg);
}

.ai-toggle-btn[aria-pressed="true"] {
    background: rgba(156, 39, 176, 0.12);
    color: #9c27b0;
}

.ai-toggle-btn[aria-pressed="true"]:hover {
    background: rgba(156, 39, 176, 0.2);
}

.ai-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
}

/* ---- Responsive Design ---- */
@media (max-width: 640px) {
    .search-container {
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
        margin: var(--spacing-md) auto;
    }

    .search-input {
        font-size: 16px; /* Prevent zoom on iOS */
    }

    .suggestions-dropdown {
        max-height: 280px;
    }
}

/* ---- Scrollbar Styling ---- */
.suggestions-dropdown::-webkit-scrollbar {
    width: 8px;
}

.suggestions-dropdown::-webkit-scrollbar-track {
    background: transparent;
}

.suggestions-dropdown::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
}

.suggestions-dropdown::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}

body.dark .suggestions-dropdown::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
}

body.dark .suggestions-dropdown::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}
```

**Key Features**:
- Material Design 3 elevation system
- Smooth transitions and animations
- Light/dark theme support
- Responsive design
- Accessibility-ready

---

### PHASE 3: JavaScript - State Management

**File**: `new-tab/script.js` (Add to existing file)

**Goal**: Manage search engine states and suggestions

```javascript
/* ============================================
   HYBRID SEARCH BAR - STATE MANAGEMENT
   ============================================ */

// Search Engine Configuration
const searchEngineConfig = {
    google: {
        id: 'google',
        name: 'Google',
        icon: 'google',
        searchUrl: 'https://www.google.com/search?q=',
        suggestionsUrl: 'https://suggestqueries.google.com/complete/search?client=chrome&q=',
        parseFunction: 'parseGoogleSuggestions'
    },
    youtube: {
        id: 'youtube',
        name: 'YouTube',
        icon: 'youtube',
        searchUrl: 'https://www.youtube.com/results?search_query=',
        suggestionsUrl: 'https://www.youtube.com/complete/search?client=youtube&q=',
        parseFunction: 'parseYoutubeSuggestions'
    },
    perplexity: {
        id: 'perplexity',
        name: 'Perplexity AI',
        icon: 'perplexity',
        searchUrl: 'https://www.perplexity.ai?q=',
        suggestionsUrl: null, // AI doesn't use suggestions
        parseFunction: null
    }
};

// Current search state
let searchState = {
    currentEngine: 'google',
    isAIMode: false,
    inputValue: '',
    suggestions: [],
    selectedSuggestionIndex: -1,
    isDropdownVisible: false
};

// Initialize search bar
function initializeHybridSearchBar() {
    const engineSwitcherBtn = document.getElementById('engine-switcher-btn');
    const aiToggleBtn = document.getElementById('ai-toggle-btn');
    const searchInput = document.getElementById('search-input');
    const suggestionsDropdown = document.getElementById('suggestions-dropdown');

    // Engine Switcher: Cycle through engines
    engineSwitcherBtn.addEventListener('click', () => {
        cycleSearchEngine();
    });

    // AI Toggle
    aiToggleBtn.addEventListener('click', () => {
        toggleAIMode();
    });

    // Search Input: Real-time suggestions
    searchInput.addEventListener('input', (e) => {
        searchState.inputValue = e.target.value;
        handleSearchInput(e.target.value);
    });

    // Search Input: Enter key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(searchState.inputValue);
        }
        // Arrow keys for suggestion navigation
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectNextSuggestion();
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectPreviousSuggestion();
        }
    });

    // Click outside to close dropdown
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-input-wrapper')) {
            closeSuggestionsDropdown();
        }
    });

    // Keyboard shortcuts for engine switching
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'g') {
                e.preventDefault();
                setSearchEngine('google');
            } else if (e.key === 'y') {
                e.preventDefault();
                setSearchEngine('youtube');
            }
        }
    });

    // Initialize engine icon
    updateEngineIcon();
}

// Cycle through search engines
function cycleSearchEngine() {
    const engines = ['google', 'youtube', 'perplexity'];
    const currentIndex = engines.indexOf(searchState.currentEngine);
    const nextIndex = (currentIndex + 1) % engines.length;
    setSearchEngine(engines[nextIndex]);
}

// Set specific search engine
function setSearchEngine(engineId) {
    if (!searchEngineConfig[engineId]) return;
    
    searchState.currentEngine = engineId;
    searchState.isAIMode = (engineId === 'perplexity');
    updateEngineIcon();
    updateAIToggleButton();
    updateSearchInputPlaceholder();
    closeSuggestionsDropdown();
}

// Toggle AI mode
function toggleAIMode() {
    searchState.isAIMode = !searchState.isAIMode;
    
    if (searchState.isAIMode) {
        setSearchEngine('perplexity');
    } else {
        setSearchEngine('google');
    }
    
    updateAIToggleButton();
}

// Update engine icon in button
function updateEngineIcon() {
    const btn = document.getElementById('engine-switcher-btn');
    const svg = document.getElementById('engine-icon');
    const currentEngine = searchEngineConfig[searchState.currentEngine];
    
    // Clear existing SVG
    svg.innerHTML = '';
    
    // Insert appropriate icon
    if (searchState.currentEngine === 'google') {
        svg.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <text x="8" y="15" font-size="8" font-weight="bold">G</text>
            </svg>
        `;
    } else if (searchState.currentEngine === 'youtube') {
        svg.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.002h-15.23c-1.926 0-3.5 1.574-3.5 3.498v10c0 1.925 1.574 3.5 3.5 3.5h15.23c1.926 0 3.5-1.575 3.5-3.5v-10c0-1.924-1.574-3.498-3.5-3.498zm-10.738 11.374v-6.371l5.738 3.186-5.738 3.185z"/>
            </svg>
        `;
    } else if (searchState.currentEngine === 'perplexity') {
        svg.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
        `;
    }
}

// Update AI toggle button
function updateAIToggleButton() {
    const btn = document.getElementById('ai-toggle-btn');
    btn.setAttribute('aria-pressed', searchState.isAIMode ? 'true' : 'false');
}

// Update search input placeholder
function updateSearchInputPlaceholder() {
    const input = document.getElementById('search-input');
    const engine = searchEngineConfig[searchState.currentEngine];
    
    if (searchState.currentEngine === 'perplexity') {
        input.placeholder = 'Ask Perplexity AI...';
    } else if (searchState.currentEngine === 'youtube') {
        input.placeholder = 'Search YouTube...';
    } else {
        input.placeholder = 'Search Google or type a URL';
    }
}

// Handle search input (fetch suggestions)
function handleSearchInput(query) {
    if (!query.trim()) {
        closeSuggestionsDropdown();
        return;
    }

    // Don't fetch suggestions for AI mode
    if (searchState.currentEngine === 'perplexity') {
        closeSuggestionsDropdown();
        return;
    }

    // Fetch suggestions from active engine
    fetchSuggestions(query);
}

// Fetch suggestions from search engine
async function fetchSuggestions(query) {
    const engine = searchEngineConfig[searchState.currentEngine];
    
    if (!engine.suggestionsUrl) {
        closeSuggestionsDropdown();
        return;
    }

    try {
        const response = await fetch(
            `${engine.suggestionsUrl}${encodeURIComponent(query)}&output=chrome`,
            { mode: 'no-cors' }
        );
        
        // Note: CORS may block this. Alternative: use backend proxy
        // For now, show static suggestions as fallback
        displayLocalSuggestions(query);
    } catch (error) {
        console.warn('Could not fetch suggestions:', error);
        displayLocalSuggestions(query);
    }
}

// Display local/cached suggestions (fallback)
function displayLocalSuggestions(query) {
    // Local suggestion database (can be expanded)
    const localSuggestions = {
        google: [
            'GitHub',
            'Gmail',
            'Google Drive',
            'Google Meet',
            'Google Docs',
            'Google Sheets',
            'Google Keep',
            'Google Photos'
        ],
        youtube: [
            'YouTube Music',
            'YouTube Shorts',
            'YouTube Trending',
            'YouTube Subscriptions'
        ]
    };

    const suggestions = localSuggestions[searchState.currentEngine] || [];
    const filtered = suggestions.filter(s => 
        s.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length > 0) {
        showSuggestions(filtered);
    } else {
        closeSuggestionsDropdown();
    }
}

// Display suggestions in dropdown
function showSuggestions(suggestions) {
    const dropdown = document.getElementById('suggestions-dropdown');
    const template = document.getElementById('suggestion-item-template');
    
    dropdown.innerHTML = '';
    searchState.suggestions = suggestions;
    searchState.selectedSuggestionIndex = -1;

    suggestions.forEach((suggestion, index) => {
        const clone = template.content.cloneNode(true);
        const item = clone.querySelector('.suggestion-item');
        const iconSpan = clone.querySelector('.suggestion-icon');
        const textSpan = clone.querySelector('.suggestion-text');
        const indicatorSpan = clone.querySelector('.suggestion-engine-indicator');

        // Set icon based on engine
        if (searchState.currentEngine === 'google') {
            iconSpan.textContent = '🔍';
            indicatorSpan.textContent = 'Google';
        } else if (searchState.currentEngine === 'youtube') {
            iconSpan.textContent = '▶️';
            indicatorSpan.textContent = 'YouTube';
        }

        textSpan.textContent = suggestion;

        // Click handler
        item.addEventListener('click', () => {
            performSearch(suggestion);
        });

        dropdown.appendChild(clone);
    });

    openSuggestionsDropdown();
}

// Open suggestions dropdown
function openSuggestionsDropdown() {
    const dropdown = document.getElementById('suggestions-dropdown');
    dropdown.classList.add('active');
    searchState.isDropdownVisible = true;
}

// Close suggestions dropdown
function closeSuggestionsDropdown() {
    const dropdown = document.getElementById('suggestions-dropdown');
    dropdown.classList.remove('active');
    dropdown.innerHTML = '';
    searchState.isDropdownVisible = false;
    searchState.selectedSuggestionIndex = -1;
}

// Select next suggestion
function selectNextSuggestion() {
    if (!searchState.isDropdownVisible) return;
    
    const items = document.querySelectorAll('.suggestion-item');
    searchState.selectedSuggestionIndex = Math.min(
        searchState.selectedSuggestionIndex + 1,
        items.length - 1
    );
    updateSuggestionSelection(items);
}

// Select previous suggestion
function selectPreviousSuggestion() {
    if (!searchState.isDropdownVisible) return;
    
    const items = document.querySelectorAll('.suggestion-item');
    searchState.selectedSuggestionIndex = Math.max(
        searchState.selectedSuggestionIndex - 1,
        -1
    );
    updateSuggestionSelection(items);
}

// Update visual selection of suggestion
function updateSuggestionSelection(items) {
    items.forEach((item, index) => {
        if (index === searchState.selectedSuggestionIndex) {
            item.setAttribute('aria-selected', 'true');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.setAttribute('aria-selected', 'false');
        }
    });
}

// Perform search and redirect
function performSearch(query) {
    if (!query.trim()) return;

    const engine = searchEngineConfig[searchState.currentEngine];
    const searchUrl = engine.searchUrl + encodeURIComponent(query);

    // Redirect to search in same tab
    window.location.href = searchUrl;
}

// Call initialization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeHybridSearchBar();
});
```

**Key Features**:
- State management system
- Engine cycling logic
- Suggestion fetching
- Keyboard navigation
- URL encoding and redirection

---

### PHASE 4: SVG Icon Assets (Inline)

**Goal**: Add official icons for Google, YouTube, and Perplexity

**Update in JavaScript**: `updateEngineIcon()` function

```javascript
// Google Icon (Official Colors)
const googleIcon = `
    <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#EA4335"/>
        <text x="8" y="15" fill="white" font-size="10" font-weight="bold">G</text>
    </svg>
`;

// YouTube Icon (Official)
const youtubeIcon = `
    <svg viewBox="0 0 24 24" fill="#FF0000">
        <path d="M19.615 3.002h-15.23c-1.926 0-3.5 1.574-3.5 3.498v10c0 1.925 1.574 3.5 3.5 3.5h15.23c1.926 0 3.5-1.575 3.5-3.5v-10c0-1.924-1.574-3.498-3.5-3.498zm-10.738 11.374v-6.371l5.738 3.186-5.738 3.185z"/>
    </svg>
`;

// Perplexity Icon (Stylized Lightning)
const perplexityIcon = `
    <svg viewBox="0 0 24 24" fill="#9C27B0">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
`;
```

---

### PHASE 5: Integration Checklist

**File Updates Required**:

1. **new-tab/index.html** ✅
   - [ ] Replace search container HTML
   - [ ] Add template element
   - [ ] Verify ARIA labels

2. **new-tab/styles.css** ✅
   - [ ] Add new CSS classes
   - [ ] Update responsive breakpoints
   - [ ] Verify dark theme colors

3. **new-tab/script.js** ✅
   - [ ] Add searchEngineConfig object
   - [ ] Add searchState object
   - [ ] Add all functions from Phase 3
   - [ ] Call initializeHybridSearchBar() on DOM ready

4. **manifest.json**
   - [ ] Verify permissions (may need web access)

---

### PHASE 6: Testing Checklist

**Functionality Tests**:
- [ ] Click left icon cycles: Google → YouTube → Perplexity → Google
- [ ] Typing shows suggestions for Google/YouTube
- [ ] Suggestions don't show for Perplexity (AI mode)
- [ ] Press Enter redirects to search with query
- [ ] Click suggestion redirects to search
- [ ] Click right icon toggles AI mode
- [ ] Arrow keys navigate suggestions
- [ ] Escape key closes dropdown
- [ ] Click outside closes dropdown

**Design Tests**:
- [ ] Light theme styling correct
- [ ] Dark theme styling correct
- [ ] Icons display properly
- [ ] Animations smooth
- [ ] Responsive on mobile
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader labels present

**Redirect Tests**:
- [ ] Google search: `https://www.google.com/search?q=python`
- [ ] YouTube search: `https://www.youtube.com/results?search_query=python`
- [ ] Perplexity search: `https://www.perplexity.ai?q=python`

---

## Configuration Reference

### Search Engine URLs

```javascript
// Google
window.location.href = "https://www.google.com/search?q=YOUR_QUERY"

// YouTube  
window.location.href = "https://www.youtube.com/results?search_query=YOUR_QUERY"

// Perplexity AI
window.location.href = "https://www.perplexity.ai?q=YOUR_QUERY"
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Click left icon | Cycle search engine |
| Click right icon | Toggle AI mode |
| Enter | Perform search |
| ↓ | Next suggestion |
| ↑ | Previous suggestion |
| Escape | Close dropdown |
| Ctrl+G | Switch to Google |
| Ctrl+Y | Switch to YouTube |

---

## API Limitations & Solutions

### CORS Issues with Suggestions
**Problem**: Direct API calls blocked by CORS
**Solution**: Use local suggestions + backend proxy

```javascript
// Option 1: Local suggestions (implemented)
displayLocalSuggestions(query);

// Option 2: Backend proxy
// Backend endpoint: /api/suggestions?engine=google&q=query
```

### Perplexity Suggestions
**Status**: Perplexity doesn't provide public API
**Solution**: AI mode doesn't show suggestions (by design)

---

## Material Design 3 Token Usage

```css
/* Primary Colors */
--md-sys-color-primary: #1976D2 (Light), #90CAF9 (Dark)

/* Surfaces */
--md-sys-color-surface: #ffffff (Light), #1e1e1e (Dark)
--md-sys-color-surface-container: #f3f5f7 (Light), #2d2d2d (Dark)

/* Typography */
--font-family-primary: 'Google Sans Text'
--font-size-body: 1rem

/* Spacing */
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 16px

/* Transitions */
--transition-fast: 0.2s
--transition-easing-emphasized: cubic-bezier(0.4, 0, 0.2, 1)
```

---

## State Diagram

```
                    ┌─────────────────┐
                    │  Initial State  │
                    │  engine: google │
                    │  ai: false      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
        ┌──────────▶│  GOOGLE ENGINE  │◀──────────┐
        │           │   icon: 🔍      │           │
        │           │  suggestions: ON │           │
        │           └────────┬────────┘           │
        │                    │                    │
        │           (click engine btn)            │
        │                    │                    │
        │           ┌────────▼────────┐           │
        │           │ YOUTUBE ENGINE  │           │
        │           │   icon: ▶️      │           │
        │           │ suggestions: ON │           │
        │           └────────┬────────┘           │
        │                    │                    │
        │                    │ (click engine btn) │
        │                    │                    │
        │           ┌────────▼────────┐           │
        │           │ PERPLEXITY (AI) │           │
        │           │   icon: ⚡      │           │
        │           │suggestions: OFF │           │
        │           └────────┬────────┘           │
        │                    │                    │
        └────────────────────┴────────────────────┘
              (click engine btn / AI toggle)
```

---

## Troubleshooting Guide

### Issue: Suggestions not showing
**Check**:
1. Is input value more than 1 character?
2. Is dropdown visible in CSS?
3. Check browser console for JS errors

### Issue: Icons not displaying
**Check**:
1. SVG paths are valid
2. Color values are correct
3. Viewbox dimensions match

### Issue: Dark theme colors wrong
**Check**:
1. CSS variables in `:root` and `body.dark`
2. Contrast ratio meets WCAG standards
3. Test in actual dark mode

### Issue: Redirects not working
**Check**:
1. URL encoding: `encodeURIComponent(query)`
2. URL structure matches expected format
3. No popup blockers interfering

---

## Future Enhancements

1. **Backend Suggestions API**
   - Implement server-side suggestion fetching
   - Cache frequently searched terms
   - ML-based suggestion ranking

2. **Search History**
   - Store recent searches in localStorage
   - Show history in dropdown when input empty
   - Clear history option in settings

3. **Custom Search Engines**
   - Add Wikipedia, StackOverflow, etc.
   - User-configurable engines
   - Search engine ordering/priority

4. **Advanced AI Features**
   - Chat mode for Perplexity
   - Follow-up question support
   - Result sharing/bookmarking

5. **Performance Optimization**
   - Debounce suggestion fetching
   - Memoize suggestion results
   - Lazy load suggestion API

---

## File Structure Summary

```
helloworld-extension/
├── new-tab/
│   ├── index.html         (PHASE 1 - HTML)
│   ├── styles.css         (PHASE 2 - CSS)
│   └── script.js          (PHASE 3 - JavaScript)
├── manifest.json
├── README.md
└── HYBRID_SEARCH_IMPLEMENTATION.md (THIS FILE)
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 21, 2026 | Initial hybrid search implementation |

---

**Created**: January 21, 2026
**Author**: AI Assistant
**Status**: Ready for Implementation
