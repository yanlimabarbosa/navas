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
    show: false, // Don't show until ready
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

  // Show window immediately so splash screen is visible
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

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
      const appDir = path.dirname(process.execPath);
      const dbPath = path.join(appDir, 'database', 'navas-db');
      const jarPath = path.join(process.resourcesPath, 'backend', 'navas-0.0.1-SNAPSHOT.jar');
      
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

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

    const logDir = isDev ? app.getPath('userData') : path.dirname(process.execPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFilePath = path.join(logDir, 'backend.log');
    console.log(`Redirecting backend logs to: ${logFilePath}`);
    const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

    backendProcess.stdout.pipe(logStream);
    backendProcess.stderr.pipe(logStream);

    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Backend:', output);

      // Send status updates to frontend
      if (mainWindow && mainWindow.webContents) {
        if (output.includes('Started NavasApplication') || output.includes('Started application') || output.includes('Application started')) {
          mainWindow.webContents.send('backend-status', 'Aplicação iniciada com sucesso!');
          mainWindow.webContents.send('backend-ready');
          resolve();
        }
      }
    });

    backendProcess.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      console.error('Backend Error:', errorOutput);
    });

    backendProcess.on('error', (error) => {
      console.error('Failed to start backend:', error);
      reject(error);
    });

        // Health check function
    const checkBackendHealth = async () => {
      try {
        const http = require('http');
        return new Promise((resolve) => {
          const req = http.get('http://localhost:8080/health', (res) => {
                       if (res.statusCode === 200) {
             console.log('Backend health check passed');
             resolve(true);
           } else {
              resolve(false);
            }
          });
          req.on('error', () => resolve(false));
          req.setTimeout(2000, () => {
            req.destroy();
            resolve(false);
          });
        });
      } catch (error) {
        return false;
      }
    };

         // Start health checks after 3 seconds
     setTimeout(async () => {
       let attempts = 0;
       const maxAttempts = 20; // Increased from 8 to 20
       const checkInterval = setInterval(async () => {
         attempts++;
         if (mainWindow && mainWindow.webContents) {
           mainWindow.webContents.send('backend-status', `Iniciando aplicação`);
         }
         
         const isHealthy = await checkBackendHealth();
         if (isHealthy) {
           clearInterval(checkInterval);
           // Send final status and wait a bit before resolving
           if (mainWindow && mainWindow.webContents) {
             mainWindow.webContents.send('backend-status', 'Aplicação pronta!');
           }
           // Wait 1 second to show 100% progress before resolving
           setTimeout(() => {
             if (mainWindow && mainWindow.webContents) {
               mainWindow.webContents.send('backend-ready');
             }
             resolve();
           }, 1000);
           return;
         }
         
         if (attempts >= maxAttempts) {
           clearInterval(checkInterval);
           reject(new Error('Backend health check failed after multiple attempts'));
         }
       }, 1500);
     }, 3000);

         setTimeout(() => {
       reject(new Error('Backend startup timeout - took longer than 35 seconds'));
     }, 35000);
  });
}

app.whenReady().then(async () => {
  // Create window first to show splash screen immediately
  createWindow();
  
  try {
    await startBackend();
    // Backend started successfully - frontend will handle the transition
  } catch (error) {
    console.error('Failed to start application:', error);
    
    // Notify frontend about error
    if (mainWindow) {
      mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.send('backend-error', error.message);
      });
    }
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
