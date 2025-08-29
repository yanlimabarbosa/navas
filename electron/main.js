const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

// Get images path from config file with fallback
function getImagensProdutosPath() {
  // Look for config file in the same directory as the executable
  const exePath = path.dirname(process.execPath);
  const configPath = path.join(exePath, 'navas-caminho-imagens.txt');
  
  try {
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8').trim();
      if (configContent) {
        console.log('Using IMAGENS_PRODUTOS_PATH from config file:', configContent);
        return configContent;
      }
    }
  } catch (error) {
    console.warn('Failed to read config file:', error);
  }
  
  // Fallback to local path
  const localPath = path.join(process.resourcesPath, 'navas-front', 'dist', 'imagens_produtos');
  console.log('Using local fallback path:', localPath);
  return localPath;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/navas-logo.jpg'),
    title: 'Navas Promoções'
  });

  const frontendIndex = isDev
    ? 'http://localhost:5173'
    : path.join(process.resourcesPath, 'navas-front', 'dist', 'index.html');

  if (isDev) {
    mainWindow.loadURL(frontendIndex);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(frontendIndex);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Send the images path to renderer process
    const imagensPath = getImagensProdutosPath();
    mainWindow.webContents.send('imagens-path', imagensPath);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
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

ipcMain.handle('get-backend-url', () => {
  return null; // No backend needed
});

// Handle request for images path
ipcMain.handle('get-imagens-path', () => {
  return getImagensProdutosPath();
});
