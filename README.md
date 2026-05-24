
# Chrome New Tab Extension

Privacy-first, minimal new tab: light/dark modes, day tracker, greeting message, and pinned shortcut links.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## ✨ Features

- **Privacy-first** - Minimal permissions and no telemetry; settings stay local.
- **Minimal UI** - Clean, distraction-free layout focused on speed.
- **Light / Dark modes** - Follows system theme with a manual toggle and persistent preference.
- **Day tracker** - Simple day tracking element to mark progress or view the current day.
- **Greeting message** - Shows a friendly, personalized greeting on each new tab.
- **Pinned shortcuts** - Save and surface frequently used links for quick access.

## 🚀 Installation

### Chrome Web Store (recommended)

The extension will be available from the Chrome Web Store once published.

Install from the store link: [Chrome Web Store listing](https://chrome.google.com/webstore/detail/your-extension-id)

## 📁 Project Structure

```
helloworld-extension/
├── manifest.json           # Extension configuration (Manifest V3)
├── background/
│   └── background.js      # Service worker
├── new-tab/
│   ├── index.html         # New tab page structure
│   ├── script.js          # Theme logic and date handling
│   └── styles.css         # Material Design 3 styling
├── icons/                 # Extension icons
└── images/
└──                        # Project assets

## 🛠️ Technologies Used

- **Manifest V3** - Latest Chrome extension platform
- **Chrome extension APIs** - `chrome.runtime`, `chrome.storage.local`, `chrome_url_overrides`
- **Vanilla JavaScript** - No frameworks, pure performance
- **Material Design 3** - Google's design system
- **CSS Custom Properties** - Dynamic theming
- **localStorage API** - Theme persistence
- **matchMedia API** - System theme detection

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
