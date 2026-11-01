import { app, BrowserWindow } from 'electron';
import './index.js'; // Automatically starts your Express server on port 3001

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    autoHideMenuBar: true, // Hides the default File/Edit top menu bar
    backgroundColor: '#121214',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the app from your Express server
  mainWindow.loadURL('http://localhost:3001');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

