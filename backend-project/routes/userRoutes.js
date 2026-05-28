//import router for user
const express = require('express');
const router = express.Router();

const User = require('../models/User');

// GET ALL USERS
router.get('/',  async (req, res) => {
 try {
   const users = await User.find();

   res.status(200).json(users);

 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

// GET SINGLE USER
router.get('/:id',  async (req, res) => {
 try {
   const user = await User.findById(req.params.id);

   if(!user){
     return res.status(404).json({ message: 'User not found' });
   }

   res.status(200).json(user);

 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

// CREATE USER
router.post('/',  async (req, res) => {
 try {
   const newUser = await User.create(req.body);

   res.status(201).json(newUser);

 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

// UPDATE USER
router.put('/:id',  async (req, res) => {
 try {
   const updatedUser = await User.findByIdAndUpdate(
     req.params.id,
     req.body,
     { new: true }
   );

   res.status(200).json(updatedUser);

 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

// DELETE USER
router.delete('/:id',  async (req, res) => {
 try {
   await User.findByIdAndDelete(req.params.id);

   res.status(200).json({ message: 'User deleted successfully' });

 } catch (error) {
   res.status(500).json({ error: error.message });
 }
});

module.exports = router;