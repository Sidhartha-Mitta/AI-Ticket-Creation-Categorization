require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/tickets', require('./routes/tickets'));
app.use('/support', require('./routes/support'));
app.use('/admin', require('./routes/admin'));

// Legacy route for compatibility
app.post('/generate_ticket', (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});