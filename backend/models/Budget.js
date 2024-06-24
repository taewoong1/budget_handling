const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  income: {
    월급: { type: Number, default: 0 },
    부수입: { type: Number, default: 0 },
    용돈: { type: Number, default: 0 },
    상여: { type: Number, default: 0 },
    금융소득: { type: Number, default: 0 },
    기타: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model('Budget', budgetSchema);