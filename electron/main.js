const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Folder',
          accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O',
          click: async () => {
            console.log('Open Folder menu item clicked');
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openDirectory'],
              title: 'Select Folder Containing Markdown Files'
            });
            
            if (!result.canceled) {
              const folderPath = result.filePaths[0];
              console.log('Selected folder:', folderPath);
              
              const structure = await scanDirectory(folderPath);
              console.log('Sending folder-selected event with structure:', 
                JSON.stringify(structure, null, 2));
              
              mainWindow.webContents.send('folder-selected', {
                path: folderPath,
                structure: structure
              });
            } else {
              console.log('Folder selection cancelled');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
  createWindow();
});

// Helper function to scan directory recursively
async function scanDirectory(dirPath) {
  console.log(`Scanning directory: ${dirPath}`);
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    console.log(`Found ${entries.length} entries in ${dirPath}`);
    
    const files = await Promise.all(
      entries.map(async entry => {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          console.log(`Processing directory: ${entry.name}`);
          const children = await scanDirectory(fullPath);
          if (children && children.length > 0) {
            console.log(`Directory ${entry.name} has ${children.length} valid children`);
            return {
              name: entry.name,
              path: fullPath,
              type: 'directory',
              children
            };
          }
          console.log(`Directory ${entry.name} has no markdown files, skipping`);
          return null;
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
          console.log(`Found markdown file: ${entry.name}`);
          return {
            name: entry.name,
            path: fullPath,
            type: 'file',
            isMarkdown: true
          };
        }
        return null;
      })
    );

    const filteredFiles = files.filter(Boolean);
    console.log(`Returning ${filteredFiles.length} valid entries for ${dirPath}`);
    
    return filteredFiles.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'directory' ? -1 : 1;
    });
  } catch (error) {
    console.error('Error scanning directory:', error);
    return [];
  }
}

// IPC handler for directory scanning
ipcMain.handle('read-directory', async (event, dirPath) => {
  console.log('IPC: read-directory called with path:', dirPath);
  try {
    const structure = await scanDirectory(dirPath);
    console.log('IPC: Returning structure:', JSON.stringify(structure, null, 2));
    return structure;
  } catch (error) {
    console.error('Error in read-directory handler:', error);
    return [];
  }
});

// Handle reading file content
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    return '';
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 