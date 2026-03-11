const express = require('express');
const boxRoutes = require('./boxRoutes');

const app = express();

app.use(express.json());

app.use('/api/boxes', boxRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

module.exports = app;
