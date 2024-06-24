const mongoose = require('mongoose');

const FixedExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  categories: {
    type: [String],
    required: true,
  },
  amounts: {
    type: Map,
    of: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('FixedExpense', FixedExpenseSchema);