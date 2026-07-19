import { Link } from 'react-router-dom';
import WalletButton from '../components/WalletButton';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="topbar">
        <div className="brand"><span className="brand-dot">◆</span> Xpens</div>
        <WalletButton />
      </header>

      <section className="hero" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 40, paddingBottom: 40 }}>
        <h1>Track expenses. <span className="accent">On-chain.</span></h1>
        <p>
          Xpens is a decentralized expense tracker built on Stellar Soroban.
          Every entry is signed and stored under your own wallet address —
          no accounts, no passwords, no central database.
        </p>
        <Link to="/connect">
          <button className="btn-primary" style={{ width: 'auto', padding: '12px 28px', margin: '0 auto' }}>
            Get started
          </button>
        </Link>

        <div className="container" style={{ marginTop: 60 }}>
          <div className="grid stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="card">
              <div className="stat-label">Your wallet, your data</div>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
                Expenses are stored per-wallet on Soroban. Only your signature can add or delete your own entries.
              </p>
            </div>
            <div className="card">
              <div className="stat-label">Multi-wallet support</div>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
                Connect with Freighter, Rabet, or xBull — whichever Stellar wallet you already use.
              </p>
            </div>
            <div className="card">
              <div className="stat-label">Live on-chain stats</div>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
                Totals, averages, and category breakdowns are computed straight from contract state.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer" style={{ marginTop: 0 }}>Xpens — built on Stellar Soroban</footer>
    </div>
  );
}