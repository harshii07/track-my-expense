require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/track-my-expense';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.log('MongoDB error:', err));

const expenseRoutes = require('./routes/expenses');
const authRoutes = require('./routes/auth');

app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Track My Expense API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));