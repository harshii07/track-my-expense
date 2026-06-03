const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- REGISTER ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, securityQuestion, securityAnswer } = req.body;

    if (!name || !email || !password || !securityAnswer) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    const lowerEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: lowerEmail,
      password: hashedPassword,
      securityQuestion: securityQuestion || 'What is your favorite color?',
      securityAnswer: securityAnswer.toLowerCase().trim()
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GOOGLE LOGIN ---
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = new User({
        name,
        email: email.toLowerCase(),
        password: await bcrypt.hash(Math.random().toString(36), 10),
        securityQuestion: '',
        securityAnswer: '',
        hasPin: false,
        isGoogleUser: true,
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture,
        hasPin: user.hasPin,
        isGoogleUser: user.isGoogleUser
      }
    });
  } catch (err) {
    res.status(401).json({ message: 'Google login failed!' });
  }
});

// --- GOOGLE USER SET PIN ---
router.post('/google-setup-pin', authMiddleware, async (req, res) => {
  try {
    const { pin, securityAnswer } = req.body;
    if (!pin || pin.length !== 4) return res.status(400).json({ message: 'PIN must be 4 digits!' });
    if (!securityAnswer) return res.status(400).json({ message: 'Security answer is required!' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found!' });

    user.password = await bcrypt.hash(pin, 10);
    user.securityQuestion = 'What is your favorite color?';
    user.securityAnswer = securityAnswer.toLowerCase().trim();
    user.hasPin = true;
    await user.save();

    res.json({ message: 'PIN set successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GOOGLE USER VERIFY PIN ---
router.post('/google-verify-pin', async (req, res) => {
  try {
    const { email, pin } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found!' });

    const isMatch = await bcrypt.compare(pin, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect PIN!' });

    res.json({ message: 'PIN verified!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GET SECURITY QUESTION ---
router.post('/get-question', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User not found!' });
    res.json({ question: user.securityQuestion });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- RESET PASSWORD ---
router.post('/reset-password', async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) return res.status(404).json({ message: 'User not found!' });

    const submittedAnswer = answer.toLowerCase().trim();
    const storedAnswer = user.securityAnswer ? user.securityAnswer.toLowerCase().trim() : '';

    if (submittedAnswer !== storedAnswer) {
      return res.status(400).json({ message: 'Incorrect security answer!' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'PIN reset successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- UPDATE PROFILE ---
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found!' });

    if (newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Current PIN is incorrect!' });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    user.name = name || user.name;
    await user.save();

    res.json({ name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- DELETE ACCOUNT ---
router.delete('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    await Expense.deleteMany({ user: req.user.id });

    res.json({ message: 'Account and all data deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;