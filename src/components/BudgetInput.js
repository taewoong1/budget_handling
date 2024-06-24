import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import './BudgetInput.css';

function BudgetInput() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [income, setIncome] = useState({
    월급: 0,
    부수입: 0,
    용돈: 0,
    상여: 0,
    금융소득: 0,
    기타: 0,
  });
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const userId = user ? user._id : null;

  const fetchBudget = async (year, month) => {
    if (userId) {
      try {
        const res = await axios.get(`http://localhost:5000/api/budget/${userId}/${year}/${month}`);
        if (res.data) {
          setIncome(res.data);
        } else {
          setIncome({
            월급: 0,
            부수입: 0,
            용돈: 0,
            상여: 0,
            금융소득: 0,
            기타: 0,
          });
        }
      } catch (err) {
        console.error('예산 정보 불러오기 실패:', err);
        setIncome({
          월급: 0,
          부수입: 0,
          용돈: 0,
          상여: 0,
          금융소득: 0,
          기타: 0,
        });
      }
    }
  };

  useEffect(() => {
    fetchBudget(year, month);
  }, [userId, year, month]);

  const handleInputChange = (category, value) => {
    setIncome({
      ...income,
      [category]: value,
    });
  };

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5000/api/budget/save', {
        userId,
        year,
        month,
        income,
      });
      alert('저장되었습니다');
    } catch (err) {
      console.error('저장 실패:', err);
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleBack = () => {
    navigate('/mypage');
  };

  return (
    <div className="budget-container">
      <button className="back-button" onClick={handleBack}>뒤로가기</button>
      <h2>예산 설정</h2>
      <div className="budget-header">
        <button className="nav-button" onClick={handlePrevMonth}>{'<'}</button>
        <span>{year}년 {month}월</span>
        <button className="nav-button" onClick={handleNextMonth}>{'>'}</button>
      </div>
      <div className="budget-form">
        {Object.keys(income).map((category) => (
          <div key={category} className="budget-item">
            <label>{category}</label>
            <input
              type="number"
              value={income[category]}
              onChange={(e) => handleInputChange(category, e.target.value)}
            />
          </div>
        ))}
      </div>
      <button className="save-button" onClick={handleSave}>저장</button>
    </div>
  );
}

export default BudgetInput;