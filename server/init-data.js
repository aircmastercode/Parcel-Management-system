const fs = require('fs');
const path = require('path');
const { sequelize } = require('./models');
const seedDatabase = require('./utils/seeder');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      console.log('Creating data directory...');
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Check if database exists in root directory
    const rootDbPath = path.join(__dirname, 'database.sqlite');
    const dataDbPath = path.join(dataDir, 'database.sqlite');

    // If database exists in root but not in data directory, copy it
    if (fs.existsSync(rootDbPath) && !fs.existsSync(dataDbPath)) {
      console.log('Copying existing database to data directory...');
      fs.copyFileSync(rootDbPath, dataDbPath);
      console.log('Database copied successfully.');
    }

    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection successful.');

    // Check if database file exists and has content
    const dbExists = fs.existsSync(dataDbPath);
    const dbSize = dbExists ? fs.statSync(dataDbPath).size : 0;
    
    if (dbExists && dbSize > 0) {
      console.log(`Existing database found (${dbSize} bytes). Preserving existing data - NO schema sync.`);
      
      // For existing databases, ONLY check if we need to seed by counting stations
      // Do NOT perform any schema synchronization
      try {
        const { Station } = require('./models');
        const stationCount = await Station.count();
        
        if (stationCount === 0) {
          console.log('Database exists but is empty, seeding initial data...');
          await seedDatabase();
          console.log('Database seeded successfully!');
        } else {
          console.log(`Database already contains ${stationCount} stations. Skipping seeding.`);
        }
      } catch (error) {
        console.log('Could not check station count, database may need initialization.');
        console.log('Skipping seeding to preserve existing data.');
      }
    } else {
      console.log('No existing database found. Creating new database with schema...');
      
      // Only sync schema for completely new databases
      await sequelize.sync({ force: false });
      console.log('Database schema synchronized.');
      
      // Seed the new database
      console.log('Seeding new database...');
      await seedDatabase();
      console.log('Database seeded successfully!');
    }

    console.log('Database initialization complete.');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Don't exit on error, let the server try to continue
    console.log('Continuing with existing database...');
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase; 