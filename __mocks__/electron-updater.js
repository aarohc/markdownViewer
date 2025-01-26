module.exports = {
  autoUpdater: {
    checkForUpdatesAndNotify: jest.fn(),
    on: jest.fn(),
    logger: null,
    channel: 'latest',
    allowDowngrade: false,
    updateConfigPath: 'update-config.json',
    currentVersion: '1.0.0'
  }
}; 