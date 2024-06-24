import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { UserContext } from '../contexts/UserContext';
import './Statistics.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Statistics = () => {
  const { user } = useContext(UserContext);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [userExpenses, setUserExpenses] = useState({});
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const userId = user ? user._id : null;

  const studentExpenses = {
    식비: 500000,
    교통: 150000,
    문화생활: 200000,
    학습비: 100000,
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/expenses/month/${userId}/${currentYear}/${currentMonth}`);
        setUserExpenses(res.data);

        const fixedRes = await axios.get(`http://localhost:5000/api/fixed-expenses/${userId}/${currentYear}/${currentMonth}`);
        setFixedExpenses(fixedRes.data);
      } catch (err) {
        console.error('지출 정보 불러오기 실패:', err);
      }
    };
    fetchExpenses();
  }, [userId, currentYear, currentMonth]);

  const calculateCategorySum = (expenses) => {
    const categorySum = {};
    Object.values(expenses).forEach((dayExpenses) => {
      Object.entries(dayExpenses).forEach(([category, amount]) => {
        if (!categorySum[category]) categorySum[category] = 0;
        categorySum[category] += Number(amount);
      });
    });
    return categorySum;
  };

  const calculateFixedCategorySum = (fixedExpenses) => {
    const categorySum = {};
    fixedExpenses.forEach(expense => {
      Object.entries(expense.amounts).forEach(([category, amount]) => {
        if (!categorySum[category]) categorySum[category] = 0;
        categorySum[category] += Number(amount);
      });
    });
    return categorySum;
  };

  const studentData = {
    labels: Object.keys(studentExpenses),
    datasets: [
      {
        data: Object.values(studentExpenses),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40'],
      },
    ],
  };

  const userCategorySum = calculateCategorySum(userExpenses);
  const userFixedCategorySum = calculateFixedCategorySum(fixedExpenses);
  const combinedUserCategorySum = { ...userCategorySum };

  Object.entries(userFixedCategorySum).forEach(([category, amount]) => {
    if (combinedUserCategorySum[category]) {
      combinedUserCategorySum[category] += amount;
    } else {
      combinedUserCategorySum[category] = amount;
    }
  });

  const userData = {
    labels: Object.keys(combinedUserCategorySum),
    datasets: [
      {
        data: Object.values(combinedUserCategorySum),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40'],
      },
    ],
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev === 1 ? 12 : prev - 1));
    if (currentMonth === 1) setCurrentYear((prev) => prev - 1);
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev === 12 ? 1 : prev + 1));
    if (currentMonth === 12) setCurrentYear((prev) => prev + 1);
  };

  return (
    <div className="statistics-container">
      <div className="stat-header">
        <button onClick={handlePrevMonth}>{'<'}</button>
        <h2>{`${currentYear}년 ${currentMonth}월`}</h2>
        <button onClick={handleNextMonth}>{'>'}</button>
      </div>
      <div className="content">
        <div className="chart">
          <h3>대학생 평균</h3>
          <Pie data={studentData} />
          <ul>
            {Object.entries(studentExpenses).map(([category, amount]) => (
              <li key={category}>
                {category}: {amount.toLocaleString()}원
              </li>
            ))}
          </ul>
        </div>
        <div className="chart">
          <h3>나</h3>
          <Pie data={userData} />
          <ul>
            {Object.entries(combinedUserCategorySum).map(([category, amount]) => (
              <li key={category}>
                {category}: {amount ? amount.toLocaleString() : 0}원
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Statistics;