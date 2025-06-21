const { Admin } = require('../models');

async function seedAdmins() {
  try {
    console.log('Seeding admin users...');
    
    // Check if admin already exists
    const adminCount = await Admin.count();
    
    if (adminCount > 0) {
      console.log('Admin users already exist, skipping admin creation');
      return;
    }
    
    // Create default admin user
    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@railway.com',
      role: 'admin'
    });
    
    console.log(`Created admin user: ${admin.username}`);
    return admin;
    
  } catch (error) {
    console.error('Error seeding admin users:', error);
  }
}

module.exports = seedAdmins; 