require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. Middleware
// CORS is configured to allow requests from your React/Vite frontend
app.use(cors());
app.use(express.json());

// 2. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ Connection error:', err));

// 3. Import Routes
const preorderRoutes = require('./routes/preorderRoutes');

// 4. Register Routes
// This matches the axios.post('https://localhost:5000/api/preorders', ...) call in App.jsx
app.use('/api/preorders', preorderRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Digital Clipboard API is running...');
});

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server spinning on port ${PORT}`));