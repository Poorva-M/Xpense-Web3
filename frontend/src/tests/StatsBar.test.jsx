import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsBar from '../components/StatsBar';

const expenses = [
  { id: 1, desc: 'Coffee', amount: 25000, category: 'Food', date: Date.now() },
  { id: 2, desc: 'Metro', amount: 4000, category: 'Travel', date: Date.now() },
  { id: 3, desc: 'Lunch', amount: 30000, category: 'Food', date: Date.now() },
];

describe('StatsBar', () => {
  it('renders the correct total across all expenses', () => {
    render(<StatsBar expenses={expenses} />);
    expect(screen.getByText('₹590.00')).toBeInTheDocument();
  });

  it('renders the correct transaction count', () => {
    render(<StatsBar expenses={expenses} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('identifies the top category by total spend', () => {
    render(<StatsBar expenses={expenses} />);
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('shows a placeholder when there are no expenses', () => {
    render(<StatsBar expenses={[]} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
