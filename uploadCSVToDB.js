const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const Restaurant = require('./backend/models/Restaurant'); // 경로 수정

const uploadCSVToDB = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream('C:/project/data/yeongtong_data.csv', { encoding: 'utf8' })
      .pipe(csv())
      .on('data', (data) => {
        const restaurant = {
          name: data['﻿가게 이름'].trim(),
          address: data['주소'].trim(),
          type: data['음식 종류'].trim(),
          price: parseInt(data['가격'], 10) || 0,
          rating: parseFloat(data['네이버 지도 별점']) || 0,
          reviewCount: parseInt(data['방문자 리뷰?'], 10) || 0,
          blogReviewCount: parseInt(data['블로그 리뷰'], 10) || 0,
        };

        if (restaurant.name && restaurant.address && restaurant.type) {
          results.push(restaurant);
        }
      })
      .on('end', async () => {
        try {
          await Restaurant.insertMany(results);
          console.log('Data successfully uploaded:', results);
          mongoose.connection.close();
          resolve(results);
        } catch (error) {
          mongoose.connection.close();
          reject(error);
        }
      })
      .on('error', (err) => {
        mongoose.connection.close();
        reject(err);
      });
  });
};

mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    uploadCSVToDB()
      .then((results) => {
        console.log('Data successfully uploaded:', results);
      })
      .catch((error) => {
        console.error('Error uploading data:', error);
      });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
