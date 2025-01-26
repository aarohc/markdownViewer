module.exports = {
  ipcRenderer: {
    send: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn()
  },
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
    handleOnce: jest.fn()
  },
  app: {
    getVersion: jest.fn(() => '1.0.0'),
    on: jest.fn(),
    whenReady: jest.fn(),
    quit: jest.fn()
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn(),
    loadFile: jest.fn(),
    on: jest.fn(),
    webContents: {
      openDevTools: jest.fn()
    }
  }))
}; 