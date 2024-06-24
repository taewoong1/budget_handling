const express = require('express');
const router = express.Router();
const FixedExpense = require('../models/FixedExpense');

router.post('/', async (req, res) => {
  const { userId, categories, amounts, year, month } = req.body;

  try {
    const fixedExpense = new FixedExpense({
      userId,
      categories,
      amounts,
      year,
      month,
    });

    await fixedExpense.save();
    res.status(201).json(fixedExpense);
  } catch (err) {
    console.error('고정 지출 저장 실패:', err);
    res.status(500).json({ message: '고정 지출 저장 실패', error: err });
  }
});

router.get('/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;

  try {
    const fixedExpenses = await FixedExpense.find({ userId, year, month });
    res.status(200).json(fixedExpenses);
  } catch (err) {
    console.error('고정 지출 정보 불러오기 실패:', err);
    res.status(500).json({ message: '고정 지출 정보 불러오기 실패', error: err });
  }
});

module.exports = router;