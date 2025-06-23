# Railway Parcel Management System

A full-stack application for managing parcels between different railway stations. The system allows for OTP-based authentication, station-specific views, and the ability to exchange messages between stations about parcels.

## Features

- **User Management**: Railway station-based users with role-based permissions
- **OTP Authentication**: Login via one-time passwords sent to email
- **Parcel Tracking**: Create, update, and monitor parcels between railway stations
- **Parcel Images**: Upload and view images of parcels for better identification
- **Messaging System**: Inter-station communication about parcels
- **Master Station**: New Delhi (NDLS) station with visibility into all messages and parcels

## Tech Stack

- **Frontend**: React with Vite, styled with Tailwind CSS
- **Backend**: Express.js (Node.js)
- **Database**: SQLite with Sequelize ORM
- **Authentication**: OTP-based with JWT for session management
- **File Storage**: Local file storage for parcel images
- **Docker**: Containerized setup for easy deployment

## Project Structure

```
/
├── client/              # React frontend
│   ├── public/          # Static files
│   ├── src/             # Source files
│   │   ├── assets/      # Images, fonts, etc.
│   │   ├── components/  # React components
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service functions
│   │   ├── utils/       # Utility functions
│   │   ├── App.jsx      # Main App component
│   │   └── main.jsx     # Entry point
│   └── package.json     # Frontend dependencies
│
├── server/              # Express backend
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Express middlewares
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded files storage
│   ├── utils/           # Utility functions
│   ├── server.js        # Server entry point
│   └── package.json     # Backend dependencies
│
├── docker-compose.yml   # Docker Compose configuration
├── .env                 # Environment variables (create from config.env.example)
└── README.md            # Project documentation
```

## Docker Setup

The easiest way to run this application is with Docker:

### Prerequisites

- Docker and Docker Compose installed on your machine

### Running with Docker

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd railway-parcel-management-system
   ```

2. Create a `.env` file in the server directory:
   ```bash
   cp server/config.env.example server/.env
   ```

3. Build and start the Docker containers:
   ```bash
   docker-compose up --build
   ```

4. Access the application at:
   ```
   Frontend: http://localhost:3000
   Backend API: http://localhost:8000
   ```

5. To stop the application:
   ```bash
   docker-compose down
   ```

All data will be stored in a persistent Docker volume, ensuring your data is preserved across container restarts.

## Standard Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone <repository-url>
   cd railway-parcel-management-system
   npm run install:all
   ```

2. Create a `.env` file in the server directory:
   ```bash
   cd server
   cp config.env.example .env
   ```

3. Update the `.env` file with your configuration.

### Running the System

1. To set up the railway stations and users:
   ```bash
   cd server
   node update-stations.js
   ```

2. Start the server (backend):
   ```bash
   # From the server directory
   node server.js
   # or with nodemon for development:
   nodemon server.js
   ```

3. Start the client (frontend) in a separate terminal:
   ```bash
   # From the client directory
   npm run dev
   ```

4. Access the application at:
   ```
   Frontend: http://localhost:3000
   Backend API: http://localhost:8000
   ```
   
Note: The system is configured to use specific ports:
- Frontend (React): Port 3000
- Backend (Express): Port 8000

## Railway Stations and Users

The system is configured with the following railway stations:

| Station Code | Station Name         | Role      |
|--------------|----------------------|-----------|
| CNB          | KANPUR CENTRAL JN.   | station   |
| DHN          | DHANBAD JN.          | station   |
| DLI          | DELHI JN.            | station   |
| GAYA         | GAYA JN.             | station   |
| HWH          | HOWRAH JN.           | station   |
| NDLS         | NEW DELHI            | master    |
| SDAH         | SEALDAH              | station   |

* NEW DELHI (NDLS) is the master station and has access to all parcels and messages in the system.
* Each station has associated user accounts. Only the master station (NDLS) can create new users and assign them to stations.

## User-Station Assignment

In this system:
1. Each user is assigned to a specific railway station
2. Admin section 
3. Other stations can see:
   - Their own parcels (sent or received)
   - All messages for system-wide transparency

## Admin Access

To access the admin section, use the following credentials:

- **Email**: admin@example.com
- **Role**: admin

Use this email to log in and manage users and stations.

## Authentication

To login, use an email address associated with a railway station user. The system uses OTP-based authentication. In development mode, the OTP code is displayed in the server console logs.


## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to user
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users` - Get all users (master only)
- `GET /api/users/:id` - Get user by ID (master only)
- `POST /api/users` - Create a new user (master only)
- `PUT /api/users/:id` - Update a user (master only)
- `DELETE /api/users/:id` - Delete a user (master only)

### Stations
- `GET /api/stations` - Get all stations
- `GET /api/stations/:id` - Get station by ID
- `POST /api/stations` - Create a new station (master only)
- `PUT /api/stations/:id` - Update a station (master only)
- `DELETE /api/stations/:id` - Delete a station (master only)

### Parcels
- `GET /api/parcels` - Get all parcels (master only)
- `GET /api/parcels/station/:stationId` - Get parcels for a station
- `GET /api/parcels/:id` - Get parcel by ID
- `POST /api/parcels` - Create a new parcel
- `POST /api/parcels/:id/image` - Upload parcel image
- `PUT /api/parcels/:id/status` - Update parcel status
- `DELETE /api/parcels/:id` - Delete a parcel (master only)

### Messages
- `GET /api/messages` - Get all messages (master only)
- `GET /api/messages/all` - Get all messages for any station
- `GET /api/messages/station/:stationId` - Get messages for a station
- `GET /api/messages/unread/:stationId` - Get unread messages for a station
- `POST /api/messages` - Create a new message
- `PUT /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete a message

## License

This project is licensed under the MIT License.