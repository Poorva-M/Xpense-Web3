import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExpenseForm from '../components/ExpenseForm';

describe('ExpenseForm', () => {
  it('does not call onAdd when description is empty', () => {
    const onAdd = vi.fn();
    render(<ExpenseForm onAdd={onAdd} pending={false} />);

    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /Add expense/i }));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd when amount is zero or negative', () => {
    const onAdd = vi.fn();
    render(<ExpenseForm onAdd={onAdd} pending={false} />);

    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Snacks' } });
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /Add expense/i }));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('calls onAdd with correctly shaped data (amount converted to paise)', async () => {
    const onAdd = vi.fn().mockResolvedValue({});
    render(<ExpenseForm onAdd={onAdd} pending={false} />);

    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Groceries' } });
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '150.50' } });
    fireEvent.click(screen.getByRole('button', { name: /Add expense/i }));

    await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(1));
    const call = onAdd.mock.calls[0][0];
    expect(call.desc).toBe('Groceries');
    expect(call.amount).toBe(15050);
    expect(call.category).toBe('Food');
  });

  it('disables the submit button while a transaction is pending', () => {
    render(<ExpenseForm onAdd={vi.fn()} pending={true} />);
    expect(screen.getByRole('button', { name: /Confirming on-chain/i })).toBeDisabled();
  });
});
