const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const url = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, './out/index.html')}`;

  win.loadURL(url);
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

ipcMain.handle('print-receipt', async (event, content) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    const pdfPath = path.join(app.getPath('temp'), 'receipt.pdf');
    await win.webContents.printToPDF({}).then(data => {
      require('fs').writeFileSync(pdfPath, data);
    });
    // Here you would typically send the PDF to a printer
    // For demonstration, we'll just open the PDF
    require('electron').shell.openPath(pdfPath);
  }
});