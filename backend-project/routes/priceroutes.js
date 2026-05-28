const express = require('express');
const router = express.Router();
const { calculatePrice } = require('../utils/priceCalculator');

router.post('/calculate', async (req, res) => {
  try {
    const { currentLocation, destination, vehicleType } = req.body;
    const result = await calculatePrice(currentLocation, destination, vehicleType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;