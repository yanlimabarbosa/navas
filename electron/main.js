const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

// Get images path from config file with fallback
function getImagensProdutosPath() {
  // Look for config file in the same directory as the executable
  const exePath = path.dirname(process.execPath);
  const configPath = path.join(exePath, 'soryan-caminho-imagens.txt');

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

// ============================================
// SECURE LICENSE MANAGEMENT SYSTEM v2.0
// Multi-layer security with anti-bypass protection
// ============================================
const crypto = require('crypto');
const https = require('https');

// Security keys (use SHA256 hash to ensure 32 bytes for AES-256)
const _0x5f2a = ['SoryanAssessoria', '2026', 'SecretKey', '!!'];
const RAW_KEY = _0x5f2a.join('');
const LICENSE_SECRET_KEY = crypto.createHash('sha256').update(RAW_KEY).digest();
const HMAC_SECRET = 'SoryanHMAC_Signature_Key_2026_Secure';
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

// ============================================
// BLACKLIST SYSTEM - Remote client blocking
// ============================================
// CONFIGURE THIS: URL of your GitHub Gist raw file with blocked clients
// Create a Gist at https://gist.github.com with a file containing blocked client names (one per line)
// Example: https://gist.githubusercontent.com/YOUR_USERNAME/GIST_ID/raw/blacklist.txt
const BLACKLIST_URL = 'https://gist.githubusercontent.com/rbsoriano/24ac75f73d5df96013c60780b9ff36e2/raw/gistfile1.txt';

// Check if client is blacklisted
function checkBlacklist(clientName) {
  return new Promise((resolve) => {
    if (!clientName) {
      resolve({ blocked: false });
      return;
    }

    const normalizedName = clientName.toLowerCase().trim();

    // Add timestamp to bypass GitHub cache
    const urlWithCache = BLACKLIST_URL + '?t=' + Date.now();

    https.get(urlWithCache, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          // Each line is a blocked client name
          const blockedClients = data.split('\n')
            .map(line => line.toLowerCase().trim())
            .filter(line => line.length > 0 && !line.startsWith('#'));

          const isBlocked = blockedClients.some(blocked =>
            normalizedName.includes(blocked) || blocked.includes(normalizedName)
          );

          resolve({ blocked: isBlocked, reason: isBlocked ? 'Acesso revogado pelo administrador' : null });
        } catch (e) {
          resolve({ blocked: false }); // On error, don't block
        }
      });
    }).on('error', () => {
      resolve({ blocked: false }); // On network error, don't block
    }).on('timeout', () => {
      resolve({ blocked: false }); // On timeout, don't block
    });
  });
}

// Persistent state file (hidden, tracks last verified time)
function getStatePath() {
  const exePath = path.dirname(process.execPath);
  return path.join(exePath, '.sys_state');
}

function getLicensePath() {
  const exePath = path.dirname(process.execPath);
  return path.join(exePath, 'license.dat');
}

// Encryption with HMAC signature for tamper detection
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(LICENSE_SECRET_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Add HMAC signature for integrity verification
  const payload = iv.toString('hex') + ':' + encrypted;
  const hmac = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');

  return payload + ':' + hmac;
}

function decrypt(encryptedText) {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return null;

    const [ivHex, encrypted, signature] = parts;

    // Verify HMAC signature first (tamper detection)
    const payload = ivHex + ':' + encrypted;
    const expectedHmac = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');

    if (signature !== expectedHmac) {
      console.error('LICENSE TAMPERING DETECTED! Signature mismatch.');
      return null;
    }

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, Buffer.from(LICENSE_SECRET_KEY), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decrypt error - possible tampering:', error.message);
    return null;
  }
}

// Save last verified time (encrypted)
function saveLastVerifiedTime(timestamp) {
  try {
    const statePath = getStatePath();
    const data = { lastVerified: timestamp, checksum: crypto.createHash('md5').update(String(timestamp)).digest('hex') };
    const encrypted = encrypt(JSON.stringify(data));
    fs.writeFileSync(statePath, encrypted, 'utf8');
  } catch (e) {
    // Silent fail
  }
}

// Get last verified time
function getLastVerifiedTime() {
  try {
    const statePath = getStatePath();
    if (fs.existsSync(statePath)) {
      const content = fs.readFileSync(statePath, 'utf8');
      const decrypted = decrypt(content);
      if (decrypted) {
        const data = JSON.parse(decrypted);
        // Verify checksum
        const expectedChecksum = crypto.createHash('md5').update(String(data.lastVerified)).digest('hex');
        if (data.checksum === expectedChecksum) {
          return data.lastVerified;
        }
      }
    }
  } catch (e) {
    // Silent fail
  }
  return null;
}

// Get current time from multiple online APIs (MANDATORY for security)
function getOnlineTime() {
  return new Promise((resolve) => {
    const timeApis = [
      { host: 'worldtimeapi.org', path: '/api/timezone/America/Sao_Paulo', parser: (d) => new Date(d.datetime) },
      { host: 'timeapi.io', path: '/api/Time/current/zone?timeZone=America/Sao_Paulo', parser: (d) => new Date(d.dateTime) },
      { host: 'www.timeapi.io', path: '/api/Time/current/zone?timeZone=America/Sao_Paulo', parser: (d) => new Date(d.dateTime) }
    ];

    let completed = false;
    let successCount = 0;
    const timeout = setTimeout(() => {
      if (!completed) {
        completed = true;
        resolve({ time: null, isOnline: false });
      }
    }, 10000);

    const tryApi = (index) => {
      if (index >= timeApis.length || completed) {
        if (!completed && successCount === 0) {
          completed = true;
          clearTimeout(timeout);
          resolve({ time: null, isOnline: false });
        }
        return;
      }

      const api = timeApis[index];
      const options = {
        hostname: api.host,
        path: api.path,
        method: 'GET',
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const time = api.parser(json);
            if (time && !isNaN(time.getTime()) && !completed) {
              completed = true;
              clearTimeout(timeout);
              // Save verified time for offline detection
              saveLastVerifiedTime(time.getTime());
              resolve({ time, isOnline: true });
            } else {
              tryApi(index + 1);
            }
          } catch (e) {
            tryApi(index + 1);
          }
        });
      });

      req.on('error', () => tryApi(index + 1));
      req.on('timeout', () => { req.destroy(); tryApi(index + 1); });
      req.end();
    };

    tryApi(0);
  });
}

function getLicenseInfo() {
  const licensePath = getLicensePath();

  try {
    if (fs.existsSync(licensePath)) {
      const encryptedContent = fs.readFileSync(licensePath, 'utf8');
      const decrypted = decrypt(encryptedContent);

      if (!decrypted) {
        // File was tampered with
        return { tampered: true };
      }

      const license = JSON.parse(decrypted);
      return license;
    }
  } catch (error) {
    return { tampered: true };
  }

  return null;
}

async function checkLicenseValidity() {
  const license = getLicenseInfo();

  // No license found
  if (!license) {
    return {
      valid: false,
      reason: 'no_license',
      message: 'Nenhuma licença encontrada'
    };
  }

  // License file was tampered
  if (license.tampered) {
    return {
      valid: false,
      reason: 'tampered',
      message: 'Arquivo de licença corrompido ou adulterado'
    };
  }

  // Verify license has required fields
  if (!license.activationDate || !license.planDays || !license.signature) {
    return {
      valid: false,
      reason: 'invalid',
      message: 'Licença inválida ou incompleta'
    };
  }

  // SECURITY: Check if client is in blacklist (remote blocking)
  const blacklistCheck = await checkBlacklist(license.clientName);
  if (blacklistCheck.blocked) {
    return {
      valid: false,
      reason: 'blacklisted',
      message: blacklistCheck.reason || 'Licença revogada',
      clientName: license.clientName
    };
  }

  // SECURITY: Verify activation date is not in the future (suspicious)
  const activationCheck = new Date(license.activationDate);
  const localNow = new Date();
  if (activationCheck > localNow) {
    return {
      valid: false,
      reason: 'tampered',
      message: 'Data de ativação inválida'
    };
  }

  // SECURITY: Verify planDays is a valid number (anti-manipulation)
  if (typeof license.planDays !== 'number' || license.planDays < 1 || license.planDays > 3650) {
    return {
      valid: false,
      reason: 'tampered',
      message: 'Período de licença inválido'
    };
  }

  // Verify internal signature (anti-edit protection)
  const signatureData = `${license.activationDate}:${license.planDays}:${license.clientName || ''}`;
  const expectedSignature = crypto.createHmac('sha256', HMAC_SECRET).update(signatureData).digest('hex').substring(0, 16);

  if (license.signature !== expectedSignature) {
    return {
      valid: false,
      reason: 'tampered',
      message: 'Licença adulterada detectada'
    };
  }

  // SECURITY: Increment and check run counter (detect suspicious activity)
  try {
    const counterPath = path.join(path.dirname(process.execPath), '.run_count');
    let runCount = 0;
    if (fs.existsSync(counterPath)) {
      const encrypted = fs.readFileSync(counterPath, 'utf8');
      const decrypted = decrypt(encrypted);
      if (decrypted) {
        const data = JSON.parse(decrypted);
        runCount = data.count || 0;
      }
    }
    runCount++;
    const counterData = encrypt(JSON.stringify({ count: runCount, lastRun: Date.now() }));
    fs.writeFileSync(counterPath, counterData, 'utf8');

    // If run count is suspiciously high (1000+ runs in a short period), may indicate bypass attempt
    // This is just monitoring, not blocking
    if (runCount > 1000) {
      console.warn('SECURITY WARNING: High run count detected:', runCount);
    }
  } catch (e) {
    // Silent fail - don't block for counter issues
  }

  // Get online time (MANDATORY - prevents date manipulation)
  const { time: onlineTime, isOnline } = await getOnlineTime();

  let now;

  if (isOnline && onlineTime) {
    now = onlineTime;
  } else {
    // Offline mode - use local time but verify against last known good time
    const lastVerified = getLastVerifiedTime();
    const localTime = new Date();

    if (lastVerified) {
      const lastVerifiedDate = new Date(lastVerified);

      // If local time is BEFORE last verified online time = clock manipulation
      if (localTime.getTime() < lastVerified - 60000) { // 1 min tolerance
        return {
          valid: false,
          reason: 'time_manipulation',
          message: 'Manipulação de data detectada. Conecte à internet para verificar.'
        };
      }

      // If too much time passed offline (more than 24h), require online check
      const hoursSinceLastCheck = (localTime.getTime() - lastVerified) / (1000 * 60 * 60);
      if (hoursSinceLastCheck > 24) {
        return {
          valid: false,
          reason: 'offline_too_long',
          message: 'Verificação online necessária. Conecte à internet.'
        };
      }
    } else {
      // Never verified online before - MUST go online first time
      return {
        valid: false,
        reason: 'first_run_offline',
        message: 'Primeira execução requer conexão com a internet.'
      };
    }

    now = localTime;
  }

  const activationDate = new Date(license.activationDate);
  const planDays = license.planDays;
  const expirationDate = new Date(activationDate);
  expirationDate.setDate(expirationDate.getDate() + planDays);

  const daysRemaining = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

  if (now > expirationDate) {
    return {
      valid: false,
      reason: 'expired',
      message: 'Licença expirada',
      planType: license.planType,
      clientName: license.clientName,
      activationDate: license.activationDate,
      expirationDate: expirationDate.toISOString().split('T')[0],
      daysExpired: Math.abs(daysRemaining)
    };
  }

  return {
    valid: true,
    planType: license.planType,
    clientName: license.clientName,
    activationDate: license.activationDate,
    expirationDate: expirationDate.toISOString().split('T')[0],
    daysRemaining: daysRemaining
  };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: false,
      allowRunningInsecureContent: false,
      experimentalFeatures: true, // Enable File System Access API
      webSecurity: false // Allow File System Access API
    },
    icon: path.join(__dirname, '../assets/navas-logo.jpg'),
    title: 'Soryan Assessoria'
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

// Enable File System Access API
app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('enable-file-system-access-api');

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

// Handle license status check
ipcMain.handle('get-license-status', () => {
  return checkLicenseValidity();
});

// Handle directory selection for batch export
ipcMain.handle('select-directory', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Selecionar pasta para salvar as imagens'
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }

    return null;
  } catch (error) {
    console.error('Error selecting directory:', error);
    return null;
  }
});

// Handle saving image to specific directory
ipcMain.handle('save-image-to-directory', async (event, dataURL, filename, directory) => {
  try {
    // Remove data URL prefix
    const base64Data = dataURL.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Create full file path
    const filePath = path.join(directory, filename);

    // Write file
    fs.writeFileSync(filePath, buffer);

    console.log(`Image saved to: ${filePath}`);
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Error saving image:', error);
    return { success: false, error: error.message };
  }
});
