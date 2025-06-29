const initializeDatabase = require('./init-data');

async function startup() {
  try {
    console.log('Starting Parcel Management System...');
    
    // Initialize database first
    await initializeDatabase();
    
    // Then start the server
    console.log('Starting server...');
    require('./server.js');
    
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

startup(); 