const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const orders = {}; // Example in-memory database

app.use(bodyParser.json());

// Fetch unavailable dates and times
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Save a new order
app.post('/api/orders', (req, res) => {
  const { date, time } = req.body;
  if (!orders[date]) {
    orders[date] = [];
  }
  orders[date].push(time);
  res.json({ success: true });
});

app.listen(3000, () => console.log('Server running on port 3000'));
