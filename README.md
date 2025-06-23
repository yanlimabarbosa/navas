# Navas Promoções Desktop App

This is a desktop application built with Electron that combines the Navas frontend (React + Vite) and backend (Spring Boot) into a single executable.

## Prerequisites

- Node.js (v16 or higher)
- Java 24 (for the Spring Boot backend)
- Maven (or use the included Maven wrapper)

## Installation

1. Install the root dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd navas-front
npm install
```

3. Install backend dependencies (Maven will handle this automatically):
```bash
cd navas-backend
./mvnw clean install
```

## Development

To run the application in development mode:

```bash
npm run dev
```

This will:
- Start the Spring Boot backend on port 8080
- Start the Vite dev server on port 5173
- Launch the Electron app

## Building

To build the application for distribution:

```bash
npm run build
npm run dist
```

This will:
- Build the frontend (Vite build)
- Package the backend (Maven package)
- Create an Electron distributable

## Project Structure

```
├── electron/           # Electron main process files
│   ├── main.js        # Main Electron process
│   └── preload.js     # Preload script for security
├── navas-front/        # React frontend
├── navas-backend/      # Spring Boot backend
├── assets/            # App icons and resources
└── package.json       # Root package.json for Electron
```

## Scripts

- `npm run dev` - Start development mode
- `npm run build` - Build both frontend and backend
- `npm run dist` - Create distributable
- `npm start` - Start Electron app (requires built frontend)

## Notes

- The backend runs on port 8080
- The frontend dev server runs on port 5173
- In production, the frontend is served from the built files
- The backend JAR is included as an extra resource in the Electron app 