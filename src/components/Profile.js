import React, { useContext, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
    setShowLogoutPopup(true); // 로그아웃 팝업 띄우기
    setTimeout(() => setShowLogoutPopup(false), 3000); // 3초 후 팝업 닫기
  };

  if (!user) {
    return null; // 로그인 되어 있지 않으면 아무것도 렌더링하지 않음
  }

  const { profilePicture, nickname, age, university, email, phone } = user;

  return (
    <div className="profile-container">
      <img
        src={profilePicture ? `http://localhost:5000/uploads/${profilePicture}` : 'default-profile.png'}
        alt="Profile"
        className="profile-picture"
      />
      <div className="profile-details">
        <h2 className="profile-nickname">{nickname}님</h2>
        <p className="profile-info">나이: {age}</p>
        <p className="profile-info">학교: {university}</p>
        <p className="profile-info">이메일: {email}</p>
        <p className="profile-info">전화번호: {phone}</p>
        <button className="logout-button" onClick={handleLogout}>로그아웃</button>
        {showLogoutPopup && <div className="logout-popup">로그아웃 되었습니다</div>}
      </div>
    </div>
  );
}

export default Profile;