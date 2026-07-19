import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletButton from '../components/WalletButton';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseChart from '../components/ExpenseChart';
import StatsBar from '../components/StatsBar';
import { useWallet } from '../contexts/WalletContext';
import { useExpenses } from '../lib/useExpenses';
import { CATEGORIES } from '../lib/format';

export default function Dashboard() {
  const { wallet } = useWallet();
  const navigate = useNavigate();
  const { expenses, loading, pending, error, addExpense, deleteExpense, clearAll } =
    useExpenses(wallet?.address);

  const [filterCat, setFilterCat] = useState('all');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    if (!wallet) navigate('/connect');
  }, [wallet, navigate]);

  const filtered = useMemo(() => {
    let list = expenses;
    if (filterCat !== 'all') list = list.filter((e) => e.category === filterCat);
    return [...list].sort((a, b) => {
      if (sort === 'newest') return b.date - a.date;
      if (sort === 'oldest') return a.date - b.date;
      if (sort === 'highest') return b.amount - a.amount;
      if (sort === 'lowest') return a.amount - b.amount;
      return 0;
    });
  }, [expenses, filterCat, sort]);

  async function handleClearAll() {
    if (!window.confirm('Delete ALL expenses on-chain? This cannot be undone.')) return;
    await clearAll();
  }

  if (!wallet) return null;

  return (
    <div>
      <header className="topbar">
        <div className="brand"><span className="brand-dot">◆</span> Xpens</div>
        <WalletButton />
      </header>

      <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
        <h2 style={{ marginBottom: 4 }}>Your dashboard</h2>
        <p style={{ color: 'var(--text-2)', marginTop: 0, fontSize: '0.9rem' }}>
          Data is read live from the Xpens smart contract for your wallet.
        </p>

        {error && <div className="alert">{error}</div>}
        {loading && expenses.length === 0 ? (
          <div className="loading-row"><span className="spinner" /> Loading your on-chain expenses…</div>
        ) : (
          <StatsBar expenses={expenses} />
        )}

        <div className="dashboard-layout">
          <div>
            <ExpenseForm onAdd={addExpense} pending={pending} />
            <button className="btn-ghost" onClick={handleClearAll} disabled={pending || !expenses.length}>
              Clear all expenses
            </button>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginTop: 0 }}>Category breakdown</h3>
              <ExpenseChart expenses={expenses} />
            </div>

            <div className="card">
              <div className="filters">
                <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
                  <option value="all">All categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest amount</option>
                  <option value="lowest">Lowest amount</option>
                </select>
              </div>
              <ExpenseList expenses={filtered} onDelete={deleteExpense} pending={pending} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
