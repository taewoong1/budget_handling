const express = require('express');
const router = express.Router();
const { getRestaurantInfo, recommendRestaurants, recommendInitialRestaurants, addFavorite, getFavorites, deleteFavorite } = require('../controllers/restaurantController');

// 기존 엔드포인트
router.post('/restaurant-info', getRestaurantInfo);
router.post('/recommend', recommendRestaurants);
router.post('/favorites', addFavorite);
router.get('/favorites', getFavorites);
router.delete('/favorites/:id', deleteFavorite);

// 새로운 초기 추천 엔드포인트 추가
router.post('/recommend-initial', recommendInitialRestaurants);

module.exports = router;