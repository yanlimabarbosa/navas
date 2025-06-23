# Navas Promoções - Quick Start Guide

## 🏗️ Building the Production Electron App

If you want to generate the production build (the folder you send to users):

1. **Make sure you have installed all dependencies:**
   ```bash
   npm install
   cd navas-front
   npm install
   cd ..
   ```
2. **Build the app:**
   ```bash
   npm run build
   npm run dist
   ```
3. **Find the build output:**
   - The production build will be in the `dist/win-unpacked/` folder.
   - This folder contains `Navas Promoções.exe`, the `database/` folder (created after first run), and all required files.
4. **To distribute:**
   - Zip the entire `win-unpacked` folder and send it to your users.

---

## 🖥️ Running the App in Production Mode (Electron Build)

1. **Download the ZIP file** containing the Electron build (e.g., `Navas-Promocoes.zip`).
2. **Extract** the ZIP file to a folder on your computer (e.g., `C:\Users\YourName\Desktop\NavasPromo`).
3. **Open the extracted folder**. You should see:
   - `Navas Promoções.exe`
   - `database/` folder (created after first run)
   - Several `.dll` files, `resources/`, `locales/`, etc.
4. **Double-click** `Navas Promoções.exe` to start the app.
5. **All your data is stored in the `database/` folder** next to the `.exe`.
   - To backup or move your data, copy the entire folder (including `database/`).

> **Note:** Do not move or delete any files in the folder. The `.exe` will not work if you move it alone.

---

## 🛠️ Running the App in Development Mode

### Prerequisites
- **Node.js** (v18 or higher)
- **Java** (JDK 17 or higher)
- **Git**

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd ROOT-FOLDER
   ```
2. **Install root dependencies:**
   ```bash
   npm install
   ```
3. **Install frontend dependencies:**
   ```bash
   cd navas-front
   npm install
   cd ..
   ```
4. **Start the app in development mode:**
   ```bash
   npm run dev
   ```
   - This will start the backend, frontend, and Electron in dev mode.
   - The database will be stored in the backend folder as `navasdb-dev.mv.db` (if configured for file-based H2).

---

## 📦 Database Location

- **Production (Electron Build):**
  - `database/navas-db.mv.db` (next to the `.exe`)
- **Development:**
  - `navas-backend/navasdb-dev.mv.db` (if using file-based H2)

---

## 🔄 Backup & Restore

- **To backup:** Copy the entire folder (including the `database/` folder).
- **To restore:** Replace the `database/navas-db.mv.db` file with your backup.

---

**That's it!**
- For production, just extract and run the `.exe`.
- For development, clone, install, and run with `npm run dev`. 