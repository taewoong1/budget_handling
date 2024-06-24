const path = require('path');
const csv = require('csv-parser');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Restaurant = require('../models/Restaurant');
const Favorite = require('../models/Favorite');

// CSV 파일에서 데이터를 읽어오는 함수
const readCSVData = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    const csvFilePath = path.join(__dirname, '../data/yeongtong_data.csv'); // 상대 경로로 수정
    fs.createReadStream(csvFilePath, { encoding: 'utf8' })
      .pipe(csv())
      .on('data', (data) => {
        const restaurant = {
          name: data['﻿가게 이름'].trim(),
          address: data['주소'].trim(),
          type: data['음식 종류'].trim(),
          price: parseInt(data['가격'], 10) || 0,
          rating: parseFloat(data['네이버 지도 별점']) || 0,
          reviewCount: parseInt(data['방문자 리뷰?'], 10) || 0,
          blogReviewCount: parseInt(data['블로그 리뷰'], 10) || 0
        };

        if (restaurant.name && restaurant.address && restaurant.type) {
          results.push(restaurant);
        }
      })
      .on('end', () => {
        console.log('CSV Data Loaded:', results.length);
        resolve(results);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

// 식당 검색
const getRestaurantInfo = async (req, res) => {
  console.log('식당 검색 요청:', req.body);
  try {
    const data = await readCSVData();
    const restaurant = data.find(r => r.name === req.body.title);
    if (restaurant) {
      res.status(200).send(restaurant);
    } else {
      res.status(404).send({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

// 중복된 식당 이름을 제외한 추천 식당 목록 생성
const getUniqueRecommendations = (restaurants, count) => {
  const uniqueNames = new Set();
  const uniqueRecommendations = [];

  for (const restaurant of restaurants) {
    if (!uniqueNames.has(restaurant.name)) {
      uniqueNames.add(restaurant.name);
      uniqueRecommendations.push(restaurant);
      if (uniqueRecommendations.length === count) {
        break;
      }
    }
  }

  return uniqueRecommendations;
};

const recommendRestaurants = async (req, res) => {
  console.log('식당 추천 요청:', req.body);
  try {
    const { type, price } = req.body.criteria || { type: undefined, price: req.body.price }; // 일반 추천과 초기 추천을 모두 처리
    const data = await readCSVData();

    const inputPrice = Math.floor(parseInt(price, 10)); // 소수점 없이 계산
    console.log('입력된 가격:', inputPrice);

    // 조건에 맞는 식당 필터링
    let filteredRestaurants = data;
    if (type) {
      filteredRestaurants = filteredRestaurants.filter(r => r.type === type);
    }
    console.log('필터링된 식당 개수:', filteredRestaurants.length);

    // 금액 차이 계산 및 정렬
    filteredRestaurants.forEach(restaurant => {
      restaurant.priceDifference = Math.abs(restaurant.price - inputPrice);
    });

    filteredRestaurants.sort((a, b) => {
      if (a.priceDifference === b.priceDifference) {
        return b.rating - a.rating; // 금액 차이가 같으면 별점 순으로 정렬
      }
      return a.priceDifference - b.priceDifference; // 금액 차이 순으로 정렬
    });

    // 중복 제거 및 추천 목록 생성
    const recommendations = getUniqueRecommendations(filteredRestaurants, 3);
    console.log('추천된 식당 개수:', recommendations.length);
    res.status(200).send(recommendations);
  } catch (error) {
    console.error('Error recommending restaurants:', error);
    res.status(500).send(error);
  }
};

const recommendInitialRestaurants = async (req, res) => {
  console.log('초기 식당 추천 요청:', req.body);
  try {
    const price = req.body.price;
    const data = await readCSVData();

    // 금액 차이 계산 및 정렬
    data.forEach(restaurant => {
      restaurant.priceDifference = Math.abs(restaurant.price - price);
    });

    data.sort((a, b) => {
      if (a.priceDifference === b.priceDifference) {
        return b.rating - a.rating; // 금액 차이가 같으면 별점 순으로 정렬
      }
      return a.priceDifference - b.priceDifference; // 금액 차이 순으로 정렬
    });

    // 중복 제거 및 추천 목록 생성
    const recommendations = getUniqueRecommendations(data, 3);
    console.log('초기 추천된 식당 개수:', recommendations.length);
    res.status(200).send(recommendations);
  } catch (error) {
    console.error('Error recommending initial restaurants:', error);
    res.status(500).send(error);
  }
};

// 즐겨찾기 추가
const addFavorite = async (req, res) => {
  console.log('즐겨찾기 추가 요청:', req.body);
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const userId = decoded.id;

    const { name, address, type, price, rating, reviewCount, blogReviewCount } = req.body;

    const existingFavorite = await Favorite.findOne({ userId, name, address });
    if (existingFavorite) {
      return res.status(400).json({ message: '이미 즐겨찾기에 추가된 식당입니다.' });
    }

    const newFavorite = new Favorite({
      userId,
      name,
      address,
      type,
      price,
      rating,
      reviewCount,
      blogReviewCount
    });

    await newFavorite.save();
    res.status(201).json(newFavorite);
  } catch (err) {
    console.error("즐겨찾기 추가 에러:", err);
    res.status(400).json({ error: err.message });
  }
};

// 즐겨찾기 조회
const getFavorites = async (req, res) => {
  console.log('즐겨찾기 조회 요청:', req.headers.authorization);
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const userId = decoded.id;
    console.log('디코딩된 사용자 ID:', userId);

    const favorites = await Favorite.find({ userId });
    res.status(200).json(favorites);
  } catch (err) {
    console.error('즐겨찾기 조회 에러:', err);
    res.status(500).json({ error: err.message });
  }
};

// 즐겨찾기 삭제
const deleteFavorite = async (req, res) => {
  const favoriteId = req.params.id;
  const token = req.headers.authorization.split(' ')[1];
  let decoded;
  
  try {
    decoded = jwt.verify(token, 'your_jwt_secret');
  } catch (error) {
    console.error('JWT 검증 오류:', error);
    return res.status(401).json({ message: '인증 실패' });
  }
  
  const userId = decoded.id;

  try {
    console.log('삭제 요청:', { favoriteId, userId });
    const favorite = await Favorite.findOneAndDelete({ _id: favoriteId, userId });
    if (!favorite) {
      console.log('즐겨찾기에서 식당을 찾을 수 없습니다:', favoriteId);
      return res.status(404).json({ message: '즐겨찾기에서 식당을 찾을 수 없습니다.' });
    }
    console.log('즐겨찾기에서 삭제되었습니다:', favoriteId);
    res.json({ message: '즐겨찾기에서 삭제되었습니다.' });
  } catch (error) {
    console.error('즐겨찾기 삭제 중 오류 발생:', error);
    res.status(500).json({ message: '즐겨찾기 삭제 중 오류가 발생했습니다.' });
  }
};

module.exports = {
  getRestaurantInfo,
  recommendRestaurants,
  recommendInitialRestaurants, // 추가
  addFavorite,
  getFavorites,
  deleteFavorite,
};