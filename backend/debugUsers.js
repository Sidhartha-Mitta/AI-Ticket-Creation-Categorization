import 'dotenv/config';
import connectDB from './config/database.js';
import User from './models/User.js';

async function listUsers() {
    try {
        await connectDB();
        const users = await User.find({}, 'username email role password');
        console.log('--- DB USERS ---');
        users.forEach(u => {
            console.log(`User: ${u.username}, Role: ${u.role}, Email: ${u.email}, Password starts with: ${u.password.substring(0, 20)}..., ID: ${u._id}`);
        });
        console.log('----------------');
    } catch (error) {
        console.error('Error listing users:', error);
    } finally {
        process.exit();
    }
}

listUsers();
