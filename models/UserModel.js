const mongoose = require('mongoose');

// Define schema for the User collection
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  counter: {
    type: Number,
    default:0
  },
});

// Create a Mongoose model for the User collection
const User = mongoose.model('user-list', userSchema);

module.exports = User;