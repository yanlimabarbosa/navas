const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  return new Promise((resolve, reject) => {
    let backendPath;
    let backendArgs;
    let backendCwd;

    if (isDev) {
      backendPath = path.join(__dirname, '../navas-backend/mvnw');
      backendArgs = ['spring-boot:run'];
      backendCwd = path.join(__dirname, '../navas-backend');
    } else {
      const dbPath = path.join(app.getPath('userData'), 'database', 'navas-db');
      const jarPath = path.join(process.resourcesPath, 'backend', 'navas-0.0.1-SNAPSHOT.jar');
      
      backendPath = 'java';
      backendArgs = [
        '-jar',
        jarPath,
        `--spring.profiles.active=prod`,
        `--spring.datasource.url=jdbc:h2:file:${dbPath};DB_CLOSE_ON_EXIT=FALSE`
      ];
      backendCwd = path.dirname(jarPath);
    }

    backendProcess = spawn(backendPath, backendArgs, {
      cwd: backendCwd,
      stdio: 'pipe'
    });
    
    const logDir = app.getPath('userData');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFilePath = path.join(logDir, 'backend.log');
    console.log(`Redirecting backend logs to: ${logFilePath}`);
    const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

    backendProcess.stdout.pipe(logStream);
    backendProcess.stderr.pipe(logStream);

    backendProcess.stdout.on('data', (data) => {
      console.log('Backend:', data.toString());
      if (data.toString().includes('Started NavasApplication')) {
        resolve();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error('Backend Error:', data.toString());
    });

    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
      reject(error);
    });

    setTimeout(() => {
      reject(new Error('Backend startup timeout'));
    }, 30000);
  });
}

app.whenReady().then(async () => {
  try {
    await startBackend();
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    createWindow();
  }
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

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

ipcMain.handle('get-backend-url', () => {
  return isDev ? 'http://localhost:8080' : 'http://localhost:8080';
}); 