const express = require('express');
const Expense = require('../models/Expense');
const router = express.Router();

router.post('/save', async (req, res) => {
  const { userId, date, expenses } = req.body;

  try {
    let expense = await Expense.findOne({ userId, date });
    if (expense) {
      expense.categories = expenses;
    } else {
      expense = new Expense({ userId, date, categories: expenses });
    }
    const savedExpense = await expense.save();
    res.status(200).json(savedExpense);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:userId/:date', async (req, res) => {
  const { userId, date } = req.params;

  try {
    const expense = await Expense.findOne({ userId, date });
    if (expense) {
      res.status(200).json(expense.categories);
    } else {
      res.status(404).json({});
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/month/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;

  try {
    const expenses = await Expense.find({ 
      userId, 
      date: { $regex: `^${year}-${month}` } 
    });

    const result = {};
    expenses.forEach(expense => {
      const day = expense.date.split('-')[2];
      result[day] = expense.categories;
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/cumulative/:userId/:year/:month', async (req, res) => {
    const { userId, year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
  
    try {
      const expenses = await Expense.find({
        userId,
        date: {
          $gte: startDate.toISOString().split('T')[0],
          $lte: endDate.toISOString().split('T')[0]
        }
      });
  
      let cumulativeExpenses = Array.from({ length: endDate.getDate() }, () => 0);
      expenses.forEach(expense => {
        const day = new Date(expense.date).getDate();
        const dailyTotal = Object.values(expense.categories).reduce((acc, curr) => acc + Number(curr), 0);
        cumulativeExpenses[day - 1] = dailyTotal;
      });
  
      for (let i = 1; i < cumulativeExpenses.length; i++) {
        cumulativeExpenses[i] += cumulativeExpenses[i - 1];
      }
  
      console.log('누적 지출 데이터:', cumulativeExpenses); // 디버깅용 콘솔 로그
      res.status(200).json(cumulativeExpenses);
    } catch (err) {
      res.status(500).json(err);
    }
});

module.exports = router;