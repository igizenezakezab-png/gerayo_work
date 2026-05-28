const express = require('express');
const router = express.Router();
const Driver = require('../models/driver');
const Customer = require('../models/customer');
const { calculatePrice } = require('../utils/priceCalculator');

function getDestWords(dest) {
  return dest.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

async function findCustomersForDriver(driver) {
  if (!driver.destination || !driver.price || !driver.vehicleType) return [];

  const dest = driver.destination.trim();
  const price = Number(driver.price);
  if (!dest || !price) return [];

  const priceRange = price * 0.5;
  const words = getDestWords(dest);

  const query = {
    vehicleChoice: driver.vehicleType,
    price: { $gte: Math.max(0, price - priceRange), $lte: price + priceRange },
  };

  if (words.length > 0) {
    const orConditions = words.map((word) => ({
      destination: { $regex: word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
    }));
    query.$or = orConditions;
  }

  return Customer.find(query).select('-password').lean();
}

router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.status(200).json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/matches', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const matches = await findCustomersForDriver(driver);
    res.json({ matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newDriver = await Driver.create(req.body);
    res.status(201).json(newDriver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { currentLocation, destination, vehicleType } = req.body;

    let price = 0;
    if (currentLocation && destination && vehicleType) {
      const calc = await calculatePrice(currentLocation, destination, vehicleType);
      price = calc.price;
    }

    const data = { ...req.body, price };
    const updated = await Driver.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ message: 'Driver not found' });

    const matches = await findCustomersForDriver(updated);
    res.status(200).json({ driver: updated, matches, priceInfo: { price } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;