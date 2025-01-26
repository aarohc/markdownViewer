# Markdown Viewer

A desktop application for viewing and presenting Markdown files with support for Mermaid diagrams and Marp presentations.

## Features

- 📁 File tree navigation
- 📊 Mermaid diagram support
- 🎯 Marp presentation support
- 🔄 Auto-updates
- 📱 Responsive layout
- ⌨️ Keyboard shortcuts
- 🎨 Clean, modern UI

## Installation

1. Clone the repository
2. Install dependencies:
bash
npm install
:
bash
npm run electron-dev
:
bash
Windows
npm run dist:win
macOS
npm run dist:mac
Linux
npm run dist:linux

markdown-viewer/
├── dist/ # Built files
├── electron/ # Electron main process
├── src/
│ ├── components/ # React components
│ ├── App.jsx # Root component
│ └── index.jsx # Entry point
├── index.html # HTML template
└── webpack.config.js


## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
