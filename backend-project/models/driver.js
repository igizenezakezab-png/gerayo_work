const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name:            { type: String, required: true },
  email:           { type: String, required: true, unique: true },
  password:        { type: String, required: true },
  currentLocation: { type: String, default: '' },
  destination:     { type: String, default: '' },
  price:           { type: Number, default: 0 },
  vehicleType:     { type: String, default: '' },
  telephone:       { type: String, default: '' },
  latitude:        { type: Number, default: null },
  longitude:       { type: Number, default: null },
  destLat:         { type: Number, default: null },
  destLng:         { type: Number, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);