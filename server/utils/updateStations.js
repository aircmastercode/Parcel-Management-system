const { Station, User, Parcel, Message } = require('../models');
const { sequelize } = require('../models');

async function updateStationsAndUsers() {
  try {
    console.log('Updating stations and users...');
    
    // Define the new stations
    const stationData = [
      { code: 'CNB', name: 'KANPUR CENTRAL JN.', location: 'Kanpur', is_master: false },
      { code: 'DHN', name: 'DHANBAD JN.', location: 'Dhanbad', is_master: false },
      { code: 'DLI', name: 'DELHI JN.', location: 'Delhi', is_master: false },
      { code: 'GAYA', name: 'GAYA JN.', location: 'Gaya', is_master: false },
      { code: 'HWH', name: 'HOWRAH JN.', location: 'Howrah', is_master: false },
      { code: 'NDLS', name: 'NEW DELHI', location: 'New Delhi', is_master: true }, // Making New Delhi the master station
      { code: 'SDAH', name: 'SEALDAH', location: 'Sealdah', is_master: false },
    ];

    // Define the user-station assignments
    const userAssignments = [
      { username: 'TEST', stationCode: 'CNB', email: 'test@example.com', phone: '1234567890', role: 'user' },
      { username: 'DHNTEST', stationCode: 'DHN', email: 'dhntest@example.com', phone: '2234567890', role: 'user' },
      { username: 'VVJ', stationCode: 'DLI', email: 'vvj@example.com', phone: '3234567890', role: 'user' },
      { username: 'VSC', stationCode: 'GAYA', email: 'vsc@example.com', phone: '4234567890', role: 'user' },
      { username: 'VPW', stationCode: 'HWH', email: 'vpw@example.com', phone: '5234567890', role: 'user' },
      { username: 'XYZ', stationCode: 'NDLS', email: 'xyz_ndls@example.com', phone: '6234567890', role: 'master' },
      { username: 'XYZ', stationCode: 'SDAH', email: 'xyz_sdah@example.com', phone: '7234567890', role: 'user' },
    ];

    // Step 1: Use a transaction to properly handle the cascading delete
    const transaction = await sequelize.transaction();

    try {
      // Delete all messages first since they reference parcels and stations
      await Message.destroy({ where: {}, transaction });
      console.log('Deleted all messages');
      
      // Delete all parcels next since they reference stations
      await Parcel.destroy({ where: {}, transaction });
      console.log('Deleted all parcels');
      
      // Delete all users since they reference stations
      await User.destroy({ where: {}, transaction });
      console.log('Deleted all users');
      
      // Finally delete all stations
      await Station.destroy({ where: {}, transaction });
      console.log('Deleted all stations');

      // Step 2: Create new stations
      const stationMap = {};
      for (const station of stationData) {
        const newStation = await Station.create({
          name: station.name,
          location: station.location,
          is_master: station.is_master,
          code: station.code
        }, { transaction });
        stationMap[station.code] = newStation.id;
        console.log(`Created station: ${station.name} (${station.code})`);
      }

      // Step 3: Create new users
      for (const user of userAssignments) {
        const stationId = stationMap[user.stationCode];
        if (!stationId) {
          console.error(`Station code ${user.stationCode} not found`);
          continue;
        }

        await User.create({
          name: user.username,
          email: user.email,
          phone: user.phone,
          station_id: stationId,
          role: user.role
        }, { transaction });
        console.log(`Created user: ${user.username} for station ${user.stationCode}`);
      }

      // Commit the transaction
      await transaction.commit();
      console.log('Stations and users updated successfully!');
    } catch (error) {
      // If any part fails, roll back the entire transaction
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating stations and users:', error);
    throw error;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  updateStationsAndUsers()
    .then(() => {
      console.log('Update complete!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Update failed:', err);
      process.exit(1);
    });
}

module.exports = updateStationsAndUsers; 