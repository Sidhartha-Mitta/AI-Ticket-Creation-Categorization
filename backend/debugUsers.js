require('dotenv').config();
const connectDB = require('./config/database');
const User = require('./models/User');

async function listUsers() {
    try {
        await connectDB();
        const users = await User.find({}, 'username email role');
        console.log('--- DB USERS ---');
        users.forEach(u => {
            console.log(`User: ${u.username}, Role: ${u.role}, Email: ${u.email}, ID: ${u._id}`);
        });
        console.log('----------------');
    } catch (error) {
        console.error('Error listing users:', error);
    } finally {
        process.exit();
    }
}

listUsers();
