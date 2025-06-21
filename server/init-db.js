require('dotenv').config();
const { sequelize } = require('./models');
const seedDatabase = require('./utils/seeder');
const updateStationsAndUsers = require('./utils/updateStations');

// Initialize database and create tables
async function init() {
  try {
    // Sync database with force: true to drop and recreate tables
    await sequelize.sync({ force: true });
    console.log('Database synced and tables created');

    // Setup railway stations and users
    await updateStationsAndUsers();
    console.log('Railway stations and users created successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

init(); 