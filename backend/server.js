const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Fire Safety Game API is running!' });
});

// Development routes (no database required)
app.use('/api/auth-dev', require('./routes/auth-dev'));
app.use('/api/scenarios-dev', require('./routes/scenarios-dev'));

// Database routes (require MongoDB)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scenarios', require('./routes/scenarios'));
app.use('/api/users', require('./routes/users'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fire-safety-game';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    console.log('Database:', MONGODB_URI);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Don't exit - allow fallback to development routes
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});