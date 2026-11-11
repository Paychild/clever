import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    try {
      const txRes = await fetch('http://localhost:5000/api/transactions');
      const txResult = await txRes.json();
      setTransactions(Array.isArray(txResult) ? txResult : []);

      const catRes = await fetch('http://localhost:5000/api/categories');
      const catResult = await catRes.json();
      const categoriesList = Array.isArray(catResult) ? catResult : [];
      
      setCategories(categoriesList);
      if (categoriesList.length > 0 && !categoryId) {
        setCategoryId(categoriesList[0].id);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalIncome = transactions
    .filter(t => t.category_type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.category_type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          title: description,
          category_id: parseInt(categoryId),
          date
        })
      });

      if (response.ok) {
        setAmount('');
        setDescription('');
        fetchData();
      } else {
        const errorData = await response.json();
        console.error('Server rejected request:', errorData);
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1>Expense & Budget Tracker</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ flex: 1, background: '#e8f5e9', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#2e7d32' }}>Income</h4>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2e7d32' }}>${totalIncome.toFixed(2)}</span>
        </div>
        <div style={{ flex: 1, background: '#ffebee', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#c62828' }}>Expenses</h4>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#c62828' }}>${totalExpenses.toFixed(2)}</span>
        </div>
        <div style={{ flex: 1, background: '#e3f2fd', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#1565c0' }}>Balance</h4>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: netBalance >= 0 ? '#1565c0' : '#c62828' }}>
            ${netBalance.toFixed(2)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>Add New Transaction</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>Amount ($): </label>
          <input 
            type="number" 
            step="0.01" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Description: </label>
          <input 
            type="text" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Category: </label>
          <select 
            value={categoryId} 
            onChange={(e) => setCategoryId(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.type})
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Date: </label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ background: '#007BFF', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Add Transaction
        </button>
      </form>

      <h3>Transaction History</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {transactions.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No transactions recorded yet.</p>
        ) : (
          transactions.map((t) => (
            <li key={t.id} style={{ background: '#fff', border: '1px solid #ddd', padding: '10px 15px', marginBottom: '8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t.date ? t.date.split('T')[0] : ''} — {t.title} <strong>({t.category_name || 'General'})</strong></span>
              <strong style={{ color: t.category_type === 'income' ? 'green' : 'red' }}>
                {t.category_type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
              </strong>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;