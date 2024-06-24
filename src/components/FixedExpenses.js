import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import './FixedExpenses.css';

function FixedExpenses() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [showMessage, setShowMessage] = useState(false);

  const userId = user ? user._id : null;

  const fetchFixedExpenses = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/fixed-expenses/${userId}/${currentYear}/${currentMonth}`);
      setFixedExpenses(res.data);
    } catch (err) {
      console.error('고정 지출 정보 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchFixedExpenses();
  }, [userId, currentYear, currentMonth]);

  const handleAddCategory = () => {
    if (newCategory.trim() !== '') {
      setCategories([...categories, { name: newCategory, amount: 0 }]);
      setNewCategory('');
    }
  };

  const handleCategoryChange = (index, value) => {
    const updatedCategories = [...categories];
    updatedCategories[index].amount = parseInt(value, 10) || 0;
    setCategories(updatedCategories);
  };

  const handleSaveExpense = async () => {
    if (!userId || !categories.length) return;

    const amounts = {};
    categories.forEach(category => {
      amounts[category.name] = category.amount;
    });

    try {
      const newExpense = { userId, categories: categories.map(cat => cat.name), amounts, year: currentYear, month: currentMonth };
      await axios.post('http://localhost:5000/api/fixed-expenses', newExpense);
      await fetchFixedExpenses(); // 저장 후 최신 상태 반영
      setCategories([]);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    } catch (err) {
      console.error('고정 지출 저장 실패:', err);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prevYear => prevYear - 1);
    } else {
      setCurrentMonth(prevMonth => prevMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prevYear => prevYear + 1);
    } else {
      setCurrentMonth(prevMonth => prevMonth + 1);
    }
  };

  const handleBack = () => {
    navigate('/mypage');
  };

  return (
    <div className="fixed-expenses-container">
      <div className="fixed-expenses-box">
        <button className="back-button" onClick={handleBack}>뒤로가기</button>
        <div className="fixed-expense-header">
          <button onClick={handlePrevMonth}>{'<'}</button>
          <h3>{`${currentYear}년 ${currentMonth}월`}</h3>
          <button onClick={handleNextMonth}>{'>'}</button>
        </div>
        <div className="expense-form">
          {categories.map((category, index) => (
            <div key={index} className="expense-item">
              <label>{category.name}</label>
              <input
                type="number"
                value={category.amount}
                onChange={(e) => handleCategoryChange(index, e.target.value)}
                placeholder="금액 입력"
              />
            </div>
          ))}
          <div className="new-category-input">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="새 카테고리 추가"
            />
            <button onClick={handleAddCategory}>추가</button>
          </div>
          <button className="save-button" onClick={handleSaveExpense}>저장</button>
        </div>
      </div>
      <div className="fixed-expense-list-box">
        <h3>저장된 고정 지출</h3>
        <div className="fixed-expense-list">
          <ul>
            {fixedExpenses.map((expense, index) => (
              <li key={index}>
                {Object.entries(expense.amounts).map(([category, amount]) => (
                  <div key={category}>
                    {category}: {amount ? amount.toLocaleString() : 0}원
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </div>
        {showMessage && (
          <div className="save-message">
            저장되었습니다
          </div>
        )}
      </div>
    </div>
  );
}

export default FixedExpenses;
