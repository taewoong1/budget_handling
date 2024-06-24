// routes/budgetRoutes.js
const express = require('express');
const Budget = require('../models/Budget');
const router = express.Router();

// 예산 저장 라우트
router.post('/save', async (req, res) => {
  const { userId, year, month, income } = req.body;

  try {
    let budget = await Budget.findOne({ userId, year, month });
    if (budget) {
      budget.income = income;
    } else {
      budget = new Budget({ userId, year, month, income });
    }
    const savedBudget = await budget.save();
    res.status(200).json(savedBudget);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 특정 월의 예산 가져오기 라우트
router.get('/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;

  try {
    const budget = await Budget.findOne({ userId, year, month });
    if (budget) {
      res.status(200).json(budget.income);
    } else {
      res.status(404).json({});
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;