const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true },
  age: { type: Number, required: true },
  studentId: { type: String, required: true },
  university: { type: String, required: true },
  phone: { type: String, required: true },
  profilePicture: { type: String },
});

module.exports = mongoose.model('User', userSchema);