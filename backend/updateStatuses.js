import mongoose from 'mongoose';
import Ticket from './models/Ticket.js';
import 'dotenv/config';

const updateStatuses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticket_system');
    
    const statusMap = {
      'Submitted': 'open',
      'In-Process': 'in_progress',
      'Completed': 'resolved',
      'Dropped': 'cancelled'
    };
    
    for (const [oldStatus, newStatus] of Object.entries(statusMap)) {
      const result = await Ticket.updateMany({ status: oldStatus }, { status: newStatus });
      console.log(`Updated ${result.modifiedCount} tickets from ${oldStatus} to ${newStatus}`);
    }
    
    console.log('Status update completed');
  } catch (error) {
    console.error('Error updating statuses:', error);
  } finally {
    await mongoose.disconnect();
  }
};

updateStatuses();