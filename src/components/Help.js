import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Help.css';

function Help() {
  const [faqs, setFaqs] = useState([
    {
      question: '이 앱은 무엇을 위한 것인가요?',
      answer: '이 앱은 사용자의 예산 관리와 소비 추적을 돕기 위한 앱입니다.',
      open: false
    },
    {
      question: '새로운 고정 지출은 어떻게 설정하나요?',
      answer: '마이페이지에서 고정 지출 설정 페이지로 이동하여 설정할 수 있습니다. 새로운 카테고리를 추가하여 입력하고 저장버튼을 누르면 됩니다.',
      open: false
    },
    {
      question: '지출은 어떻게 추가하나요?',
      answer: '소비 달력에서 특정 날짜를 클릭하여 수입과 지출을 추가할 수 있습니다.',
      open: false
    },
    {
      question: '맛집추천은 어떤 선정기준으로 추천되나요?',
      answer: '음식종류와 원하는 가격대와 네이버 벌점리뷰를 참고한 식당 점수로 추천합니다.',
      open: false
    },
    {
      question: '소비달력에서 수입은 어떻게 기록하나요?',
      answer: '마이페이지에서 예산 입력으로 이동하여 설정할 수 있습니다. 값을 입력하면 소비달력의 수입에 반영됩니다.',
      open: false
    }
  ]);

  const navigate = useNavigate();

  const toggleFAQ = index => {
    setFaqs(faqs.map((faq, i) => {
      if (i === index) {
        faq.open = !faq.open;
      } else {
        faq.open = false;
      }
      return faq;
    }));
  };

  const handleBack = () => {
    navigate('/mypage');
  };

  return (
    <div className="notices-container">
      <button className="back-button" onClick={handleBack}>뒤로가기</button>
      <h2>도움말</h2>
      <section className="intro">
        <p>이 앱은 여러분의 예산 관리와 소비 추적을 돕기 위해 만들어졌습니다.
           아래 자주 묻는 질문(FAQ)과 답변을 통해 앱 사용 방법에 대한 도움을 받을 수 있습니다.</p>
      </section>
      <section className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className={`faq ${faq.open ? 'open' : ''}`}>
            <div className="faq-question" onClick={() => toggleFAQ(index)}>
              {faq.question}
            </div>
            {faq.open && <div className="faq-answer">{faq.answer}</div>}
          </div>
        ))}
      </section>
      <section className="contact">
        <h3>추가 도움이 필요하신가요?</h3>
        <p>고객 지원팀에 문의하려면 <a href="mailto:taewoong5006@gmail.com">taewoong5006@gmail.com</a>으로 이메일을 보내주세요.</p>
      </section>
    </div>
  );
}

export default Help;
