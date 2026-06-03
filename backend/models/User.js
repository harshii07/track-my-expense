const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  securityQuestion: {
    type: String,
    default: 'What is your favorite color?',
  },
  securityAnswer: {
    type: String,
    default: '',
  },
  hasPin: {
    type: Boolean,
    default: false,
  },
  isGoogleUser: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);