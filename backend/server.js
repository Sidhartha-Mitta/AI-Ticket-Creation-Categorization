import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import ticketRoutes from './routes/tickets.js';
import supportRoutes from './routes/support.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'https://ai-ticket-creation.onrender.com' ,
    'https://ai-ticket-creation-categorization.vercel.app/' // Deployed frontend
  ],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);

// Legacy route for compatibility
app.post('/api/generate_ticket', (req, res) => {
  // Simple placeholder
  res.json({
    ticket_id: 'TICK-' + Date.now(),
    description: req.body.description,
    category: 'General',
    priority: 'Medium',
    status: 'open'
  });
});

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('API is running...');
});
// Handle 404 for API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});