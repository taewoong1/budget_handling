import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from '../axios';
import './FoodRec.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import { UserContext } from '../contexts/UserContext';

const foodTypes = ['중식', '한식', '일식', '카페','양식','아시아음식','분식','기타'];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const API_KEY = 'AIzaSyDmrB4NIQwns1iSsJoXHKuLoYRTBhf3vkA';

const scriptOptions = {
  async: true,
  defer: true,
};

function FoodRec() {
  const { user } = useContext(UserContext);
  const [hasFavorite, setHasFavorite] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [initialRecommendations, setInitialRecommendations] = useState([]);
  const [criteria, setCriteria] = useState({ type: '', price: '' });
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [perMealAmount, setPerMealAmount] = useState(0);

  const fetchRemainingAmount = useCallback(async () => {
    if (!user) return;
    try {
      const userId = user._id;
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      console.log('사용자 ID:', userId);
      console.log('년도와 월:', year, month);

      const incomeRes = await axios.get(`http://localhost:5000/api/budget/${userId}/${year}/${month}`);
      const expenseRes = await axios.get(`http://localhost:5000/api/expenses/month/${userId}/${year}/${month}`);
      const fixedExpenseRes = await axios.get(`http://localhost:5000/api/fixed-expenses/${userId}/${year}/${month}`);

      console.log('소득 응답:', incomeRes.data);
      console.log('지출 응답:', expenseRes.data);
      console.log('고정 지출 응답:', fixedExpenseRes.data);

      const totalIncome = Object.values(incomeRes.data).reduce((acc, curr) => acc + Number(curr), 0);
      const totalExpenses = Object.values(expenseRes.data).reduce((acc, dailyExpenses) => {
        return acc + Object.values(dailyExpenses).reduce((sum, value) => sum + Number(value), 0);
      }, 0);

      const totalFixedExpenses = fixedExpenseRes.data.reduce((acc, expense) => {
        return acc + Object.values(expense.amounts).reduce((sum, value) => sum + Number(value), 0);
      }, 0);

      const remainingAmount = totalIncome - totalExpenses - totalFixedExpenses;
      setRemainingAmount(remainingAmount);

      const currentDate = new Date();
      const daysInMonth = new Date(year, month, 0).getDate();
      const remainingDays = daysInMonth - currentDate.getDate() + 1;
      const perMealAmount = Math.floor((remainingAmount * 0.65 / remainingDays) / 3); // 전체 금액의 65%를 기준으로 계산
      setPerMealAmount(perMealAmount);

      // 초기 추천 음식점 불러오기
      const res = await axios.post('/api/restaurants/recommend', { price: perMealAmount });
      console.log('초기 추천 결과:', res.data);
      setInitialRecommendations(await Promise.all(res.data.map(async (rec) => {
        const loc = await getGeocode(rec.address);
        return { ...rec, location: loc };
      })));

    } catch (error) {
      console.error('Failed to fetch remaining amount:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchRemainingAmount();
  }, [fetchRemainingAmount]);

  useEffect(() => {
    if (searchResults.length > 0) {
      const fetchLocation = async () => {
        const updatedResults = await Promise.all(searchResults.map(async (result) => {
          const loc = await getGeocode(result.address);
          return { ...result, location: loc };
        }));
        setSearchResults(updatedResults);
      };
      fetchLocation();
    }
  }, [searchResults]);

  const getGeocode = async (address) => {
    try {
      console.log(`Getting geocode for address: ${address}`);
      const encodedAddress = encodeURIComponent(address);
      console.log(`Encoded address: ${encodedAddress}`); // 디버깅용 로그 추가
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${API_KEY}`);
      console.log('Geocode response:', response.data);
      if (response.data.status === 'OK') {
        const location = response.data.results[0]?.geometry.location;
        console.log('Geocode location:', location); // 디버깅용 로그 추가
        return location;
      } else {
        console.error('Geocode error:', response.data.status, response.data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  const handleSearch = async () => {
    console.log('식당 검색 요청:', searchTerm);
    try {
      const res = await axios.post('/api/restaurants/restaurant-info', { title: searchTerm });
      console.log('검색 결과:', res.data);
      setSearchResults([res.data]);
    } catch (err) {
      console.error('Error searching for restaurant:', err);
      setSearchResults([]);
    }
  };

  const handleRecommend = async () => {
    console.log('식당 추천 요청:', criteria);
    try {
      const priceRange = parseInt(criteria.price, 10);
      const res = await axios.post('/api/restaurants/recommend', { criteria: { ...criteria, price: priceRange } });
      console.log('추천 결과:', res.data);
      setRecommendations(await Promise.all(res.data.map(async (rec) => {
        const loc = await getGeocode(rec.address);
        return { ...rec, location: loc };
      })));
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setRecommendations([]);
    }
  };

  const addFavorite = (restaurant) => {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    console.log('즐겨찾기 추가 요청:', restaurant);
    axios.post('/api/restaurants/favorites', restaurant, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        console.log('즐겨찾기 추가 성공:', res.data);
        toast.success('즐겨찾기 추가되었습니다!', {
          position: "top-right"
        });
      })
      .catch(err => {
        console.error('Error adding favorite:', err);
        if (err.response && err.response.data.message) {
          toast.error(err.response.data.message, {
            position: "top-right"
          });
        } else {
          toast.error('즐겨찾기 추가 실패!', {
            position: "top-right"
          });
        }
      });
  };

  const handleHasFavoriteChange = (value) => {
    setHasFavorite(value);
    setSearchTerm('');
    setSearchResults([]);
    setRecommendations([]);
  };

  return (
    <div className="foodrec-container">
      <ToastContainer />
      <h2>맛집 추천 서비스</h2>
      <div>
        <label>가고 싶은 식당이 있나요?</label>
        <div>
          <button className="action-button" onClick={() => handleHasFavoriteChange(true)}>네</button>
          <button className="action-button" onClick={() => handleHasFavoriteChange(false)}>아니요</button>
        </div>
      </div>
      <div className="remaining-amount-box">
        <strong>이번달 가용 금액 : {remainingAmount.toLocaleString()} 원 </strong>
        <span className="separator"> | </span>
        <strong>1끼니 가용 금액 : {perMealAmount.toLocaleString()} 원</strong>
      </div>
      <p className="note">※ 1끼니 가용 금액 = 가용 금액의 65% / 남은 일수 / 3(끼니)</p>

      {hasFavorite === null && (
        <div className="initial-recommendations">
          <h3>가용 금액 대비 추천 식당</h3>
          {initialRecommendations.length > 0 ? (
            <div className="recommendations">
              {initialRecommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <p>이름: {rec.name}</p>
                  <p>음식 종류: {rec.type}</p>
                  <p>가격: {rec.price}</p>
                  <p>네이버 별점: {rec.rating}</p>
                  <p>위치: {rec.address}</p>
                  {rec.reviewCount && <p>블로그 리뷰수: {rec.reviewCount}</p>}
                  <button className="action-button" onClick={() => addFavorite(rec)}>즐겨찾기 추가</button>
                  {rec.location && (
                    <div className="map-container">
                      <LoadScript googleMapsApiKey={API_KEY} options={scriptOptions}>
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={rec.location}
                          zoom={17}
                        >
                          <MarkerF position={rec.location} />
                        </GoogleMap>
                      </LoadScript>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>추천 결과가 없습니다.</p>
          )}
        </div>
      )}

      {hasFavorite === true && (
        <div className="favorite-search">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="식당 이름을 입력하세요"
          />
          <button className="action-button" onClick={handleSearch}>검색</button>
          <div className="search-results">
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <div key={index} className="favorite-item">
                  <p>이름: {result.name}</p>
                  <p>음식 종류: {result.type}</p>
                  <p>가격: {result.price}</p>
                  <p>네이버 별점: {result.rating}</p>
                  <p>위치: {result.address}</p>
                  {result.reviewCount && <p>블로그 리뷰수: {result.reviewCount}</p>}
                  <button className="action-button" onClick={() => addFavorite(result)}>즐겨찾기 추가</button>
                  {result.location && (
                    <div className="map-container">
                      <LoadScript googleMapsApiKey={API_KEY} options={scriptOptions}>
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={result.location}
                          zoom={17}
                        >
                          <MarkerF position={result.location} />
                        </GoogleMap>
                      </LoadScript>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>검색 결과가 없습니다.</p>
            )}
          </div>
        </div>
      )}

      {hasFavorite === false && (
        <div className="no-favorite">
          <div className="recommendation-criteria">
            <select
              value={criteria.type}
              onChange={(e) => setCriteria({ ...criteria, type: e.target.value })}
              className="input-field"
              placeholder="음식 종류 선택">
              <option value="">음식 종류 선택</option>
              {foodTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              type="number"
              value={criteria.price}
              onChange={(e) => setCriteria({ ...criteria, price: e.target.value })}
              className="input-field"
              placeholder="가격대 입력"
            />
          </div>
          <button className="action-button" onClick={handleRecommend}>추천 받기</button>
          <div className="recommendations">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <p>이름: {rec.name}</p>
                  <p>음식 종류: {rec.type}</p>
                  <p>가격: {rec.price}</p>
                  <p>네이버 별점: {rec.rating}</p>
                  <p>위치: {rec.address}</p>
                  {rec.reviewCount && <p>블로그 리뷰수: {rec.reviewCount}</p>}
                  <button className="action-button" onClick={() => addFavorite(rec)}>즐겨찾기 추가</button>
                  {rec.location && (
                    <div className="map-container">
                      <LoadScript googleMapsApiKey={API_KEY} options={scriptOptions}>
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={rec.location}
                          zoom={17}
                        >
                          <MarkerF position={rec.location} />
                        </GoogleMap>
                      </LoadScript>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>추천 결과가 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodRec;
