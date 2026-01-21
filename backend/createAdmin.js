import 'dotenv/config';
import connectDB from './config/database.js';
import User from './models/User.js';

async function createAdmin() {
  try {
    await connectDB();

    // Check if admin already exists
    let admin = await User.findOne({ username: 'admin' });

    if (admin) {
      console.log('Admin user found, updating details...');
      admin.email = 'admin@example.com';
      admin.password = 'admin123'; // Will be hashed by pre-save hook
      admin.role = 'admin';
    } else {
      console.log('Creating new admin user...');
      admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
    }

    const savedAdmin = await admin.save();
    console.log('Admin user saved successfully!');
    console.log('Username: admin');
    console.log('Role: admin');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    process.exit();
  }
}

createAdmin();