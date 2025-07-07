const { app, BrowserWindow, screen } = require('electron')
const { ipcMain } = require('electron');
const path = require('path')

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  const petWidth = 200;
  const petHeight = 200;

  const x = Math.floor(Math.random() * (screenWidth - petWidth));
  const y = Math.floor(Math.random() * (screenHeight - petHeight));

  const win = new BrowserWindow({
    width: petWidth,
    height: petHeight,
    x: x,
    y: y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 用 preload 来传值
    }
  });
  mainWindow = win;
  win.setIgnoreMouseEvents(false);
  win.loadFile('src/index.html');

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('init-position', { x, y });
  });
}
ipcMain.on('move-window', (event, x, y) => {
  if (mainWindow) {
    mainWindow.setBounds({ x, y, width: 200, height: 200 });
  }
});
app.whenReady().then(() => {
  createWindow();
});