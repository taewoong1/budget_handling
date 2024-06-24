const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  categories: { type: Map, of: String, default: {} }
});

module.exports = mongoose.model('Expense', expenseSchema);