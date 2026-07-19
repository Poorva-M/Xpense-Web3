import { useWallet } from '../contexts/WalletContext';

const WALLETS = [
  { id: 'freighter', name: 'Freighter', icon: '🚀' },
  { id: 'rabet', name: 'Rabet', icon: '🐇' },
  { id: 'xbull', name: 'xBull', icon: '🐂' },
];

// All three connect through the same kit modal (which auto-detects
// installed extensions); these cards just give a one-click, branded
// entry point plus a fallback list if a wallet isn't installed.
export default function WalletOptions({ onConnected }) {
  const { connect, connecting, error } = useWallet();

  async function handleClick() {
    try {
      const result = await connect();
      if (result && onConnected) onConnected(result);
    } catch {
      // error is surfaced via wallet context
    }
  }

  return (
    <div>
      <div className="wallet-options">
        {WALLETS.map((w) => (
          <div key={w.id} className="wallet-option-card" onClick={handleClick}>
            <div className="icon">{w.icon}</div>
            <div className="name">{w.name}</div>
          </div>
        ))}
      </div>
      {connecting && <p style={{ textAlign: 'center', color: 'var(--text-2)', marginTop: 16 }}>Waiting for wallet approval…</p>}
      {error && <div className="alert" style={{ marginTop: 16 }}>{error}</div>}
    </div>
  );
}
