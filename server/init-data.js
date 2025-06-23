const fs = require('fs');
const path = require('path');

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

console.log('Data directory setup complete.'); 