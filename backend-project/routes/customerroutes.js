const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');
const Driver = require('../models/driver');
const { calculatePrice } = require('../utils/priceCalculator');

function getDestWords(dest) {
  return dest.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

async function findDriversForCustomer(customer) {
  if (!customer.destination || !customer.price || !customer.vehicleChoice) return [];

  const dest = customer.destination.trim();
  const price = Number(customer.price);
  if (!dest || !price) return [];

  const priceRange = price * 0.5;
  const words = getDestWords(dest);

  const query = {
    vehicleType: customer.vehicleChoice,
    price: { $gte: Math.max(0, price - priceRange), $lte: price + priceRange },
  };

  if (words.length > 0) {
    const orConditions = words.map((word) => ({
      destination: { $regex: word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
    }));
    query.$or = orConditions;
  }

  return Driver.find(query).select('-password').lean();
}

router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/matches', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const matches = await findDriversForCustomer(customer);
    res.json({ matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newCustomer = await Customer.create(req.body);
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { currentLocation, destination, vehicleChoice } = req.body;

    let price = 0;
    if (currentLocation && destination && vehicleChoice) {
      const calc = await calculatePrice(currentLocation, destination, vehicleChoice);
      price = calc.price;
    }

    const data = { ...req.body, price };
    const updated = await Customer.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ message: 'Customer not found' });

    const matches = await findDriversForCustomer(updated);
    res.status(200).json({ customer: updated, matches, priceInfo: { price } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;