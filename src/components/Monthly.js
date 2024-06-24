import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { UserContext } from '../contexts/UserContext';
import './Monthly.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Monthly = () => {
  const { user } = useContext(UserContext);
  const [currentMonthData, setCurrentMonthData] = useState([]);
  const [previousMonthData, setPreviousMonthData] = useState([]);
  const [currentWeekData, setCurrentWeekData] = useState([]);
  const [previousWeekData, setPreviousWeekData] = useState([]);
  const [budget, setBudget] = useState(0);
  const [alert, setAlert] = useState('');
  const [alertColor, setAlertColor] = useState('');
  const [budgetLeft, setBudgetLeft] = useState(0);
  const [budgetColor, setBudgetColor] = useState('');
  const [difference, setDifference] = useState(0);
  const [budgetLineData, setBudgetLineData] = useState([]); // State to hold budget line data
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const today = new Date().getDate();
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate(); // Last day of the current month
  const userId = user ? user._id : localStorage.getItem('userId');

  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

  useEffect(() => {
    const fetchBudgetAndData = async () => {
      if (!userId) return;

      try {
        // Fetch budget information
        const budgetRes = await axios.get(`http://localhost:5000/api/budget/${userId}/${currentYear}/${currentMonth}`);
        const budgetData = budgetRes.data;
        const totalBudget = Object.values(budgetData).reduce((acc, curr) => acc + Number(curr), 0);
        setBudget(totalBudget);

        // Fetch expenses data for current and previous months
        const currentMonthRes = await axios.get(`http://localhost:5000/api/expenses/month/${userId}/${currentYear}/${currentMonth}`);
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        const previousMonthRes = await axios.get(`http://localhost:5000/api/expenses/month/${userId}/${previousYear}/${previousMonth}`);
        const fixedRes = await axios.get(`http://localhost:5000/api/fixed-expenses/${userId}/${currentYear}/${currentMonth}`);

        // Calculate cumulative and weekly data for current and previous months
        const calculateCumulativeAndWeekly = (data, fixedData, daysInMonth) => {
          let cumulative = [];
          let sum = 0;
          let weekly = Array(5).fill(0);

          for (let i = 1; i <= daysInMonth; i++) {
            sum += data[i] ? Object.values(data[i]).reduce((acc, curr) => acc + Number(curr), 0) : 0;

            if (i === 1) {
              fixedData.forEach(expense => {
                sum += Object.values(expense.amounts).reduce((acc, curr) => acc + Number(curr), 0);
              });
            }

            cumulative.push(sum);

            if (i <= today) {
              const weekIndex = Math.floor((i - 1) / 7);
              weekly[weekIndex] += data[i] ? Object.values(data[i]).reduce((acc, curr) => acc + Number(curr), 0) : 0;
              if (i === 1) {
                fixedData.forEach(expense => {
                  weekly[weekIndex] += Object.values(expense.amounts).reduce((acc, curr) => acc + Number(curr), 0);
                });
              }
            }
          }

          return { cumulative, weekly };
        };

        const currentDaysInMonth = getDaysInMonth(currentYear, currentMonth);
        const previousDaysInMonth = getDaysInMonth(previousYear, previousMonth);

        const currentCumulative = calculateCumulativeAndWeekly(currentMonthRes.data, fixedRes.data, currentDaysInMonth);
        const previousCumulative = calculateCumulativeAndWeekly(previousMonthRes.data, [], previousDaysInMonth);

        const paddedCurrentData = [...currentCumulative.cumulative];
        const paddedPreviousData = [...previousCumulative.cumulative];

        while (paddedCurrentData.length < previousDaysInMonth) {
          paddedCurrentData.push(0);
        }
        while (paddedPreviousData.length < currentDaysInMonth) {
          paddedPreviousData.push(0);
        }

        setCurrentMonthData(paddedCurrentData.slice(0, today));
        setPreviousMonthData(paddedPreviousData);
        setCurrentWeekData(currentCumulative.weekly);
        setPreviousWeekData(previousCumulative.weekly);

        const currentSpending = currentCumulative.cumulative[today - 1];
        const remainingBudget = totalBudget - currentSpending;
        setBudgetLeft(remainingBudget);

        let color = 'green';
        if (remainingBudget < totalBudget * 0.2) {
          color = 'red';
        } else if (remainingBudget < totalBudget * 0.5) {
          color = 'orange';
        } else if (remainingBudget < totalBudget * 0.8) {
          color = 'blue';
        }
        setBudgetColor(color);

        // Calculate difference between current and previous month spending
        const previousSpending = previousCumulative.cumulative[today - 1];
        const diff = currentSpending - previousSpending;
        setDifference(diff);

        // Set alert for budget exceeded
        if (currentSpending > totalBudget) {
          setAlert(`경고: 예산을 초과했습니다! 오늘까지의 지출: ${currentSpending.toLocaleString()}원`);
          setAlertColor('red');
        } else {
          setAlert(`오늘까지의 지출: ${currentSpending.toLocaleString()}원`);
          setAlertColor('green');
        }

        // Prepare data for budget line
        let longerDataLength = Math.max(currentDaysInMonth, previousDaysInMonth);
        const budgetLine = Array.from({ length: longerDataLength }, () => totalBudget);

        setBudgetLineData(budgetLine);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchBudgetAndData();
  }, [userId, currentYear, currentMonth, today]);

  const totalCurrentMonth = currentMonthData.length ? currentMonthData[currentMonthData.length - 1] : 0;
  const totalPreviousMonth = previousMonthData.length ? previousMonthData[previousMonthData.length - 1] : 0;
  const monthDifference = totalCurrentMonth - totalPreviousMonth;

  const labels = Array.from({ length: Math.max(today, previousMonthData.length) }, (_, i) => `${i + 1}`);
  const weeklyLabels = ['1주차', '2주차', '3주차', '4주차', '5주차'];

  const data = {
    labels,
    datasets: [
      {
        label: `${currentMonth}월`,
        data: currentMonthData,
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
        fill: true,
      },
      {
        label: `${currentMonth === 1 ? 12 : currentMonth - 1}월`,
        data: previousMonthData,
        borderColor: 'gray',
        backgroundColor: 'rgba(128, 128, 128, 0.2)',
        fill: true,
      },
      {
        label: '이번 달예산',
        data: budgetLineData,
        borderColor: 'red', // 빨간 선으로 표시
        borderWidth: 1,
        borderDash: [5, 5], // 점선으로 표시 (선택적)
        fill: false,
      },
    ],
  };

  const weeklyData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: `${currentMonth}월 주간 지출`,
        data: currentWeekData,
        borderColor: 'green',
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        fill: true,
      },
      {
        label: `${currentMonth === 1 ? 12 : currentMonth - 1}월 주간 지출`,
        data: previousWeekData,
        borderColor: 'orange',
        backgroundColor: 'rgba(255, 165, 0, 0.2)',
        fill: true,
      },
    ],
  };

  const plugins = [
    {
      id: 'custom-text',
      afterDatasetsDraw: (chart) => {
        const { ctx, scales } = chart;
        ctx.save();
        const x = scales.x.getPixelForValue(today - 1);
        const yPrevious = scales.y.getPixelForValue(previousMonthData[today - 1]);
        const text = `지난달 이맘때보다 ${difference > 0 ? '+' : ''}${difference.toLocaleString()}원 ${difference > 0 ? '더' : '덜'} 썼어요`;

        ctx.font = '14px Arial';
        ctx.fillStyle = difference > 0 ? 'red' : 'green';
        ctx.textAlign = 'left';
        ctx.fillText(text, x + 10, yPrevious - 10);
        ctx.restore();
      },
    },
  ];

  return (
    <div className="monthly-container">
      <h2>월별 통계</h2>
      <div className={`alert ${alertColor}`}>{alert}</div>
      <div className="summary">
        <div>지난 달 총 지출: <strong>{totalPreviousMonth.toLocaleString()}원</strong></div>
        <div>지난 달 대비 소비 변화: <strong>{monthDifference > 0 ? `+${monthDifference.toLocaleString()}` : monthDifference.toLocaleString()}원</strong></div>
        <div style={{ color: budgetColor }}>가용 예산: <strong>{budgetLeft.toLocaleString()}원</strong></div>
      </div>
      <Line data={data} plugins={plugins} />
      <h3>주간 지출 트렌드</h3>
      <Line data={weeklyData} />
    </div>
  );
};

export default Monthly;