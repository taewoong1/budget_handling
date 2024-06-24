import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import './Calendar.css';
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile';

function formatNumber(num) {
  return num.toLocaleString();
}

function Calendar() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [days, setDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [expenses, setExpenses] = useState({});
  const [newCategory, setNewCategory] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [totals, setTotals] = useState({});
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [today, setToday] = useState(new Date());

  const userId = user ? user._id : null;

  const defaultCategories = {
    '식비': '',
    '교통/차량': '',
    '문화생활': '',
    '기타': '',
  };

  const fetchMonthlyExpenses = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/expenses/month/${userId}/${date.getFullYear()}/${date.getMonth() + 1}`);
      const expenseData = res.data;

      const newTotals = {};
      let totalForMonth = 0;
      Object.keys(expenseData).forEach((day) => {
        const dailyExpenses = expenseData[day];
        const dailyTotal = Object.values(dailyExpenses).reduce((acc, curr) => acc + Number(curr), 0);
        newTotals[day] = dailyTotal;
        totalForMonth += dailyTotal;
      });

      fixedExpenses.forEach(expense => {
        Object.keys(expense.amounts).forEach(category => {
          const amount = Number(expense.amounts[category]);
          if (newTotals[1]) {
            newTotals[1] += amount;
          } else {
            newTotals[1] = amount;
          }
          totalForMonth += amount;
        });
      });

      setTotals(newTotals);
      setMonthlyTotal(totalForMonth);
    } catch (err) {
      console.error('월별 지출 정보 불러오기 실패:', err);
    }
  }, [userId, date, fixedExpenses]);

  const fetchMonthlyIncome = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/budget/${userId}/${date.getFullYear()}/${date.getMonth() + 1}`);
      const incomeData = res.data;
      const totalIncome = Object.values(incomeData).reduce((acc, curr) => acc + Number(curr), 0);
      setMonthlyIncome(totalIncome);
    } catch (err) {
      console.error('월별 수입 정보 불러오기 실패:', err);
    }
  }, [userId, date]);

  const fetchFixedExpenses = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/fixed-expenses/${userId}/${date.getFullYear()}/${date.getMonth() + 1}`);
      setFixedExpenses(res.data);
    } catch (err) {
      console.error('고정 지출 정보 불러오기 실패:', err);
    }
  }, [userId, date]);

  useEffect(() => {
    generateCalendar(date);
    fetchMonthlyExpenses();
    fetchMonthlyIncome();
    fetchFixedExpenses();
  }, [date, fetchMonthlyExpenses, fetchMonthlyIncome, fetchFixedExpenses]);

  const fetchExpenses = useCallback(async (selectedDate) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/expenses/${userId}/${selectedDate}`);
      setExpenses({ ...defaultCategories, ...res.data });
    } catch (err) {
      console.error('지출 정보 불러오기 실패:', err);
      setExpenses(defaultCategories);
    }
  }, [userId]);

  useEffect(() => {
    if (selectedDate) {
      fetchExpenses(selectedDate);
    }
  }, [selectedDate, fetchExpenses]);

  const resetMonthlyData = () => {
    setMonthlyIncome(0);
    setMonthlyTotal(0);
    setTotals({});
    fetchMonthlyExpenses();
    fetchMonthlyIncome();
    fetchFixedExpenses();
  };

  const handlePrevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    resetMonthlyData();
  };

  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    resetMonthlyData();
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}년 ${month}월`;
  };

  const generateCalendar = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    const daysArray = [];

    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      daysArray.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }

    setDays(daysArray);
  };

  const handleDateClick = (day) => {
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${day}`;
    setSelectedDate(formattedDate);
    setShowPopup(true);
  };

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5000/api/expenses/save', {
        userId,
        date: selectedDate,
        expenses,
      });
      setMessageContent(`${selectedDate}에 소비가 저장되었습니다`);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
      fetchMonthlyExpenses();
    } catch (err) {
      console.error('저장 실패:', err);
    }
  };

  const handleCategoryChange = (category, value) => {
    setExpenses({
      ...expenses,
      [category]: value,
    });
  };

  const handleAddCategory = () => {
    if (newCategory && !expenses.hasOwnProperty(newCategory)) {
      setExpenses({
        ...expenses,
        [newCategory]: '',
      });
      setNewCategory('');
    }
  };

  const isToday = (day) => {
    const todayDate = new Date();
    return todayDate.getFullYear() === date.getFullYear() &&
      todayDate.getMonth() === date.getMonth() &&
      todayDate.getDate() === day;
  };

  return (
    <div className="calendar-page">
      <div className="profile-sidebar">
        {user && <Profile />} {/* 프로필 컴포넌트 추가 */}
      </div>
      <div className="calendar-container">
        {!user && (
          <div className="login-overlay">
            <div className="login-content">
              <h2>돈의 흐름을 주도하세요</h2>
              <p>건강한 대학생활 앱으로 직접 자산과 예산을 관리하실 수 있습니다.</p>
              <button className="login-button" onClick={() => navigate('/register')}>회원가입하기</button>
              <button className="login-button" onClick={() => navigate('/login')}>로그인하기</button>
            </div>
          </div>
        )}
        <div className={`calendar-content ${!user ? 'blurred' : ''}`}>
          <div className="calendar-header">
            <button className="nav-button" onClick={handlePrevMonth}>{'<'}</button>
            <h2>{formatDate(date)}</h2>
            <button className="nav-button" onClick={handleNextMonth}>{'>'}</button>
          </div>
          <div className="summary">
            <div>수입: {formatNumber(monthlyIncome)} 원</div>
            <div>지출: {formatNumber(monthlyTotal)} 원</div>
            <div>가용 금액: {formatNumber(monthlyIncome - monthlyTotal)} 원</div>
          </div>
          <div className="calendar-body">
            <div className="day-header">일</div>
            <div className="day-header">월</div>
            <div className="day-header">화</div>
            <div className="day-header">수</div>
            <div className="day-header">목</div>
            <div className="day-header">금</div>
            <div className="day-header">토</div>
            {days.map((day, index) => (
              <div
                key={index}
                className={`day-cell ${day ? (isToday(day) ? 'today' : '') : 'empty'}`}
                onClick={() => day && handleDateClick(day)}
              >
                {day && (
                  <>
                    <div className="day-number">{day}</div>
                    <div className="day-total">
                      소비: {formatNumber(totals[`${day}`] || 0)} 원
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          {showPopup && (
            <div className="popup">
              <div className="popup-content">
                <h3>{selectedDate}</h3>
                {Object.keys(expenses).map((category) => (
                  <div key={category} className="expense-item">
                    <label>{category}</label>
                    <div className="input-wrapper">
                      <input
                        type="number"
                        value={expenses[category]}
                        onChange={(e) => handleCategoryChange(category, e.target.value)}
                      />
                      <span className="unit">원</span>
                    </div>
                  </div>
                ))}
                <div className="new-category">
                  <input
                    type="text"
                    placeholder="새 카테고리 추가"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button onClick={handleAddCategory}>추가</button>
                </div>
                <button onClick={handleSave}>저장</button>
                <button onClick={() => setShowPopup(false)}>X</button>
              </div>
            </div>
          )}
          {showMessage && (
            <div className="save-message">{messageContent}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calendar;