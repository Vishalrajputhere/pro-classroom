const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file



const app = express();
const port = 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Allows us to accept JSON data in requests

// --- Import Routes ---
// Import all route files once, at the beginning
const userRoutes = require('./routes/user.routes');
const classRoutes = require('./routes/class.routes');

const assignmentRoutes = require('./routes/assignment.routes'); // <-- NEW

// --- API Endpoints ---

// Simple sanity check route
app.get('/', (req, res) => {
  res.send('Welcome to the Pro Classroom Back-End!');
});

// API endpoint we created before (for testing connection)
app.get('/api/message', (req, res) => {
  res.json({ message: 'Data fetched from the backend successfully!' });
});


// Register Routes: This tells Express which file handles which base URL
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);

app.use('/api/assignments', assignmentRoutes); // <-- NEW


// --- Start Server ---
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

