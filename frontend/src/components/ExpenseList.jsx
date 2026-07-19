import { useState } from 'react';
import { CATEGORY_COLORS, formatINR, formatDate } from '../lib/format';

export default function ExpenseList({ expenses, onDelete, pending }) {
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  if (!expenses.length) {
    return <div className="empty-msg">No expenses yet. Add your first one to get started.</div>;
  }

  return (
    <ul className="expense-list">
      {expenses.map((exp) => {
        const color = CATEGORY_COLORS[exp.category] || '#888';
        const isDeleting = deletingId === exp.id;
        return (
          <li className="expense-item" key={exp.id}>
            <div className="expense-left">
              <div className="category-dot" style={{ background: color }} />
              <div style={{ minWidth: 0 }}>
                <div className="expense-name">{exp.desc}</div>
                <div className="expense-meta">{exp.category} · {formatDate(exp.date)}</div>
              </div>
            </div>
            <div className="expense-right">
              <div className="expense-amount">{formatINR(exp.amount)}</div>
              <button
                className="del-btn"
                title="Delete"
                disabled={pending}
                onClick={() => handleDelete(exp.id)}
              >
                {isDeleting ? <span className="spinner" /> : '✕'}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
