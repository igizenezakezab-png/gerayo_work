const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Customer = require('../models/customer');
const Driver = require('../models/driver');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─── CUSTOMER REGISTER ───────────────────────────────
router.post('/customer/register', async (req, res) => {
  try {
    const { name, email, password, telephone } = req.body;

    const exists = await Customer.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      name, email,
      password: hashedPassword,
      telephone: telephone || '',
    });

    res.status(201).json({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      telephone: customer.telephone,
      role: 'customer',
      token: generateToken(customer._id, 'customer'),
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── CUSTOMER LOGIN ───────────────────────────────────
router.post('/customer/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(401).json({ message: 'Wrong password' });

    res.status(200).json({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      telephone: customer.telephone,
      role: 'customer',
      token: generateToken(customer._id, 'customer'),
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── DRIVER REGISTER ─────────────────────────────────
router.post('/driver/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Driver.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const driver = await Driver.create({
      name, email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: driver._id,
      name: driver.name,
      email: driver.email,
      telephone: driver.telephone,
      role: 'driver',
      token: generateToken(driver._id, 'driver'),
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── DRIVER LOGIN ─────────────────────────────────────
router.post('/driver/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const driver = await Driver.findOne({ email });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) return res.status(401).json({ message: 'Wrong password' });

    res.status(200).json({
      _id: driver._id,
      name: driver.name,
      email: driver.email,
      telephone: driver.telephone,
      role: 'driver',
      token: generateToken(driver._id, 'driver'),
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;