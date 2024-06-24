const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true },
  reviewCount: { type: Number, required: true },
  blogReviewCount: { type: Number, required: true }
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;