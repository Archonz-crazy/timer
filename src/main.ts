const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow: typeof BrowserWindow | null = null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 300,
    height: 200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: store.get('alwaysOnTop', false) as boolean,
    hasShadow: false
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, '../src/index.html'));

  // Make window draggable
  mainWindow.setWindowButtonVisibility(false);

  // Restore window position
  const windowPosition = store.get('windowPosition');
  if (windowPosition) {
    mainWindow.setPosition((windowPosition as number[])[0], (windowPosition as number[])[1]);
  }

  // Save window position when moved
  mainWindow.on('moved', () => {
    const position = mainWindow?.getPosition();
    store.set('windowPosition', position);
  });

  // Save timer state before closing
  mainWindow.on('close', () => {
    if (mainWindow) {
      store.set('isAlwaysOnTop', mainWindow.isAlwaysOnTop());
    }
  });
}

app.whenReady().then(createWindow);

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

// IPC handlers for timer state
ipcMain.on('save-timer-state', (_event: any, state: { time: number; isRunning: boolean }) => {
  store.set('timerState', state);
});

ipcMain.handle('get-timer-state', () => {
  return store.get('timerState');
});

ipcMain.on('toggle-always-on-top', () => {
  if (mainWindow) {
    const newState = !mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(newState);
    store.set('alwaysOnTop', newState);
  }
}); 