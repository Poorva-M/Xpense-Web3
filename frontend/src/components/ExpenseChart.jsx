import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CATEGORY_COLORS, formatINR } from '../lib/format';

ChartJS.register(ArcElement, Tooltip);

export default function ExpenseChart({ expenses }) {
  const totals = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  const labels = Object.keys(totals);
  const data = Object.values(totals);
  const colors = labels.map((l) => CATEGORY_COLORS[l] || '#888');

  if (!labels.length) {
    return <div className="empty-msg">Add expenses to see the category breakdown.</div>;
  }

  return (
    <>
      <Doughnut
        data={{
          labels,
          datasets: [
            {
              data,
              backgroundColor: colors,
              borderWidth: 2,
              borderColor: '#18181c',
              hoverOffset: 8,
            },
          ],
        }}
        options={{
          cutout: '65%',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${formatINR(ctx.parsed)}`,
              },
            },
          },
        }}
      />
      <div className="legend">
        {labels.map((l, i) => (
          <div className="legend-item" key={l}>
            <div className="legend-dot" style={{ background: colors[i] }} />
            {l}
          </div>
        ))}
      </div>
    </>
  );
}
