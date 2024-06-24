import React, { useEffect, useState, useContext } from 'react';
import axios from '../axios';
import { UserContext } from '../contexts/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import 기타Icon from '../images/기타.png';
import 분식Icon from '../images/분식.png';
import 아시아음식Icon from '../images/아시아음식.png';
import 양식Icon from '../images/양식.png';
import 일식Icon from '../images/일식.png';
import 중식Icon from '../images/중식.png';
import 카페Icon from '../images/카페.png';
import 한식Icon from '../images/한식.png';
import '../styles/Favorites.css'; // CSS 파일 임포트

Modal.setAppElement('#root'); // 모달 접근성을 위해 필수

const categoryList = [
  { name: '분식', icon: 분식Icon },
  { name: '아시아음식', icon: 아시아음식Icon },
  { name: '양식', icon: 양식Icon },
  { name: '일식', icon: 일식Icon },
  { name: '중식', icon: 중식Icon },
  { name: '카페', icon: 카페Icon },
  { name: '한식', icon: 한식Icon },
  { name: '기타', icon: 기타Icon }

];

function Favorites() {
  const { user } = useContext(UserContext);
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/restaurants/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setFavorites(response.data);
      categorizeFavorites(response.data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      toast.error('즐겨찾기 데이터를 불러오는데 실패했습니다.', {
        position: "top-right"
      });
    }
  };

  const categorizeFavorites = (favorites) => {
    const categories = favorites.reduce((acc, favorite) => {
      if (!acc[favorite.type]) {
        acc[favorite.type] = [];
      }
      acc[favorite.type].push(favorite);
      return acc;
    }, {});
    setCategories(categories);
  };

  const toggleCategory = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const openModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const closeModal = () => {
    setSelectedRestaurant(null);
  };

  const deleteFavorite = async (restaurantId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/restaurants/favorites/${restaurantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('즐겨찾기에서 삭제되었습니다.', {
        position: "top-right"
      });
      fetchFavorites(); // 즐겨찾기 목록을 다시 불러옵니다.
      closeModal(); // 모달을 닫습니다.
    } catch (err) {
      console.error('즐겨찾기 삭제 중 오류 발생:', err);
      toast.error('즐겨찾기 삭제 중 오류가 발생했습니다.', {
        position: "top-right"
      });
    }
  };

  return (
    <div className="favorites-container">
      <ToastContainer />
      <h2>즐겨찾기 목록</h2>
      {categoryList.map((category) => (
        <div key={category.name} className="category">
          <h3 onClick={() => toggleCategory(category.name)}>
            <div className="left">
              <img src={category.icon} alt={category.name} className="category-icon" />
              <span className="category-name">{category.name}</span>
            </div>
            <div className="toggle-icon">{selectedCategory === category.name ? '▲' : '▼'}</div>
          </h3>
          {selectedCategory === category.name && (
            <div className="favorite-items">
              {categories[category.name] ? (
                categories[category.name].map((favorite) => (
                  <div key={favorite._id} className="favorite-item" onClick={() => openModal(favorite)}>
                    <p>{favorite.name}</p>
                  </div>
                ))
              ) : (
                <p>즐겨찾기된 식당이 없습니다.</p>
              )}
            </div>
          )}
        </div>
      ))}
      <Modal
        isOpen={!!selectedRestaurant}
        onRequestClose={closeModal}
        contentLabel="Restaurant Details"
        className="modal"
        overlayClassName="overlay"
      >
        {selectedRestaurant && (
          <div className="restaurant-details">
            <h2>{selectedRestaurant.name}</h2>
            <p>주소: {selectedRestaurant.address}</p>
            <p>가격: {selectedRestaurant.price}</p>
            <p>별점: {selectedRestaurant.rating}</p>
            <p>리뷰 수: {selectedRestaurant.reviewCount}</p>
            <p>블로그 리뷰 수: {selectedRestaurant.blogReviewCount}</p>
            <button onClick={closeModal}>닫기</button>
            <button onClick={() => deleteFavorite(selectedRestaurant._id)}>삭제</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Favorites;
