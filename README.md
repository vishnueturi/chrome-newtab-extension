# Chrome New Tab Extension

A lightweight Chrome extension that replaces the default new tab page with a personalized greeting, current date, and Material Design 3 theming. Features automatic light/dark mode switching based on system preferences with manual toggle support.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## ✨ Features

- **Personalized Greeting** - Displays "Hello [username]!" every time you open a new tab
- **Date Display** - Shows the current date in your system's locale format
- **Theme Switching** - Automatic light/dark mode based on system preferences
- **Manual Toggle** - Override theme with a sleek Material Design toggle switch
- **Theme Persistence** - Remembers your theme preference using localStorage
- **Material Design 3** - Modern, clean UI following Google's latest design guidelines
- **Lightweight** - Built with vanilla JavaScript for optimal performance

## 🚀 Installation

### From Source (Developer Mode)

1. **Clone the repository**
   ```bash
   git clone https://github.com/vishnueturi/chrome-newtab-extension.git
   cd chrome-newtab-extension
   ```

2. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in the top-right corner)
   - Click **Load unpacked**
   - Select the `helloworld-extension` directory

3. **Start using**
   - Open a new tab to see your personalized new tab page!

### From Chrome Web Store
*Coming soon!*

## 📁 Project Structure

```
helloworld-extension/
├── manifest.json           # Extension configuration (Manifest V3)
├── background/
│   └── background.js      # Service worker (currently minimal)
├── new-tab/
│   ├── index.html         # New tab page structure
│   ├── script.js          # Theme logic and date handling
│   └── styles.css         # Material Design 3 styling
├── icons/                 # Extension icons (to be added)
└── images/
└──                        # Project assets

## 🛠️ Technologies Used

- **Manifest V3** - Latest Chrome extension platform
- **Vanilla JavaScript** - No frameworks, pure performance
- **Material Design 3** - Google's design system
- **CSS Custom Properties** - Dynamic theming
- **localStorage API** - Theme persistence
- **matchMedia API** - System theme detection

## 🔮 Planned Features

- [ ] Quick links/bookmarks section
- [ ] Inspirational quotes
- [ ] Productivity timer/Pomodoro
- [ ] Search bar integration
- [ ] Settings page for customization

## 🤝 Contributing

Contributions are welcome! This is a personal project, but feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Vishnu**

- GitHub: [@vishnueturi](https://github.com/vishnueturi)

## 🙏 Acknowledgments

- Material Design 3 color system by Google
- Chrome Extension documentation and community

---

⭐ If you find this project useful, please consider giving it a star!
