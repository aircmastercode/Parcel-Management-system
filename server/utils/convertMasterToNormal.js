const { Station, User } = require('../models');
const { sequelize } = require('../models');

async function convertMasterToNormal() {
  try {
    console.log('Converting master station (NDLS) to normal station...');
    
    // Use a transaction to ensure data consistency
    const transaction = await sequelize.transaction();

    try {
      // Step 1: Find the NDLS station
      const ndlsStation = await Station.findOne({
        where: { code: 'NDLS' },
        transaction
      });

      if (!ndlsStation) {
        throw new Error('NDLS station not found');
      }

      console.log(`Found NDLS station: ${ndlsStation.name} (ID: ${ndlsStation.id})`);
      console.log(`Current is_master status: ${ndlsStation.is_master}`);

      // Step 2: Update the station to be a normal station
      await ndlsStation.update({
        is_master: false
      }, { transaction });

      console.log('✅ Updated NDLS station: is_master = false');

      // Step 3: Find and update users associated with NDLS station
      const ndlsUsers = await User.findAll({
        where: { station_id: ndlsStation.id },
        transaction
      });

      console.log(`Found ${ndlsUsers.length} users for NDLS station`);

      for (const user of ndlsUsers) {
        // Update user role from 'master' to 'user' if it was 'master'
        if (user.role === 'master') {
          await user.update({
            role: 'user'
          }, { transaction });
          console.log(`✅ Updated user ${user.name} (${user.email}): role = 'user'`);
        } else {
          console.log(`ℹ️  User ${user.name} (${user.email}) already has role: '${user.role}'`);
        }
      }

      // Commit the transaction
      await transaction.commit();
      
      console.log('\n🎉 Successfully converted NDLS from master station to normal station!');
      console.log('\n📋 Summary of changes:');
      console.log('- NDLS station: is_master = false');
      console.log(`- Updated ${ndlsUsers.length} users to normal station users`);
      console.log('\n⚠️  Important notes:');
      console.log('- NDLS users will now see Station Dashboard instead of Master Dashboard');
      console.log('- They will only see their own parcels, not all system parcels');
      console.log('- They will lose administrative privileges');
      console.log('- All existing parcels and messages remain unchanged');

    } catch (error) {
      // If any part fails, roll back the entire transaction
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error converting master station:', error);
    throw error;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  convertMasterToNormal()
    .then(() => {
      console.log('\n✅ Conversion complete!');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Conversion failed:', err);
      process.exit(1);
    });
}

module.exports = convertMasterToNormal; 