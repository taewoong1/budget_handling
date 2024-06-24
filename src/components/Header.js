import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/Header.css'; // Header.css가 components 폴더에 있음
import calendarIcon from '../images/calendar_icon.png';
import restaurantIcon from '../images/food_icon.png';
import favoritesIcon from '../images/star_icon.png';
import mypageIcon from '../images/ppl_icon.png';

function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <button onClick={() => navigate('/')}>
        <img src={calendarIcon} alt="Calendar" />
        소비달력
      </button>
      <button onClick={() => navigate('/restaurants')}>
        <img src={restaurantIcon} alt="Restaurant" />
        식당찾기
      </button>
      <button onClick={() => navigate('/favorites')}>
        <img src={favoritesIcon} alt="Favorites" />
        즐겨찾기
      </button>
      <button onClick={() => navigate('/mypage')}>
        <img src={mypageIcon} alt="My Page" />
        마이페이지
      </button>
    </header>
  );
}

export default Header;