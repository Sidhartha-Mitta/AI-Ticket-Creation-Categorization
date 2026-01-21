import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';

import authRoutes from './routes/auth.js';
import ticketRoutes from './routes/tickets.js';
import supportRoutes from './routes/support.js';
import adminRoutes from './routes/admin.js';

const app = express();

/* -------------------- DATABASE -------------------- */
connectDB();

/* -------------------- MIDDLEWARE -------------------- */

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173', // local dev
    'https://ai-ticket-creation.onrender.com',
    'https://ai-ticket-creation-categorization.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Enable CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- ROUTES -------------------- */

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);

/* -------------------- LEGACY / TEST ROUTE -------------------- */
app.post('/api/generate_ticket', (req, res) => {
  res.json({
    ticket_id: `TICK-${Date.now()}`,
    description: req.body.description,
    category: 'General',
    priority: 'Medium',
    status: 'open'
  });
});

/* -------------------- HEALTH CHECK -------------------- */
app.get('/', (req, res) => {
  res.send('✅ API is running...');
});

/* -------------------- 404 HANDLER -------------------- */
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
