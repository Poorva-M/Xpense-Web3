import { formatINR } from '../lib/format';

export default function StatsBar({ expenses }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const count = expenses.length;
  const avg = count ? total / count : 0;

  const catTotals = {};
  expenses.forEach((e) => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });
  const top = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid stats-grid">
      <div className="card">
        <div className="stat-label">Total spent</div>
        <div className="stat-value">{formatINR(total)}</div>
      </div>
      <div className="card">
        <div className="stat-label">Transactions</div>
        <div className="stat-value">{count}</div>
      </div>
      <div className="card">
        <div className="stat-label">Average</div>
        <div className="stat-value">{formatINR(avg)}</div>
      </div>
      <div className="card">
        <div className="stat-label">Top category</div>
        <div className="stat-value" style={{ fontSize: '1.1rem' }}>{top ? top[0] : '—'}</div>
      </div>
    </div>
  );
}
