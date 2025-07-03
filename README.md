# 🚂 Railway Parcel Management System

A comprehensive, enterprise-grade full-stack application for managing parcels between different railway stations. The system features OTP-based authentication, real-time messaging, parcel tracking, and role-based access control with persistent data storage.

## 🎯 System Overview

The Railway Parcel Management System is designed to streamline parcel operations across multiple railway stations with secure authentication, real-time communication, and robust data persistence. The system supports both station-level users and administrative oversight with comprehensive parcel lifecycle management.

## ✨ Key Features

### 🔐 **Authentication & Security**
- **OTP-Based Authentication**: Secure login via email OTP with 10-minute expiry
- **JWT Token Management**: Stateless session management with automatic token refresh
- **Role-Based Access Control**: User, Admin, and Master station permissions
- **Cross-Session Security**: Prevents token conflicts between admin and user sessions

### 📦 **Parcel Management**
- **Complete Parcel Lifecycle**: Create, track, update status, and manage parcels
- **Image Upload Support**: Attach images to parcels for better identification
- **Status Tracking**: Real-time status updates (pending, in_transit, delivered)
- **Station-to-Station Routing**: Seamless parcel transfer between stations

### 💬 **Communication System**
- **Inter-Station Messaging**: Real-time communication about parcels
- **Message Threading**: Organized conversations by parcel
- **Read/Unread Tracking**: Message status management
- **System-Wide Transparency**: All stations can view relevant messages

### 👥 **User Management**
- **Station-Based Users**: Users assigned to specific railway stations
- **Admin Panel**: Comprehensive user and station management
- **Dynamic User Creation**: Add users through admin interface
- **Persistent Data**: All user data survives Docker restarts

### 🏢 **Station Management**
- **Multi-Station Support**: 7 major railway stations
- **Master Station**: New Delhi (NDLS) with system-wide access
- **Station-Specific Views**: Tailored dashboards for each station
- **Code-Based Identification**: Unique station codes for easy reference

## 🛠️ Technology Stack

### **Frontend Technologies**
- **React 18.2.0**: Modern UI framework with hooks and context
- **Vite 5.0.0**: Fast build tool and development server
- **React Router DOM 6.19.0**: Client-side routing
- **Tailwind CSS 3.3.5**: Utility-first CSS framework
- **React Icons 4.12.0**: Comprehensive icon library
- **React Toastify 9.1.3**: Toast notifications
- **Axios 1.6.2**: HTTP client for API communication

### **Backend Technologies**
- **Node.js 18**: JavaScript runtime
- **Express.js 4.18.2**: Web application framework
- **Sequelize 6.32.1**: ORM for database management
- **SQLite3 5.1.7**: Lightweight, persistent database
- **JWT 9.0.1**: JSON Web Token authentication
- **Nodemailer 7.0.4**: Email service integration
- **Express FileUpload 1.5.1**: File upload handling
- **Express Validator 7.0.1**: Input validation
- **CORS 2.8.5**: Cross-origin resource sharing

### **Infrastructure & DevOps**
- **Docker & Docker Compose**: Containerized deployment
- **Persistent Volumes**: Data persistence across container restarts
- **Multi-Service Architecture**: Separate frontend and backend containers
- **Environment Configuration**: Flexible configuration management

### **Email Services**
- **Gmail SMTP**: Primary email service (crisrailwayhead@gmail.com)
- **Postmark**: Fallback email service
- **RapidAPI Email OTP**: Additional fallback service
- **HTML Email Templates**: Professional, branded email notifications

## 🏗️ System Architecture

### **High-Level Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │   SQLite DB     │
│   (Port 3001)   │◄──►│   (Port 8000)   │◄──►│  (Persistent)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vite Dev      │    │   OTP Service   │    │   File Storage  │
│   Server        │    │   (Gmail/API)   │    │   (Uploads)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow Architecture**
```
User Login Flow:
1. User enters email → Frontend sends OTP request
2. Backend generates OTP → Sends via Gmail SMTP
3. User enters OTP → Backend verifies and issues JWT
4. Frontend stores JWT → Subsequent requests authenticated

Parcel Management Flow:
1. Station user creates parcel → Backend stores in SQLite
2. Parcel status updates → Real-time database updates
3. Inter-station messaging → Message stored with parcel association
4. Image uploads → Files stored in persistent volume
```

## 📁 Project Structure

```
Parcel-Management-system/
├── 📦 client/                          # React Frontend
│   ├── 📄 package.json                 # Frontend dependencies
│   ├── 📄 vite.config.js               # Vite configuration with proxy
│   ├── 📄 tailwind.config.js           # Tailwind CSS configuration
│   ├── 📄 index.html                   # HTML entry point
│   └── 📂 src/                         # Source code
│       ├── 📄 main.jsx                 # React entry point
│       ├── 📄 App.jsx                  # Main App component with routing
│       ├── 📄 index.css                # Global styles
│       ├── 📂 components/              # Reusable components
│       │   ├── 📄 DashboardLayout.jsx  # Main layout wrapper
│       │   ├── 📄 LoadingSpinner.jsx   # Loading component
│       │   ├── 📄 NotificationSystem.jsx # Toast notifications
│       │   └── 📄 ProtectedRoute.jsx   # Route protection
│       ├── 📂 context/                 # React Context providers
│       │   └── 📄 AuthContext.jsx      # Authentication state management
│       ├── 📂 pages/                   # Page components
│       │   ├── 📄 Login.jsx            # User login page
│       │   ├── 📄 AdminLogin.jsx       # Admin login page
│       │   ├── 📄 Dashboard.jsx        # User dashboard
│       │   ├── 📄 AdminDashboard.jsx   # Admin dashboard
│       │   ├── 📄 StationDashboard.jsx # Station-specific dashboard
│       │   ├── 📄 MasterDashboard.jsx  # Master station dashboard
│       │   ├── 📄 Parcels.jsx          # Parcel management
│       │   ├── 📄 NewParcel.jsx        # Create new parcel
│       │   ├── 📄 ParcelDetail.jsx     # Parcel details view
│       │   ├── 📄 Messages.jsx         # Messaging system
│       │   ├── 📄 PublicTracking.jsx   # Public parcel tracking
│       │   └── 📄 NotFound.jsx         # 404 page
│       ├── 📂 services/                # API services
│       │   └── 📄 api.js               # Axios configuration with interceptors
│       └── 📂 utils/                   # Utility functions
│           └── 📄 qrGenerator.js       # QR code generation
│
├── 🖥️ server/                          # Express Backend
│   ├── 📄 package.json                 # Backend dependencies
│   ├── 📄 server.js                    # Express server setup
│   ├── 📄 startup.js                   # Application startup script
│   ├── 📄 init-data.js                 # Database initialization
│   ├── 📄 database.sqlite              # SQLite database file
│   ├── 📂 config/                      # Configuration files
│   │   └── 📄 config.js                # Database configuration
│   ├── 📂 controllers/                 # Route controllers
│   │   ├── 📄 authController.js        # Authentication logic
│   │   ├── 📄 adminController.js       # Admin operations
│   │   ├── 📄 userController.js        # User management
│   │   ├── 📄 stationController.js     # Station operations
│   │   ├── 📄 parcelController.js      # Parcel management
│   │   └── 📄 messageController.js     # Messaging system
│   ├── 📂 middlewares/                 # Express middlewares
│   │   └── 📄 auth.js                  # Authentication middleware
│   ├── 📂 models/                      # Sequelize models
│   │   ├── 📄 index.js                 # Database connection & associations
│   │   ├── 📄 User.js                  # User model
│   │   ├── 📄 Admin.js                 # Admin model
│   │   ├── 📄 Station.js               # Station model
│   │   ├── 📄 Parcel.js                # Parcel model
│   │   └── 📄 Message.js               # Message model
│   ├── 📂 routes/                      # API routes
│   │   ├── 📄 auth.js                  # Authentication routes
│   │   ├── 📄 admin.js                 # Admin routes
│   │   ├── 📄 users.js                 # User routes
│   │   ├── 📄 stations.js              # Station routes
│   │   ├── 📄 parcels.js               # Parcel routes
│   │   └── 📄 messages.js              # Message routes
│   ├── 📂 utils/                       # Utility functions
│   │   ├── 📄 otpGenerator.js          # OTP generation & email services
│   │   ├── 📄 seeder.js                # Database seeding
│   │   └── 📄 adminSeeder.js           # Admin user seeding
│   ├── 📂 uploads/                     # File upload storage
│   │   └── 📂 parcels/                 # Parcel images
│   └── 📂 data/                        # Persistent database storage
│
├── 🐳 docker-compose.yml               # Docker Compose configuration
├── 📄 package.json                     # Root package.json
└── 📄 README.md                        # Project documentation
```

## 🗄️ Database Schema

### **Core Entities & Relationships**

```sql
-- Users assigned to stations
Users (id, name, email, phone, station_id, role, createdAt, updatedAt)
  ↓ (belongs to)
Stations (id, name, location, is_master, code, createdAt, updatedAt)
  ↑ (has many)
Parcels (id, sender_station_id, receiver_station_id, tracking_number, status, weight, description, sender_name, receiver_name, sender_contact, receiver_contact, createdAt, updatedAt)
  ↑ (has many)
Messages (id, from_station, to_station, parcel_id, content, read, is_master_copied, createdAt, updatedAt)

-- Admin users (separate from station users)
Admins (id, username, email, role, last_otp, otp_expires_at, createdAt, updatedAt)
```

### **Key Relationships**
- **User ↔ Station**: Many-to-One (Users belong to stations)
- **Station ↔ Parcel**: One-to-Many (Stations send/receive parcels)
- **Parcel ↔ Message**: One-to-Many (Messages about parcels)
- **Station ↔ Message**: Many-to-Many (Messages between stations)

## 🚀 Quick Start

### **Prerequisites**
- Docker and Docker Compose
- Git

### **1. Clone and Setup**
   ```bash
   git clone <repository-url>
cd Parcel-Management-system
   ```

### **2. Start with Docker**
   ```bash
docker-compose up --build
docker-compose logs -f
docker-compose down
```

### **3. Access the Application**
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8000

### **4. Initial Login**
- **Admin**: `admin@railway.com` (OTP will be sent to Gmail)
- **Test User**: `tanushsinghal22082004@gmail.com` (Delhi station)
- **Test User**: `airccode42@gmail.com` (Gaya station - if manually added)

## 🔧 Configuration

### **Environment Variables**
   ```bash
# Server Configuration
PORT=8000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key

# Email Configuration (Gmail SMTP)
GMAIL_USER=crisrailwayhead@gmail.com
GMAIL_PASS=eknl hlkq cppj ofcw

# Database Configuration
DB_PATH=/app/data/database.sqlite
```

### **Docker Configuration**
- **Frontend Port**: 3001 (mapped from container 3000)
- **Backend Port**: 8000
- **Database Volume**: `parcel-management-system_db-data`
- **Network**: `app-network` (bridge)

## 📊 Railway Stations

| Station Code | Station Name         | Location  | Role      | Default User |
|--------------|----------------------|-----------|-----------|--------------|
| CNB          | KANPUR CENTRAL JN.   | Kanpur    | station   | TEST         |
| DHN          | DHANBAD JN.          | Dhanbad   | station   | DHNTEST      |
| DLI          | DELHI JN.            | Delhi     | station   | VVJ          |
| GAYA         | GAYA JN.             | Gaya      | station   | VSC          |
| HWH          | HOWRAH JN.           | Howrah    | station   | VPW          |
| NDLS         | NEW DELHI            | New Delhi | master    | XYZ          |
| SDAH         | SEALDAH              | Sealdah   | station   | SDAHTEST     |

## 🔐 Authentication Flow

### **User Authentication**
1. **OTP Request**: User enters email → System sends 6-digit OTP via Gmail
2. **OTP Verification**: User enters OTP → System validates and issues JWT token
3. **Session Management**: Frontend stores JWT → Automatic token inclusion in requests
4. **Token Validation**: Backend validates JWT on each protected request

### **Admin Authentication**
1. **Admin OTP**: Admin enters email → System sends OTP to admin email
2. **Admin Verification**: Admin enters OTP → System issues admin JWT with `isAdmin` flag
3. **Admin Access**: Admin token provides access to user/station management

### **Security Features**
- **Token Expiry**: JWT tokens expire after 24 hours
- **OTP Expiry**: OTP codes expire after 10 minutes
- **Cross-Session Protection**: Prevents admin/user token conflicts
- **Automatic Logout**: Invalid tokens trigger automatic logout

## 📡 API Endpoints

### **Authentication**
```http
POST /api/auth/send-otp          # Send OTP to user email
POST /api/auth/verify-otp        # Verify OTP and login
GET  /api/auth/me                # Get current user info
```

### **Admin Operations**
```http
POST /api/admin/send-otp         # Send OTP to admin
POST /api/admin/verify-otp       # Verify admin OTP
GET  /api/admin/me               # Get current admin info
GET  /api/admin/users            # Get all users
POST /api/admin/users            # Create new user
PUT  /api/admin/users/:id        # Update user
DELETE /api/admin/users/:id      # Delete user
GET  /api/admin/stations         # Get all stations
POST /api/admin/stations         # Create new station
```

### **Parcel Management**
```http
GET  /api/parcels                # Get all parcels (master only)
GET  /api/parcels/station/:id    # Get station parcels
GET  /api/parcels/:id            # Get parcel details
POST /api/parcels                # Create new parcel
POST /api/parcels/:id/image      # Upload parcel image
PUT  /api/parcels/:id/status     # Update parcel status
DELETE /api/parcels/:id          # Delete parcel
```

### **Messaging System**
```http
GET  /api/messages               # Get all messages
GET  /api/messages/station/:id   # Get station messages
GET  /api/messages/unread/:id    # Get unread messages
POST /api/messages               # Create new message
PUT  /api/messages/:id/read      # Mark message as read
DELETE /api/messages/:id         # Delete message
```

### **Public Tracking**
```http
GET  /api/parcels/track/:number  # Track parcel by number
```

## 🔄 Data Persistence

### **Database Persistence**
- **SQLite Database**: Stored in `/app/data/database.sqlite`
- **Docker Volume**: `parcel-management-system_db-data`
- **Schema Preservation**: Existing databases preserved on restart
- **Smart Initialization**: Only seeds new databases, preserves existing data

### **File Storage**
- **Upload Directory**: `/app/uploads/parcels/`
- **Image Support**: Parcel images stored locally
- **Volume Mapping**: Uploads persist across container restarts

### **Session Persistence**
- **JWT Tokens**: Stored in browser localStorage
- **User Data**: Cached in localStorage with server validation
- **Admin Sessions**: Separate token management for admin operations

## 🚨 Error Handling

### **Frontend Error Handling**
- **Network Errors**: Automatic retry with user feedback
- **Authentication Errors**: Automatic logout and redirect
- **Validation Errors**: Real-time form validation with toast notifications
- **API Errors**: Centralized error handling with user-friendly messages

### **Backend Error Handling**
- **Database Errors**: Graceful handling with detailed logging
- **Validation Errors**: Input validation with clear error messages
- **Authentication Errors**: Proper HTTP status codes and messages
- **File Upload Errors**: Size limits and format validation

## 🔍 Monitoring & Logging

### **Application Logs**
- **Server Logs**: Express.js request/response logging
- **Database Logs**: Sequelize query logging
- **Email Logs**: OTP delivery status logging
- **Error Logs**: Detailed error tracking with stack traces

### **Performance Monitoring**
- **Response Times**: API endpoint performance tracking
- **Database Queries**: Query optimization monitoring
- **File Uploads**: Upload size and performance tracking
- **Memory Usage**: Container resource monitoring

## 🧪 Testing

### **Manual Testing Scenarios**
1. **User Authentication**: OTP login flow
2. **Admin Operations**: User and station management
3. **Parcel Lifecycle**: Create → Update → Track → Complete
4. **Messaging System**: Inter-station communication
5. **Data Persistence**: Docker restart verification
6. **File Uploads**: Parcel image upload and retrieval

### **Test Users**
- **Admin**: `admin@railway.com`
- **Delhi User**: `tanushsinghal22082004@gmail.com`
- **Gaya User**: `airccode42@gmail.com` (manually added)

## 🚀 Deployment

### **Production Considerations**
- **Environment Variables**: Secure configuration management
- **Database Backups**: Regular SQLite database backups
- **SSL/TLS**: HTTPS configuration for production
- **Load Balancing**: Multiple container instances
- **Monitoring**: Application performance monitoring
- **Logging**: Centralized log management

### **Scaling Strategy**
- **Horizontal Scaling**: Multiple backend instances
- **Database Scaling**: Migration to PostgreSQL/MySQL
- **File Storage**: Cloud storage integration (AWS S3, etc.)
- **Caching**: Redis for session and data caching
- **CDN**: Static asset delivery optimization

## 🔧 Development

### **Local Development**
   ```bash
# Install dependencies
npm run install:all

# Start development servers
   npm run dev

# Docker development
docker-compose up --build
```

### **Code Quality**
- **ESLint**: JavaScript/React code linting
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit validation
- **TypeScript**: Future migration consideration

## 📈 Future Enhancements

### **Planned Features**
- **Real-time Notifications**: WebSocket integration
- **Mobile App**: React Native application
- **Advanced Analytics**: Parcel tracking analytics
- **API Documentation**: Swagger/OpenAPI integration
- **Multi-language Support**: Internationalization
- **Advanced Search**: Full-text search capabilities

### **Technical Improvements**
- **TypeScript Migration**: Type safety improvements
- **Testing Framework**: Jest and React Testing Library
- **CI/CD Pipeline**: Automated testing and deployment
- **Microservices**: Service decomposition
- **Event Sourcing**: Audit trail implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**🚂 Railway Parcel Management System** - Streamlining parcel operations across railway networks with modern technology and robust architecture.