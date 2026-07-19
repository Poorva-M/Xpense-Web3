import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { openWalletModal } from '../lib/wallet';

const WalletContext = createContext(null);

const STORAGE_KEY = 'xpens_wallet';

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  // Restore a previous session (address only — re-approval still
  // happens whenever a transaction actually needs signing).
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setWallet(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError('');
    try {
      const result = await openWalletModal();
      setWallet(result);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      return result;
    } catch (err) {
      setError(err?.message || 'Failed to connect wallet.');
      throw err;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, connecting, error, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider');
  return ctx;
}
