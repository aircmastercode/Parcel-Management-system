# Parcel Management System

A full-stack application for managing parcels between different stations. The system allows for OTP-based authentication, station-specific views, and the ability to exchange messages between stations about parcels.

## Features

- **User Management**: Station-based users with role-based permissions
- **OTP Authentication**: Login via one-time passwords sent to email/phone
- **Parcel Tracking**: Create, update, and monitor parcels between stations
- **Messaging System**: Inter-station communication about parcels
- **Master Station**: Special station with visibility into all messages and parcels

## Tech Stack

- **Frontend**: React with Vite, styled with Tailwind CSS
- **Backend**: Express.js (Node.js)
- **Database**: MySQL with Sequelize ORM
- **Authentication**: OTP-based with JWT for session management

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
│   ├── utils/           # Utility functions
│   ├── server.js        # Server entry point
│   └── package.json     # Backend dependencies
│
├── .env                 # Environment variables (create from config.env.example)
└── README.md            # Project documentation
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- MySQL (v8 or later) or MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp config.env.example .env
   ```

4. Edit the `.env` file with your database credentials and other settings.

5. Create the MySQL database:
   ```sql
   CREATE DATABASE parcel_management;
   ```

6. Start the server in development mode:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

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
- `PUT /api/parcels/:id/status` - Update parcel status
- `DELETE /api/parcels/:id` - Delete a parcel (master only)

### Messages
- `GET /api/messages` - Get all messages (master only)
- `GET /api/messages/station/:stationId` - Get messages for a station
- `GET /api/messages/unread/:stationId` - Get unread messages for a station
- `POST /api/messages` - Create a new message
- `PUT /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete a message

## Test Users

After running the database seeder, the following test users will be available:

1. **Master Station User**
   - Email: admin@example.com
   - Station: Head Office

2. **Downtown Branch User**
   - Email: downtown@example.com
   - Station: Downtown Branch

3. **Westside Station User**
   - Email: chicago@example.com
   - Station: Westside Station

4. **Central Hub User**
   - Email: la@example.com
   - Station: Central Hub

To login, use the OTP system. In development, OTPs are logged to the console.

## License

This project is licensed under the MIT License.

## Authors

- [Your Name]

## Acknowledgements

- Express.js
- React
- Sequelize
- MySQL
- Tailwind CSS