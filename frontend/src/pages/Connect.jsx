import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import WalletOptions from '../components/WalletOptions';
import { useWallet } from '../contexts/WalletContext';

export default function Connect() {
  const navigate = useNavigate();
  const { wallet } = useWallet();

  useEffect(() => {
    if (wallet) navigate('/dashboard');
  }, [wallet, navigate]);

  return (
    <div className="container" style={{ paddingTop: 40 }}>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-2)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 30,
        }}
      >
        ← Back to home
      </button>

      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <h2>Connect your wallet</h2>
        <p style={{ color: 'var(--text-2)' }}>Choose a Stellar wallet to sign in with.</p>
      </div>
      <WalletOptions onConnected={() => navigate('/dashboard')} />
    </div>
  );
}