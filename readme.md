# Markdown Viewer

A desktop application for viewing and presenting Markdown files with support for Mermaid diagrams and Marp presentations.

In today’s fast-paced digital world, Markdown has become the go-to format for creating and sharing documentation, notes, and technical content due to its simplicity and versatility. However, managing and viewing Markdown files across different platforms can be cumbersome, especially when they include advanced elements like Mermaid diagrams for visualizations or Marp presentations for slideshows. A dedicated Markdown viewer desktop app would streamline this process, providing a unified and seamless experience for users to view, edit, and interact with Markdown content. By consolidating these functionalities into a single application, users can save time and avoid the hassle of switching between multiple tools or relying on web-based solutions that may lack offline accessibility or robust performance.

Moreover, a desktop app tailored for Markdown, Mermaid graphs, and Marp presentations would enhance productivity and collaboration. Developers, technical writers, and educators often rely on these tools to create clear and visually engaging content. A desktop app would offer features like real-time rendering, offline access, and customizable themes, ensuring a smooth and consistent workflow. Additionally, it would eliminate compatibility issues and provide a more secure environment for handling sensitive or proprietary information. By centralizing these capabilities, the app would empower users to focus on creating high-quality content without being hindered by fragmented tools or platform limitations.

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

GPL3 License - see LICENSE file for details
