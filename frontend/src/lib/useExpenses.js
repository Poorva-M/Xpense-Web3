// ================================
// useExpenses.js — expense state backed by the Soroban contract
// ================================
//
// Real-time updates: rather than requiring a full page reload after every
// transaction, we optimistically update local state on success and also
// poll get_expenses() on an interval so the UI reflects any change to the
// wallet's on-chain data (e.g. made from another tab/device) without a
// manual refresh.

import { useCallback, useEffect, useRef, useState } from 'react';
import * as XpensContract from './contract';

const POLL_INTERVAL_MS = 15000;

export function useExpenses(address) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const pollRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError('');
    try {
      const data = await XpensContract.getExpenses(address);
      setExpenses(
        data.map((e) => ({
          id: Number(e.id),
          desc: e.desc,
          amount: Number(e.amount),
          category: e.category,
          date: Number(e.date) * 1000,
        }))
      );
    } catch (err) {
      setError(err?.message || 'Failed to load expenses from the contract.');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!address) {
      setExpenses([]);
      return undefined;
    }
    refresh();
    pollRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [address, refresh]);

  const addExpense = useCallback(
    async (input) => {
      if (!address) throw new Error('Connect a wallet first.');
      setPending(true);
      setError('');
      try {
        const result = await XpensContract.addExpense(address, input);
        await refresh();
        return result;
      } catch (err) {
        setError(err?.message || 'Failed to add expense on-chain.');
        throw err;
      } finally {
        setPending(false);
      }
    },
    [address, refresh]
  );

  const deleteExpense = useCallback(
    async (id) => {
      if (!address) throw new Error('Connect a wallet first.');
      setPending(true);
      setError('');
      try {
        const result = await XpensContract.deleteExpense(address, id);
        await refresh();
        return result;
      } catch (err) {
        setError(err?.message || 'Failed to delete expense on-chain.');
        throw err;
      } finally {
        setPending(false);
      }
    },
    [address, refresh]
  );

  const clearAll = useCallback(async () => {
    if (!address) throw new Error('Connect a wallet first.');
    setPending(true);
    setError('');
    try {
      const result = await XpensContract.clearExpenses(address);
      await refresh();
      return result;
    } catch (err) {
      setError(err?.message || 'Failed to clear expenses on-chain.');
      throw err;
    } finally {
      setPending(false);
    }
  }, [address, refresh]);

  return { expenses, loading, pending, error, refresh, addExpense, deleteExpense, clearAll };
}
