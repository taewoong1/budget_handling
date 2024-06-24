import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Notices.css';

function Notices() {
  const [notices, setNotices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        // 예시 공지사항 데이터
        const exampleNotices = [
          {
            id: 1,
            title: '서비스 업데이트 안내',
            content: '우리의 서비스가 업데이트되었습니다. 새로운 기능을 확인해보세요!',
            date: '2023-06-01'
          },
          {
            id: 2,
            title: '정기 점검 공지',
            content: '서비스 점검이 2023년 6월 10일 오전 2시부터 4시까지 진행됩니다. 이용에 불편을 드려 죄송합니다.',
            date: '2023-06-05'
          },
          {
            id: 3,
            title: '새로운 식당 추가',
            content: '새로운 식당이 데이터베이스에 추가되었습니다. 다양한 음식을 즐겨보세요!',
            date: '2023-06-15'
          }
        ];

        setNotices(exampleNotices);
      } catch (err) {
        console.error('Error fetching notices:', err);
      }
    };
    fetchNotices();
  }, []);

  const handleBack = () => {
    navigate('/mypage');
  };

  return (
    <div className="notices-container">
      <button className="back-button" onClick={handleBack}>뒤로가기</button>
      <h2>공지사항</h2>
      <div className="notice-list">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <div key={notice.id} className="notice-item">
              <h3>{notice.title}</h3>
              <p>{notice.content}</p>
              <span className="notice-date">{new Date(notice.date).toLocaleDateString()}</span>
            </div>
          ))
        ) : (
          <p>공지사항이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default Notices;
