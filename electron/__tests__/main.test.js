const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Mock electron-updater
jest.mock('electron-updater', () => ({
  autoUpdater: {
    checkForUpdatesAndNotify: jest.fn(),
    on: jest.fn(),
    logger: null,
    channel: 'latest',
    allowDowngrade: false,
    updateConfigPath: 'update-config.json',
    currentVersion: '1.0.0'
  }
}));

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
  stat: jest.fn()
}));

describe('Electron Main Process', () => {
  let main;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset modules before each test
    jest.resetModules();
    main = require('../main');
  });

  // Positive test cases
  test('creates browser window on app ready', async () => {
    await main.createWindow();
    expect(BrowserWindow).toHaveBeenCalledWith(expect.any(Object));
    expect(BrowserWindow.mock.results[0].value.loadFile).toHaveBeenCalled();
  });

  test('quits app when all windows are closed on non-Darwin platforms', () => {
    process.platform = 'win32';
    const mockCallback = app.on.mock.calls.find(call => call[0] === 'window-all-closed')[1];
    mockCallback();
    expect(app.quit).toHaveBeenCalled();
  });

  // Negative test cases
  test('handles window creation errors', async () => {
    BrowserWindow.mockImplementationOnce(() => {
      throw new Error('Failed to create window');
    });
    
    await expect(main.createWindow()).rejects.toThrow('Failed to create window');
  });

  test('does not quit app when all windows closed on Darwin', () => {
    process.platform = 'darwin';
    const mockCallback = app.on.mock.calls.find(call => call[0] === 'window-all-closed')[1];
    mockCallback();
    expect(app.quit).not.toHaveBeenCalled();
  });
}); 