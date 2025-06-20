require('dotenv').config();
const updateStationsAndUsers = require('./utils/updateStations');

async function main() {
  try {
    console.log('Starting the railway station update process...');
    await updateStationsAndUsers();
    console.log('Railway stations and users update completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during railway station update:', error);
    process.exit(1);
  }
}

main(); 