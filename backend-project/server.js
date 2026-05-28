const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

if (!process.env.VERCEL) {
  require('dotenv').config();
}

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'].filter(Boolean)
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const driverRoutes = require('./routes/driverRoutes');
const customerRoutes = require('./routes/customerRoutes');
const priceRoutes = require('./routes/priceRoutes');
const locationRoutes = require('./routes/locationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/price', priceRoutes);
app.use('/api/location', locationRoutes);

module.exports = app;

if (!process.env.VERCEL) {
  mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));

  const PORT = process.env.PORT || 2000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}