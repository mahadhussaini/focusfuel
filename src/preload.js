const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Store operations
  getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
  deleteStoreValue: (key) => ipcRenderer.invoke('delete-store-value', key),
  
  // Notifications
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),
  
  // Tray operations
  setTrayTooltip: (tooltip) => ipcRenderer.invoke('set-tray-tooltip', tooltip),
  updateTrayMenu: (menuItems) => ipcRenderer.invoke('update-tray-menu', menuItems),
  
  // Focus session events
  focusSessionStarted: (sessionData) => ipcRenderer.invoke('focus-session-started', sessionData),
  focusSessionEnded: (sessionData) => ipcRenderer.invoke('focus-session-ended', sessionData),
  
  // Distraction blocking
  blockDistraction: (distractionData) => ipcRenderer.invoke('block-distraction', distractionData),
  
  // App settings
  getAppSettings: () => ipcRenderer.invoke('get-app-settings'),
  setAppSettings: (settings) => ipcRenderer.invoke('set-app-settings', settings),
  
  // File operations
  exportData: (data) => ipcRenderer.invoke('export-data', data),
  importData: () => ipcRenderer.invoke('import-data'),
  
  // Event listeners
  onAppFocused: (callback) => ipcRenderer.on('app-focused', callback),
  onAppBlurred: (callback) => ipcRenderer.on('app-blurred', callback),
  onStartFocusSession: (callback) => ipcRenderer.on('start-focus-session', callback),
  onStartBreak: (callback) => ipcRenderer.on('start-break', callback),
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  
  // Remove event listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform information
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development'
});

// Expose a safe API for window management
contextBridge.exposeInMainWorld('windowAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  isMinimized: () => ipcRenderer.invoke('window-is-minimized')
});

// Expose system information
contextBridge.exposeInMainWorld('systemAPI', {
  getSystemInfo: () => ({
    platform: process.platform,
    arch: process.arch,
    version: process.version,
    nodeVersion: process.versions.node,
    chromeVersion: process.versions.chrome,
    electronVersion: process.versions.electron
  }),
  
  getMemoryInfo: () => ipcRenderer.invoke('get-memory-info'),
  getCPUUsage: () => ipcRenderer.invoke('get-cpu-usage')
});

// Expose file system operations (limited and secure)
contextBridge.exposeInMainWorld('fileAPI', {
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  selectDirectory: () => ipcRenderer.invoke('select-directory')
});

// Expose network utilities
contextBridge.exposeInMainWorld('networkAPI', {
  isOnline: () => navigator.onLine,
  onOnline: (callback) => {
    window.addEventListener('online', callback);
  },
  onOffline: (callback) => {
    window.addEventListener('offline', callback);
  }
});

// Expose clipboard operations
contextBridge.exposeInMainWorld('clipboardAPI', {
  readText: () => ipcRenderer.invoke('clipboard-read-text'),
  writeText: (text) => ipcRenderer.invoke('clipboard-write-text', text),
  readImage: () => ipcRenderer.invoke('clipboard-read-image'),
  writeImage: (imageData) => ipcRenderer.invoke('clipboard-write-image', imageData)
});

// Expose shell operations
contextBridge.exposeInMainWorld('shellAPI', {
  openExternal: (url) => ipcRenderer.invoke('shell-open-external', url),
  showItemInFolder: (path) => ipcRenderer.invoke('shell-show-item-in-folder', path),
  openPath: (path) => ipcRenderer.invoke('shell-open-path', path)
});

// Expose dialog operations
contextBridge.exposeInMainWorld('dialogAPI', {
  showMessageBox: (options) => ipcRenderer.invoke('dialog-show-message-box', options),
  showErrorBox: (title, content) => ipcRenderer.invoke('dialog-show-error-box', title, content),
  showOpenDialog: (options) => ipcRenderer.invoke('dialog-show-open-dialog', options),
  showSaveDialog: (options) => ipcRenderer.invoke('dialog-show-save-dialog', options)
});

// Expose power management
contextBridge.exposeInMainWorld('powerAPI', {
  getSystemIdleTime: () => ipcRenderer.invoke('power-get-system-idle-time'),
  getSystemIdleState: () => ipcRenderer.invoke('power-get-system-idle-state'),
  onSystemIdle: (callback) => ipcRenderer.on('power-system-idle', callback),
  onSystemResume: (callback) => ipcRenderer.on('power-system-resume', callback)
});

// Expose screen information
contextBridge.exposeInMainWorld('screenAPI', {
  getDisplayBounds: () => ipcRenderer.invoke('screen-get-display-bounds'),
  getPrimaryDisplay: () => ipcRenderer.invoke('screen-get-primary-display'),
  getAllDisplays: () => ipcRenderer.invoke('screen-get-all-displays'),
  onDisplayAdded: (callback) => ipcRenderer.on('screen-display-added', callback),
  onDisplayRemoved: (callback) => ipcRenderer.on('screen-display-removed', callback)
});

// Expose native theme
contextBridge.exposeInMainWorld('nativeThemeAPI', {
  shouldUseDarkColors: () => ipcRenderer.invoke('native-theme-should-use-dark-colors'),
  themeSource: () => ipcRenderer.invoke('native-theme-theme-source'),
  setThemeSource: (source) => ipcRenderer.invoke('native-theme-set-theme-source', source),
  onUpdated: (callback) => ipcRenderer.on('native-theme-updated', callback)
});

// Expose global shortcuts
contextBridge.exposeInMainWorld('globalShortcutAPI', {
  register: (accelerator, callback) => ipcRenderer.invoke('global-shortcut-register', accelerator),
  unregister: (accelerator) => ipcRenderer.invoke('global-shortcut-unregister', accelerator),
  unregisterAll: () => ipcRenderer.invoke('global-shortcut-unregister-all'),
  isRegistered: (accelerator) => ipcRenderer.invoke('global-shortcut-is-registered', accelerator)
});

// Expose app lifecycle events
contextBridge.exposeInMainWorld('appAPI', {
  onBeforeQuit: (callback) => ipcRenderer.on('app-before-quit', callback),
  onWillQuit: (callback) => ipcRenderer.on('app-will-quit', callback),
  onQuit: (callback) => ipcRenderer.on('app-quit', callback),
  onActivate: (callback) => ipcRenderer.on('app-activate', callback),
  onSecondInstance: (callback) => ipcRenderer.on('app-second-instance', callback),
  onOpenURL: (callback) => ipcRenderer.on('app-open-url', callback)
});

// Expose window events
contextBridge.exposeInMainWorld('windowEvents', {
  onFocus: (callback) => ipcRenderer.on('window-focus', callback),
  onBlur: (callback) => ipcRenderer.on('window-blur', callback),
  onShow: (callback) => ipcRenderer.on('window-show', callback),
  onHide: (callback) => ipcRenderer.on('window-hide', callback),
  onMaximize: (callback) => ipcRenderer.on('window-maximize', callback),
  onUnmaximize: (callback) => ipcRenderer.on('window-unmaximize', callback),
  onMinimize: (callback) => ipcRenderer.on('window-minimize', callback),
  onRestore: (callback) => ipcRenderer.on('window-restore', callback),
  onResize: (callback) => ipcRenderer.on('window-resize', callback),
  onMove: (callback) => ipcRenderer.on('window-move', callback),
  onClose: (callback) => ipcRenderer.on('window-close', callback)
});

// Expose development tools
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('devAPI', {
    openDevTools: () => ipcRenderer.invoke('dev-open-dev-tools'),
    reload: () => ipcRenderer.invoke('dev-reload'),
    forceReload: () => ipcRenderer.invoke('dev-force-reload'),
    toggleDevTools: () => ipcRenderer.invoke('dev-toggle-dev-tools'),
    inspectElement: (x, y) => ipcRenderer.invoke('dev-inspect-element', x, y)
  });
}

// Handle cleanup when the preload script is unloaded
window.addEventListener('beforeunload', () => {
  // Clean up any resources or event listeners
  ipcRenderer.removeAllListeners('app-focused');
  ipcRenderer.removeAllListeners('app-blurred');
  ipcRenderer.removeAllListeners('start-focus-session');
  ipcRenderer.removeAllListeners('start-break');
  ipcRenderer.removeAllListeners('open-settings');
});

// Expose a utility for checking if APIs are available
contextBridge.exposeInMainWorld('apiCheck', {
  isElectron: true,
  hasElectronAPI: true,
  hasWindowAPI: true,
  hasSystemAPI: true,
  hasFileAPI: true,
  hasNetworkAPI: true,
  hasClipboardAPI: true,
  hasShellAPI: true,
  hasDialogAPI: true,
  hasPowerAPI: true,
  hasScreenAPI: true,
  hasNativeThemeAPI: true,
  hasGlobalShortcutAPI: true,
  hasAppAPI: true,
  hasWindowEvents: true,
  hasDevAPI: process.env.NODE_ENV === 'development'
}); 