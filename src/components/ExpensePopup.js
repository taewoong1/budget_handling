import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExpensePopup.css';

const initialCategories = [
  { name: '식비', key: 'food' },
  { name: '교통/차량', key: 'transport' },
  { name: '문화생활', key: 'culture' },
  { name: '기타', key: 'etc' },
];

const ExpensePopup = ({ date, expenses, onSave, onClose }) => {
  const [currentExpenses, setCurrentExpenses] = useState(expenses);
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      const userId = localStorage.getItem('userId');
      try {
        const res = await axios.get(`http://localhost:5000/api/expenses/${userId}/${date}`);
        setCurrentExpenses(res.data);
      } catch (err) {
        console.error('Failed to fetch expenses:', err);
      }
    };
    fetchExpenses();
  }, [date]);

  const handleInputChange = (categoryKey, value) => {
    setCurrentExpenses({
      ...currentExpenses,
      [categoryKey]: value,
    });
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const newCategoryKey = newCategory.toLowerCase().replace(/\s+/g, '_');
      setCategories([
        ...categories,
        { name: newCategory, key: newCategoryKey },
      ]);
      setNewCategory('');
    }
  };

  const handleSave = async () => {
    const userId = localStorage.getItem('userId');
    try {
      await axios.post('http://localhost:5000/api/expenses/save', {
        userId,
        date,
        expenses: currentExpenses,
      });
      onSave(date, currentExpenses);
    } catch (err) {
      console.error('Failed to save expenses:', err);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <div className="popup-header">
          <h2>{date.toLocaleDateString()}</h2>
          <button onClick={onClose}>X</button>
        </div>
        <div className="popup-body">
          {categories.map((category) => (
            <div key={category.key} className="expense-input">
              <label>{category.name}</label>
              <input 
                type="number" 
                value={currentExpenses[category.key] || ''} 
                onChange={(e) => handleInputChange(category.key, e.target.value)}
              />
            </div>
          ))}
          <div className="new-category">
            <input 
              type="text" 
              value={newCategory} 
              onChange={(e) => setNewCategory(e.target.value)} 
              placeholder="새 카테고리 추가"
            />
            <button onClick={handleAddCategory}>추가</button>
          </div>
        </div>
        <div className="popup-footer">
          <button onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default ExpensePopup;