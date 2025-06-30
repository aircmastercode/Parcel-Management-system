require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const stationRoutes = require('./routes/stations');
const parcelRoutes = require('./routes/parcels');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');

const app = express();
// Always use port 8000
const PORT = 8000;

// Get public URL from env or default
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  abortOnLimit: true,
  createParentPath: true
}));

// Set up static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add middleware to add public URL to response locals
app.use((req, res, next) => {
  res.locals.publicUrl = PUBLIC_URL;
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React frontend app
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
} else {
  // Base route for development API testing
  app.get('/', (req, res) => {
    res.send('Railway Parcel Management System API');
  });
}

// Start server directly - database initialization is handled by startup.js
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Public URL: ${PUBLIC_URL}`);
}); 