const mongoose = require('mongoose');
const User = require('../models/UserModel'); // import the User model

// Controller function to retrieve all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Retrieve all users from the User collection
    return users;
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users', error });
  }
};