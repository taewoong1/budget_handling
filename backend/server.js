const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const fixedExpenseRoutes = require('./routes/fixedExpenseRoutes');
const app = express();

app.use(cors()); // CORS 설정

app.use(express.json());

// 업로드된 파일을 정적으로 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/fixed-expenses', fixedExpenseRoutes);

mongoose
  .connect('mongodb://localhost:27017/myapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(5000, () => {
      console.log('Server is running on port 5000');
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });