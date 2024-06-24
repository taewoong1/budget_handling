import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext'; // Import UserContext
import './MyPage.css';

const MyPage = () => {
  const { user, setUser } = useContext(UserContext); // Use user and setUser from context
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="mypage-container">
      <h2 className="mypage-header">마이페이지</h2>
      {user ? (
        <div className="auth-buttons">
          <p>반갑습니다 {user.nickname}님. </p>
          <button className="logout-button" onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <div className="auth-buttons">
          <button onClick={() => navigate('/login')}>로그인</button>
          <button onClick={() => navigate('/register')}>회원가입</button>
        </div>
      )}
      <div className="extra-options">
        <button onClick={() => navigate('/budget-input')}>예산입력</button>
        <button onClick={() => navigate('/fixed-expenses')}>고정지출</button>
      </div>
      <div className="links-section">
        <button onClick={() => navigate('/notices')}>공지사항</button>
        <button onClick={() => navigate('/help')}>도움말</button>
      </div>
    </div>
  );
};

export default MyPage;