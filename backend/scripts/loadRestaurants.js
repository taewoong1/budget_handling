const csv = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const Restaurant = require('../models/Restaurant');

mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
  loadCSVData();
});

const loadCSVData = () => {
  const results = [];
  fs.createReadStream('D:/projects/data/yeongtong_data.csv', { encoding: 'utf8' })
    .pipe(csv())
    .on('data', (data) => {
      const restaurant = {
        name: data['가게 이름'],
        address: data['주소'],
        type: data['음식 종류'],
        price: parseInt(data['가격'], 10) || 0,
        rating: parseFloat(data['네이버 지도 별점']) || 0,
        reviewCount: parseInt(data['방문자 리뷰?'], 10) || 0,
        blogReviewCount: parseInt(data['블로그 리뷰'], 10) || 0,
      };
      // 디버깅 로그 추가
      if (restaurant.name && restaurant.address && restaurant.type) {
        console.log('Valid restaurant:', restaurant); // 유효한 데이터 확인용 로그
        results.push(restaurant);
      } else {
        console.log('Invalid restaurant data:', data); // 문제 있는 데이터 확인
      }
    })
    .on('end', async () => {
      try {
        if (results.length > 0) {
          await Restaurant.insertMany(results);
          console.log('Data successfully loaded into MongoDB');
        } else {
          console.log('No valid data to load into MongoDB');
        }
        mongoose.connection.close();
      } catch (err) {
        console.error('Error loading data:', err);
      }
    })
    .on('error', (err) => {
      console.error('CSV reading error:', err);
    });
};