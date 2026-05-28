// import userschema have : name,email,password and role
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
          enum: ['customer', 'driver', 'admin'],
          default: 'customer'
    }
}, { timestamps: true })
const User = mongoose.model('User', userSchema);
module.exports = User
