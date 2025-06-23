# Navas Promoções - Fullstack Electron Desktop Application

A comprehensive desktop application for managing promotional flyers, built with React frontend, Spring Boot backend, and packaged as an Electron app.

## 🏗️ Architecture Overview

This is a **fullstack desktop application** that combines:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Spring Boot + JPA + Hibernate
- **Database**: H2 (embedded) for production, PostgreSQL for development
- **Desktop Wrapper**: Electron
- **State Management**: React Query (TanStack Query)
- **UI Components**: Radix UI + Custom components

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Frontend      │  │    Backend      │  │   Database   │ │
│  │   (React)       │◄─┤  (Spring Boot)  │◄─┤   (H2/PostgreSQL) │
│  │   Port: 5173    │  │   Port: 8080    │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
FREELA-RAFSOOR/
├── electron/                    # Electron main process files
│   ├── main.js                 # Main process entry point
│   └── preload.js              # Preload script for security
├── navas-backend/              # Spring Boot backend
│   ├── src/main/java/          # Java source code
│   │   └── com/navas/navas/
│   │       ├── config/         # Configuration classes
│   │       └── project/        # Main business logic
│   │           ├── controller/ # REST API endpoints
│   │           ├── dto/        # Data Transfer Objects
│   │           ├── model/      # JPA entities
│   │           ├── repository/ # Data access layer
│   │           └── service/    # Business logic layer
│   ├── src/main/resources/     # Configuration files
│   │   └── application.properties # Database & app config
│   ├── pom.xml                 # Maven dependencies
│   └── target/                 # Compiled Java classes
├── navas-front/                # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   └── ui/            # Reusable UI components
│   │   ├── api/               # API client functions
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite configuration
├── package.json               # Root package.json (Electron)
└── README.md                  # This file
```

## 🚀 Quick Start (Easiest Way to Run)

### Prerequisites
- **Node.js** (v18 or higher)
- **Java** (JDK 17 or higher)
- **Git**

### One-Command Setup & Run

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd FREELA-RAFSOOR

# 2. Install all dependencies (frontend + electron)
npm install

# 3. Install frontend dependencies
cd navas-front && npm install && cd ..

# 4. Run in development mode (starts everything)
npm run dev
```

This single command will:
- Start the Spring Boot backend (H2 database)
- Start the React frontend development server
- Launch the Electron app
- Open the desktop application

## 🔧 Detailed Setup Instructions

### Step 1: Install Prerequisites

#### Node.js Installation
```bash
# Download from https://nodejs.org/
# Or use a version manager like nvm
nvm install 18
nvm use 18
```

#### Java Installation
```bash
# Download JDK 17+ from https://adoptium.net/
# Verify installation
java -version
javac -version
```

#### Git Installation
```bash
# Download from https://git-scm.com/
git --version
```

### Step 2: Clone and Setup Project

```bash
# Clone the repository
git clone <your-repo-url>
cd FREELA-RAFSOOR

# Install root dependencies (Electron + build tools)
npm install

# Install frontend dependencies
cd navas-front
npm install
cd ..

# Verify Maven wrapper exists
ls navas-backend/mvnw*
```

### Step 3: Database Setup

#### Development Mode (PostgreSQL - Optional)
```bash
# If you want to use PostgreSQL for development
docker run -d \
  --name navas-postgres \
  -e POSTGRES_DB=navas \
  -e POSTGRES_USER=navas \
  -e POSTGRES_PASSWORD=navas123 \
  -p 5434:5432 \
  postgres:15

# Run backend with PostgreSQL profile
cd navas-backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

#### Production Mode (H2 - Default)
```bash
# H2 database is embedded and requires no setup
# It's automatically used in production builds
```

### Step 4: Running the Application

#### Development Mode
```bash
# Start everything (backend + frontend + electron)
npm run dev
```

#### Production Mode
```bash
# Build the entire application
npm run dist

# Run the packaged application
# The .exe file will be in the dist/ folder
```

## 🗄️ Database Architecture

### Database Options

#### H2 Database (Production/Default)
- **Type**: Embedded, in-memory database
- **Persistence**: File-based (navasdb.mv.db)
- **Pros**: No external dependencies, portable
- **Cons**: Limited concurrent users, not suitable for large datasets
- **Location**: `navas-backend/target/navasdb.mv.db`

#### PostgreSQL (Development)
- **Type**: External, client-server database
- **Persistence**: Docker volume or local installation
- **Pros**: ACID compliance, concurrent users, scalability
- **Cons**: Requires external setup, more complex deployment

### Database Configuration

The application uses Spring Boot profiles to switch between databases:

```properties
# application.properties
# Development Profile (PostgreSQL)
spring.config.activate.on-profile=dev
spring.datasource.url=jdbc:postgresql://localhost:5434/navas

# Development Profile (H2)
spring.config.activate.on-profile=dev-h2
spring.datasource.url=jdbc:h2:mem:navasdb

# Production Profile (H2 with file persistence)
spring.config.activate.on-profile=prod
spring.datasource.url=jdbc:h2:file:./navasdb
```

### Data Persistence & Safety

#### H2 Database Safety
- **Data Loss Risk**: Low (file-based persistence)
- **Backup Strategy**: Copy `navasdb.mv.db` file
- **Recovery**: Replace the .mv.db file
- **Limitations**: Single-user access recommended

#### PostgreSQL Safety
- **Data Loss Risk**: Very Low (ACID compliance)
- **Backup Strategy**: PostgreSQL dump commands
- **Recovery**: Restore from backup files
- **Docker Volume**: `docker volume create navas-data`

## 🔄 Communication Flow

### Frontend ↔ Backend Communication

```
┌─────────────┐    HTTP/REST    ┌─────────────┐
│   React     │ ──────────────► │ Spring Boot │
│  Frontend   │                 │   Backend   │
│             │ ◄────────────── │             │
└─────────────┘    JSON Data    └─────────────┘
```

#### API Endpoints
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `GET /api/projects/{id}` - Get specific project

#### Data Flow Example
1. User uploads Excel file → Frontend processes data
2. Frontend sends POST to `/api/projects` → Backend saves to database
3. Backend returns saved project → Frontend updates UI
4. React Query invalidates cache → Fresh data fetched

## ⚡ Electron Integration

### How Electron Wraps Everything

```javascript
// electron/main.js
const { app, BrowserWindow } = require('electron');

// 1. Start backend server
const backendProcess = spawn('java', ['-jar', 'backend.jar']);

// 2. Create window and load frontend
const mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
  }
});

// 3. Load the React app
mainWindow.loadURL('http://localhost:5173');
```

### Development vs Production Mode

#### Development Mode
- Backend runs as separate process
- Frontend runs on Vite dev server
- Hot reload enabled
- Debugging tools available

#### Production Mode
- Backend packaged as JAR file
- Frontend built to static files
- Everything bundled in single executable
- No external dependencies

## 🛠️ Build Process

### Frontend Build (React)
```bash
cd navas-front
npm run build
# Output: navas-front/dist/
```

### Backend Build (Spring Boot)
```bash
cd navas-backend
./mvnw clean package -DskipTests
# Output: navas-backend/target/navas-0.0.1-SNAPSHOT.jar
```

### Electron Packaging
```bash
npm run dist
# Output: dist/win-unpacked/navas-electron-app.exe
```

## 📦 Package.json Scripts Explained

### Root Package.json
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\" \"wait-on http://localhost:8080 && electron .\"",
    "dev:frontend": "cd navas-front && npm run dev",
    "dev:backend": "cd navas-backend && ./mvnw spring-boot:run",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd navas-front && npm run build",
    "build:backend": "cd navas-backend && ./mvnw clean package -DskipTests",
    "dist": "npm run build && electron-builder"
  }
}
```

### What Each Script Does
- `dev`: Starts everything in development mode
- `build`: Builds both frontend and backend
- `dist`: Creates distributable executable

## 🔒 Security Considerations

### Electron Security
- **Context Isolation**: Enabled (prevents direct Node.js access)
- **Node Integration**: Disabled (security best practice)
- **Preload Script**: Used for safe API communication

### API Security
- **CORS**: Configured for local development
- **Input Validation**: Spring Boot validation annotations
- **SQL Injection**: Prevented by JPA/Hibernate

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check Java version
java -version

# Check if port 8080 is available
netstat -an | findstr :8080

# Run with verbose logging
cd navas-backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev-h2
```

#### Frontend Won't Start
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
cd navas-front
rm -rf node_modules package-lock.json
npm install
```

#### Electron Won't Start
```bash
# Check if backend is running
curl http://localhost:8080/api/projects

# Check if frontend is running
curl http://localhost:5173

# Run with debugging
npm run dev -- --inspect
```

#### Database Issues
```bash
# H2 Console (if enabled)
http://localhost:8080/h2-console

# Check database file
ls navas-backend/target/*.mv.db
```

## 📋 .gitignore Recommendations

```gitignore
# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
build/
*/dist/
*/build/
navas-backend/target/

# Database files
*.mv.db
*.trace.db

# Logs
*.log
npm-debug.log*

# Environment files
.env
.env.local
.env.production

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Electron
out/
app/

# Temporary files
*.tmp
*.temp
```

## 🏗️ Architecture Analysis

### Pros of This Architecture

#### ✅ Advantages
- **Single Executable**: Easy distribution and installation
- **No External Dependencies**: Self-contained application
- **Cross-Platform**: Works on Windows, macOS, Linux
- **Offline Capability**: Works without internet
- **Rapid Development**: Hot reload in development
- **Familiar Technologies**: React + Spring Boot

#### ❌ Limitations
- **Performance**: Electron overhead (~100MB base size)
- **Scalability**: Limited to single-user scenarios
- **Memory Usage**: Higher than native applications
- **Update Process**: Manual distribution required
- **Database Limitations**: H2 not suitable for large datasets

### Alternative Architectures

#### Web Application
```
Frontend (React) ↔ Backend (Spring Boot) ↔ Database (PostgreSQL)
```
- **Pros**: Multi-user, scalable, easy updates
- **Cons**: Requires server deployment, internet dependency

#### Native Desktop App
```
Native UI (JavaFX/Swing) ↔ Database (SQLite/PostgreSQL)
```
- **Pros**: Better performance, smaller size
- **Cons**: Platform-specific, more complex development

#### Microservices
```
Frontend ↔ API Gateway ↔ Multiple Services ↔ Databases
```
- **Pros**: Highly scalable, modular
- **Cons**: Complex deployment, overkill for this use case

## 🔄 State Management

### React Query (TanStack Query)
```typescript
// API calls with caching and invalidation
const { data: projects, isLoading } = useQuery({
  queryKey: ['projects'],
  queryFn: getProjects,
  staleTime: 0, // Immediate refetch when invalidated
});

const saveMutation = useMutation({
  mutationFn: saveProject,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  },
});
```

### Benefits
- **Automatic Caching**: Reduces API calls
- **Background Updates**: Keeps data fresh
- **Optimistic Updates**: Better UX
- **Error Handling**: Built-in retry logic

## 🎨 UI/UX Features

### Component Architecture
- **Atomic Design**: Reusable UI components
- **Responsive Design**: Works on different screen sizes
- **Dark/Light Theme**: Theme switching capability
- **Toast Notifications**: User feedback system

### Key Components
- `ProductCard`: Displays product information
- `ConfigPanel`: Flyer configuration settings
- `FileUploader`: Excel file processing
- `FlyerPreview`: Real-time preview generation

## 📊 Data Flow Examples

### Excel Upload Process
1. User selects Excel file
2. Frontend reads file using XLSX library
3. Data processed into ProductGroup objects
4. Groups displayed in preview
5. User configures flyer settings
6. Data sent to backend via API
7. Backend saves to database
8. Success notification shown

### Project Loading Process
1. User clicks "Load Project"
2. Frontend fetches project list from API
3. User selects project from modal
4. Project data loaded into state
5. UI updates with project data
6. User can edit and save changes

## 🚀 Deployment Strategies

### Development Deployment
```bash
# Local development
npm run dev

# With PostgreSQL
docker-compose up -d
npm run dev
```

### Production Deployment
```bash
# Build executable
npm run dist

# Distribute .exe file
# Users just double-click to run
```

### Docker Deployment (Alternative)
```dockerfile
FROM openjdk:17-jre-slim
COPY navas-backend/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

## 🔧 Configuration Management

### Environment Variables
```bash
# Development
NODE_ENV=development
SPRING_PROFILES_ACTIVE=dev-h2

# Production
NODE_ENV=production
SPRING_PROFILES_ACTIVE=prod
```

### Configuration Files
- `application.properties`: Spring Boot configuration
- `vite.config.ts`: Frontend build configuration
- `electron-builder.json`: Electron packaging configuration

## 📈 Performance Optimization

### Frontend Optimizations
- **Code Splitting**: Dynamic imports for large components
- **Bundle Analysis**: Monitor bundle size
- **Image Optimization**: Compress product images
- **Lazy Loading**: Load components on demand

### Backend Optimizations
- **Database Indexing**: Optimize query performance
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis for frequently accessed data
- **Compression**: Gzip response compression

## 🔍 Monitoring & Debugging

### Development Tools
- **React DevTools**: Component inspection
- **React Query DevTools**: Cache management
- **Spring Boot Actuator**: Backend monitoring
- **H2 Console**: Database inspection

### Logging
```properties
# application.properties
logging.level.com.navas=DEBUG
logging.level.org.springframework.web=DEBUG
```

## 🧪 Testing Strategy

### Frontend Testing
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Backend Testing
```bash
# Unit tests
./mvnw test

# Integration tests
./mvnw verify
```

## 📚 Learning Resources

### Essential Concepts to Understand
1. **Electron Architecture**: Main vs Renderer processes
2. **Spring Boot Profiles**: Environment-specific configuration
3. **React Query**: Server state management
4. **JPA/Hibernate**: Object-relational mapping
5. **TypeScript**: Type safety in JavaScript
6. **Vite**: Modern build tool
7. **Tailwind CSS**: Utility-first CSS framework

### Recommended Reading
- [Electron Documentation](https://www.electronjs.org/docs)
- [Spring Boot Guide](https://spring.io/guides)
- [React Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m 'Add feature'`
5. Push to branch: `git push origin feature-name`
6. Create Pull Request

### Code Standards
- **Frontend**: ESLint + Prettier
- **Backend**: Checkstyle + SpotBugs
- **Commits**: Conventional Commits format
- **Documentation**: Update README for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Getting Help
1. Check the troubleshooting section above
2. Review the architecture documentation
3. Check existing issues in the repository
4. Create a new issue with detailed information

### Issue Template
```markdown
**Environment:**
- OS: [Windows/macOS/Linux]
- Node.js version: [version]
- Java version: [version]
- Electron version: [version]

**Problem:**
[Describe the issue]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Additional Information:**
[Logs, screenshots, etc.]
```

---

**Happy Coding! 🚀**

This comprehensive documentation should give you a deep understanding of the entire application architecture and help you maintain, extend, and troubleshoot the system effectively.

# 🖥️ How to Run the Electron Build (Production Executable)

## Quick Start for End Users

1. **Download the ZIP file** containing the Electron build (usually named `Navas-Promocoes.zip` or similar).
2. **Extract** the ZIP file to a folder on your computer (e.g., `C:\Users\YourName\Desktop\NavasPromo`).
3. **Open the extracted folder**. You should see files like:
   - `Navas Promoções.exe`
   - `ffmpeg.dll`, `icudtl.dat`, and other `.dll` files
   - `resources/`, `locales/`, etc.
4. **Double-click** `Navas Promoções.exe` to start the app.
5. **Do not move or delete any files** in the folder. All files are required for the app to run.

## Important Notes
- **You must keep all files together** in the same folder. The `.exe` will not work if you move it alone.
- **The database is stored in your Windows user profile** (AppData) by default:
  - `%APPDATA%\navas-electron-app\database\navas-db.mv.db`
- **To backup your data**, copy the `navas-db.mv.db` file from the above location.
- **If you want a portable version** (database in the same folder as the .exe), ask your developer for a custom build. 