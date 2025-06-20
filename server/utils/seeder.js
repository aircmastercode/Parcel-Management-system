const { Station, User, Parcel, Message } = require('../models');

async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Check if stations already exist (we don't want to overwrite our custom railway stations)
    const stationCount = await Station.count();
    
    if (stationCount > 0) {
      console.log('Stations already exist, skipping default station creation');
      return;
    }
    
    // Create stations
    console.log('Creating stations...');
    const masterStation = await Station.create({
      name: 'Head Office',
      location: 'New York',
      is_master: true,
      code: 'HQ001'
    });
    
    const station1 = await Station.create({
      name: 'Downtown Branch',
      location: 'New York',
      is_master: false,
      code: 'NYC01'
    });
    
    const station2 = await Station.create({
      name: 'Westside Station',
      location: 'Chicago',
      is_master: false,
      code: 'CHI01'
    });
    
    const station3 = await Station.create({
      name: 'Central Hub',
      location: 'Los Angeles',
      is_master: false,
      code: 'LA001'
    });
    
    // Create users
    console.log('Creating users...');
    const masterUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '1234567890',
      station_id: masterStation.id,
      role: 'master'
    });
    
    const station1User = await User.create({
      name: 'Downtown Manager',
      email: 'downtown@example.com',
      phone: '2234567890',
      station_id: station1.id,
      role: 'user'
    });
    
    const station2User = await User.create({
      name: 'Chicago Manager',
      email: 'chicago@example.com',
      phone: '3234567890',
      station_id: station2.id,
      role: 'user'
    });
    
    const station3User = await User.create({
      name: 'LA Manager',
      email: 'la@example.com',
      phone: '4234567890',
      station_id: station3.id,
      role: 'user'
    });
    
    // Create parcels
    console.log('Creating parcels...');
    const parcel1 = await Parcel.create({
      sender_station_id: station1.id,
      receiver_station_id: station2.id,
      tracking_number: 'PMS-12345678',
      status: 'in_transit',
      weight: 2.5,
      description: 'Fragile electronics item',
      sender_name: 'John Doe',
      receiver_name: 'Jane Smith',
      sender_contact: '5551234567',
      receiver_contact: '5559876543'
    });
    
    const parcel2 = await Parcel.create({
      sender_station_id: station2.id,
      receiver_station_id: station3.id,
      tracking_number: 'PMS-87654321',
      status: 'pending',
      weight: 1.2,
      description: 'Documents',
      sender_name: 'Mike Johnson',
      receiver_name: 'Sarah Wilson',
      sender_contact: '5551112222',
      receiver_contact: '5553334444'
    });
    
    const parcel3 = await Parcel.create({
      sender_station_id: station3.id,
      receiver_station_id: station1.id,
      tracking_number: 'PMS-ABCDEFGH',
      status: 'delivered',
      weight: 5.0,
      description: 'Books',
      sender_name: 'Alex Brown',
      receiver_name: 'Chris Green',
      sender_contact: '5555556666',
      receiver_contact: '5557778888'
    });
    
    // Create messages
    console.log('Creating messages...');
    await Message.create({
      from_station: station1.id,
      to_station: station2.id,
      parcel_id: parcel1.id,
      content: 'Package has been dispatched from Downtown Branch.',
      read: true,
      is_master_copied: true
    });
    
    await Message.create({
      from_station: station2.id,
      to_station: station1.id,
      parcel_id: parcel1.id,
      content: 'Package received at Westside Station. Will deliver tomorrow.',
      read: false,
      is_master_copied: true
    });
    
    await Message.create({
      from_station: station2.id,
      to_station: station3.id,
      parcel_id: parcel2.id,
      content: 'Please confirm delivery address for this package.',
      read: false,
      is_master_copied: true
    });
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

module.exports = seedDatabase; 