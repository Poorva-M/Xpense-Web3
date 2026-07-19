import { useState } from 'react';
import { CATEGORIES, toPaise } from '../lib/format';

export default function ExpenseForm({ onAdd, pending }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shake, setShake] = useState({});
  const [localError, setLocalError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError('');
    const amt = parseFloat(amount);

    const nextShake = {};
    if (!desc.trim()) nextShake.desc = true;
    if (!amt || amt <= 0) nextShake.amount = true;
    if (Object.keys(nextShake).length) {
      setShake(nextShake);
      setTimeout(() => setShake({}), 800);
      return;
    }

    try {
      await onAdd({
        desc: desc.trim(),
        amount: toPaise(amt),
        category,
        date: Math.floor(new Date(date).getTime() / 1000),
      });
      setDesc('');
      setAmount('');
      setCategory(CATEGORIES[0]);
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setLocalError(err?.message || 'Transaction failed. Please try again.');
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3 style={{ marginTop: 0 }}>Add expense</h3>
      {localError && <div className="alert">{localError}</div>}

      <div className={`field ${shake.desc ? 'shake' : ''}`}>
        <label htmlFor="desc">Description</label>
        <input
          id="desc"
          type="text"
          placeholder="e.g. Coffee with team"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      <div className="form-grid">
        <div className={`field ${shake.amount ? 'shake' : ''}`}>
          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="date">Date</label>
        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <button className="btn-primary" type="submit" disabled={pending}>
        {pending ? 'Confirming on-chain…' : 'Add expense'}
      </button>
    </form>
  );
}
