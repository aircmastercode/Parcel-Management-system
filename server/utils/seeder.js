const { Station, User, Parcel, Message } = require('../models');
const seedAdmins = require('./adminSeeder');

async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Seed admin users
    await seedAdmins();
    
    // Check if stations already exist (we don't want to overwrite our custom railway stations)
    const stationCount = await Station.count();
    
    if (stationCount > 0) {
      console.log('Stations already exist, skipping default station creation');
      return;
    }
    
    // Create stations WITHOUT any master station
    console.log('Creating stations...');
    const station1 = await Station.create({
      name: 'KANPUR CENTRAL JN.',
      location: 'Kanpur',
      is_master: false,
      code: 'CNB'
    });
    
    const station2 = await Station.create({
      name: 'DHANBAD JN.',
      location: 'Dhanbad',
      is_master: false,
      code: 'DHN'
    });
    
    const station3 = await Station.create({
      name: 'DELHI JN.',
      location: 'Delhi',
      is_master: false,
      code: 'DLI'
    });
    
    const station4 = await Station.create({
      name: 'GAYA JN.',
      location: 'Gaya',
      is_master: false,
      code: 'GAYA'
    });
    
    const station5 = await Station.create({
      name: 'HOWRAH JN.',
      location: 'Howrah',
      is_master: false,
      code: 'HWH'
    });
    
    const station6 = await Station.create({
      name: 'NEW DELHI',
      location: 'New Delhi',
      is_master: false,
      code: 'NDLS'
    });
    
    const station7 = await Station.create({
      name: 'SEALDAH',
      location: 'Sealdah',
      is_master: false,
      code: 'SDAH'
    });
    
    // Create users
    console.log('Creating users...');
    const station1User = await User.create({
      name: 'TEST',
      email: 'cnb@railway.com',
      station_id: station1.id,
      role: 'user'
    });
    
    const station2User = await User.create({
      name: 'DHNTEST',
      email: 'dhn@railway.com',
      station_id: station2.id,
      role: 'user'
    });
    
    const station3User = await User.create({
      name: 'VVJ',
      email: 'dli@railway.com',
      station_id: station3.id,
      role: 'user'
    });
    
    const station4User = await User.create({
      name: 'VSC',
      email: 'gaya@railway.com',
      station_id: station4.id,
      role: 'user'
    });
    
    const station5User = await User.create({
      name: 'VPW',
      email: 'hwh@railway.com',
      station_id: station5.id,
      role: 'user'
    });
    
    const station6User = await User.create({
      name: 'XYZ',
      email: 'ndls@railway.com',
      station_id: station6.id,
      role: 'user'
    });
    
    const station7User = await User.create({
      name: 'SDAHTEST',
      email: 'sdah@railway.com',
      station_id: station7.id,
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