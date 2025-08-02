const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize electron-store for persistent settings
const store = new Store();

let mainWindow;
let tray;
let isQuitting = false;

// Security: Disable nodeIntegration and enable contextIsolation
const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: Math.min(1200, width * 0.8),
    height: Math.min(800, height * 0.8),
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    show: false,
    titleBarStyle: 'default',
    autoHideMenuBar: true,
    resizable: true,
    frame: true
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Check if this is the first launch
    if (!store.get('hasLaunchedBefore')) {
      store.set('hasLaunchedBefore', true);
      // Show welcome screen or onboarding
    }
  });

  // Handle window close
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window focus
  mainWindow.on('focus', () => {
    // Update app state when window gains focus
    mainWindow.webContents.send('app-focused');
  });

  // Handle window blur
  mainWindow.on('blur', () => {
    // Update app state when window loses focus
    mainWindow.webContents.send('app-blurred');
  });
};

// Create system tray
const createTray = () => {
  const iconPath = path.join(__dirname, 'assets/tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  
  tray = new Tray(icon);
  tray.setToolTip('FocusFuel - Stay focused, stay productive');
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show FocusFuel',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Start Focus Session',
      click: () => {
        mainWindow?.webContents.send('start-focus-session');
      }
    },
    {
      label: 'Quick Break',
      click: () => {
        mainWindow?.webContents.send('start-break');
      }
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        mainWindow?.webContents.send('open-settings');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  
  // Handle tray click
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
};

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createTray();
  
  // Handle macOS app activation
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app before-quit
app.on('before-quit', () => {
  isQuitting = true;
});

// IPC handlers for main process
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-store-value', (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('delete-store-value', (event, key) => {
  store.delete(key);
  return true;
});

ipcMain.handle('show-notification', (event, options) => {
  const { Notification } = require('electron');
  
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: options.title || 'FocusFuel',
      body: options.body,
      icon: path.join(__dirname, 'assets/notification-icon.png'),
      silent: options.silent || false
    });
    
    notification.show();
    
    if (options.onClick) {
      notification.on('click', () => {
        mainWindow?.show();
        mainWindow?.focus();
      });
    }
  }
});

ipcMain.handle('set-tray-tooltip', (event, tooltip) => {
  if (tray) {
    tray.setToolTip(tooltip);
  }
});

ipcMain.handle('update-tray-menu', (event, menuItems) => {
  if (tray) {
    const contextMenu = Menu.buildFromTemplate(menuItems);
    tray.setContextMenu(contextMenu);
  }
});

// Handle focus session events
ipcMain.handle('focus-session-started', (event, sessionData) => {
  // Update tray icon or show notification
  if (tray) {
    tray.setToolTip(`FocusFuel - Session in progress (${sessionData.duration}min)`);
  }
});

ipcMain.handle('focus-session-ended', (event, sessionData) => {
  // Reset tray tooltip and show completion notification
  if (tray) {
    tray.setToolTip('FocusFuel - Stay focused, stay productive');
  }
  
  // Show completion notification
  const { Notification } = require('electron');
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: 'Focus Session Complete!',
      body: `Great job! You focused for ${sessionData.duration} minutes.`,
      icon: path.join(__dirname, 'assets/notification-icon.png')
    });
    notification.show();
  }
});

// Handle distraction blocking
ipcMain.handle('block-distraction', (event, distractionData) => {
  // Log distraction event and potentially show motivational message
  console.log('Distraction blocked:', distractionData);
  
  // Show motivational notification
  const { Notification } = require('electron');
  if (Notification.isSupported()) {
    const motivationalMessages = [
      "Stay focused! You're doing great!",
      "Every distraction avoided is progress made.",
      "Your future self will thank you for staying focused.",
      "You've got this! Keep going strong!"
    ];
    
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    const notification = new Notification({
      title: 'Stay Focused!',
      body: randomMessage,
      icon: path.join(__dirname, 'assets/notification-icon.png')
    });
    notification.show();
  }
});

// Handle app settings
ipcMain.handle('get-app-settings', () => {
  return {
    autoStart: app.getLoginItemSettings().openAtLogin,
    notifications: store.get('notifications', true),
    theme: store.get('theme', 'system'),
    language: store.get('language', 'en')
  };
});

ipcMain.handle('set-app-settings', (event, settings) => {
  if (settings.autoStart !== undefined) {
    app.setLoginItemSettings({
      openAtLogin: settings.autoStart
    });
  }
  
  if (settings.notifications !== undefined) {
    store.set('notifications', settings.notifications);
  }
  
  if (settings.theme !== undefined) {
    store.set('theme', settings.theme);
  }
  
  if (settings.language !== undefined) {
    store.set('language', settings.language);
  }
  
  return true;
});

// Handle file operations
ipcMain.handle('export-data', (event, data) => {
  const { dialog } = require('electron');
  const fs = require('fs');
  
  return dialog.showSaveDialog(mainWindow, {
    title: 'Export FocusFuel Data',
    defaultPath: `focusfuel-export-${new Date().toISOString().split('T')[0]}.json`,
    filters: [
      { name: 'JSON Files', extensions: ['json'] }
    ]
  }).then(result => {
    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));
      return true;
    }
    return false;
  });
});

ipcMain.handle('import-data', (event) => {
  const { dialog } = require('electron');
  const fs = require('fs');
  
  return dialog.showOpenDialog(mainWindow, {
    title: 'Import FocusFuel Data',
    filters: [
      { name: 'JSON Files', extensions: ['json'] }
    ],
    properties: ['openFile']
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const data = fs.readFileSync(result.filePaths[0], 'utf8');
      return JSON.parse(data);
    }
    return null;
  });
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    // Open in default browser instead
    require('electron').shell.openExternal(navigationUrl);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log to file or send to monitoring service
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log to file or send to monitoring service
}); 