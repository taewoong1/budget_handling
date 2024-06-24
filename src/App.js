import React from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Calendar from './components/Calendar';
import Monthly from './components/Monthly';
import Statistics from './components/Statistics';
import MyPage from './components/MyPage';
import BudgetInput from './components/BudgetInput';
import FixedExpenses from './components/FixedExpenses';
import SpendingCategory from './components/SpendingCategory';
import Notices from './components/Notices';
import Help from './components/Help';
import Login from './components/Login';
import Register from './components/Register';
import FoodRec from './components/FoodRec';
import Favorites from './components/Favorites';
import { UserProvider } from './contexts/UserContext';
import './styles/App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const showNavButtons = ['/','/monthly','/statistics'].includes(location.pathname);
  const showFooter = location.pathname === '/';

  return (
    <UserProvider>
      <div className="App">
        <Header />
        {showNavButtons && (
          <div className="content-nav">
            <button className="nav-button" onClick={() => navigate('/')}>달력</button>
            <button className="nav-button" onClick={() => navigate('/monthly')}>월별</button>
            <button className="nav-button" onClick={() => navigate('/statistics')}>통계</button>
          </div>
        )}
        <main>
          <Routes>
            <Route path="/" element={<Calendar />} />
            <Route path="/monthly" element={<Monthly />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/budget-input" element={<BudgetInput />} />
            <Route path="/fixed-expenses" element={<FixedExpenses />} />
            <Route path="/spending-category" element={<SpendingCategory />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/help" element={<Help />} />
            <Route path="/restaurants" element={<FoodRec />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>
        {showFooter && (
          <footer className="app-footer">
            <div className="footer-content">
              <div>제휴문의 · 이용약관 · 개인정보처리방침 · 회원탈퇴</div>
              <div>산공지능(주) | 대표자: 이승준, 이태웅, 이지호, 지인태 | 주소: 경희대학교 국제캠퍼스 | 사업자등록번호: 2020103954</div>
              <div>이메일: help@khu.ac.kr | Copyright © 2010 Realbyte Inc. All right reserved.</div>
            </div>
          </footer>
        )}
      </div>
    </UserProvider>
  );
}

export default App;