import { useWallet } from '../contexts/WalletContext';
import { shortAddress } from '../lib/format';

export default function WalletButton() {
  const { wallet, connecting, connect, disconnect } = useWallet();

  if (wallet) {
    return (
      <div className="wallet-chip">
        <span className="dot" />
        <span>{wallet.name} · {shortAddress(wallet.address)}</span>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <button className="wallet-btn" onClick={connect} disabled={connecting}>
      {connecting ? 'Connecting…' : 'Connect Wallet'}
    </button>
  );
}
