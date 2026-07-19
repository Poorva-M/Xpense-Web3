# 📊 Xpens — On-Chain Expense Tracker (Stellar Soroban)

Xpens is a decentralized personal expense tracker. Users connect a Stellar wallet (Freighter, Rabet, xBull), add/delete expenses, and every entry is stored **on-chain** in a Soroban smart contract, scoped to their own wallet address — no accounts, no passwords, no central database.

---

## 📃 Project Structure

```
xpens-dapp/
├── README.md
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml               # CI: lint + test + build (frontend), cargo test + wasm build (contract)
├── contract/
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs                # Soroban smart contract (on-chain expense storage)
│       └── test.rs               # 6 contract unit tests
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── netlify.toml               # Netlify build + SPA routing config
    ├── .env.example
    ├── public/
    │   └── _redirects             # SPA routing fix (prevents blank screen on refresh)
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── lib/
        │   ├── wallet.js          # Freighter / Rabet / xBull connection + signing logic
        │   ├── contract.js        # Builds, signs, and submits contract calls
        │   ├── useExpenses.js     # Data hook: loading/error states + polling for live updates
        │   └── format.js          # Currency/date formatting helpers
        ├── contexts/
        │   └── WalletContext.jsx  # Global wallet connection state
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Connect.jsx        # Wallet connect UI
        │   └── Dashboard.jsx      # Expense form + list + chart + stats
        ├── components/
        │   ├── WalletButton.jsx
        │   ├── WalletOptions.jsx
        │   ├── ExpenseForm.jsx
        │   ├── ExpenseList.jsx
        │   ├── ExpenseChart.jsx
        │   └── StatsBar.jsx
        └── tests/                 # Vitest + React Testing Library tests
```

---

## 💻 Live Demo

`PASTE_YOUR_NETLIFY_OR_VERCEL_URL_HERE`

---

## 🎥 Demo Video

`PASTE_YOUR_1-2_MIN_DEMO_VIDEO_LINK_HERE`

---

## 📸 Screenshots

**Wallet connect options (Freighter / Rabet / xBull):**
`PASTE_SCREENSHOT_LINK_OR_EMBED_HERE`

**Mobile responsive UI:**
`PASTE_SCREENSHOT_LINK_OR_EMBED_HERE`

**CI/CD pipeline running:**
`PASTE_SCREENSHOT_LINK_OR_EMBED_HERE`

**Test output (3+ passing tests):**
`PASTE_SCREENSHOT_LINK_OR_EMBED_HERE`

*(See "How to get your screenshots" section at the bottom of this README for exactly where to find each of these.)*

---

## Deployed Soroban Contract

| Field | Value |
|---|---|
| Network | Stellar Testnet |
| Contract | `contract/src/lib.rs` — `XpensContract` |
| Contract ID | `CC6JLUEVOL7DXE5BBQACEGEPSSUQMZLHXAPO6SCPGDIDJS2E24VXFVEV` |
| Functions | `add_expense(owner, desc, amount, category, date) -> id`, `delete_expense(owner, id)`, `clear_expenses(owner)`, `get_expenses(owner) -> Vec<Expense>`, `get_summary(owner) -> Summary` |

View the contract on Stellar Expert:
`https://stellar.expert/explorer/testnet/contract/CC6JLUEVOL7DXE5BBQACEGEPSSUQMZLHXAPO6SCPGDIDJS2E24VXFVEV`

---

## 🔗 Transaction Hash (Contract Deployment)

| Field | Value |
|---|---|
| Transaction Hash | `71855236f0f1810fc0fe03878e36cdd9534c5a0a89ccf3ff37af340f4f2e6dc0` |
| Explorer Link | `https://stellar.expert/explorer/testnet/tx/71855236f0f1810fc0fe03878e36cdd9534c5a0a89ccf3ff37af340f4f2e6dc0` |

---

## #️⃣🔗 Transaction Hash (Contract Call)

Example of a successful `add_expense` invocation on the deployed contract:

| Field | Value |
|---|---|
| Transaction Hash | `dd1f22a1176cc378020a526eb5fc34db01f334e3e0175471930cc83e8bb949ce` |
| Explorer Link | `https://stellar.expert/explorer/testnet/tx/dd1f22a1176cc378020a526eb5fc34db01f334e3e0175471930cc83e8bb949ce` |
| Event Emitted | `exp_add` — owner address, expense id `1`, amount `25000` (₹250.00), category `Food` |

*(Get further examples by running the `stellar contract invoke` command in the Deploy section below, or by checking your deploy account's recent activity on Stellar Expert.)*

---

## 📃 Features

- Wallet login for **Freighter**, **Rabet**, and **xBull** — each opens the wallet's own native permission popup on connect, via [`@creit.tech/stellar-wallets-kit`](https://stellarwalletskit.dev/)
- Add, delete, and clear expenses — every write is signed by the connected wallet and requires `owner.require_auth()` on-chain, so only that wallet can modify its own data
- Per-wallet on-chain storage — expenses are keyed by `Address` in Soroban persistent storage; one wallet can never read or write another wallet's entries
- Live category breakdown chart, running totals, transaction count, and average spend — all computed from real contract state (`get_summary` is a contract-level read, not a frontend calculation)
- Real-time-style updates — the dashboard polls the contract and refreshes immediately after every transaction, so changes reflect without a manual reload
- On-chain events (`exp_add`, `exp_del`, `exp_clr`) published on every write, laying the groundwork for a future event-streaming/indexer layer
- Mobile-responsive layout throughout (landing, wallet connect, dashboard)
- Loading and error states on every contract call — network hiccups and rejected signatures surface as inline messages instead of silent failures
- Client-side + on-chain validation (rejects empty descriptions and non-positive amounts, both in the form and in the contract itself)

---

## 🛠️ Tech Stack

- **Frontend:** Vite + React, React Router
- **Wallets:** `@creit.tech/stellar-wallets-kit` (Freighter, Rabet, xBull)
- **Blockchain:** Stellar Testnet, Soroban smart contracts, `@stellar/stellar-sdk`
- **Smart contract:** Rust + `soroban-sdk`
- **Charts:** Chart.js / react-chartjs-2
- **Testing:** Vitest + React Testing Library (frontend), `cargo test` (contract)
- **CI/CD:** GitHub Actions

---

## 💻 Setup Instructions

### 1. Clone and install

```bash
git clone <your-repo-url>
cd xpens-dapp/frontend
npm install
```

### 2. Build and test the contract (one-time, or after any contract change)

```bash
cd ../contract
cargo test
stellar contract build
```

### 3. Deploy the contract (if deploying your own instance)

```bash
stellar keys generate alice --network testnet
stellar keys fund alice --network testnet

stellar contract deploy \
  --wasm target/wasm32v1-none/release/xpens_contract.wasm \
  --source alice \
  --network testnet
```

Copy the returned contract ID (starts with `C...`).

### 4. Configure environment variables

```bash
cd ../frontend
cp .env.example .env
```

Fill in `.env`:

```
VITE_CONTRACT_ID=CC6JLUEVOL7DXE5BBQACEGEPSSUQMZLHXAPO6SCPGDIDJS2E24VXFVEV
VITE_NETWORK=TESTNET
VITE_RPC_URL=https://soroban-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

### 5. Run locally

```bash
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

### 6. Test the flow

1. Install at least one of: [Freighter](https://freighter.app), [Rabet](https://rabet.io), [xBull](https://xbull.app)
2. Make sure the wallet extension is set to **Testnet**
3. Fund your wallet's testnet account via Friendbot: `https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY`
4. Open the app, click **Connect Wallet**, approve the connection in your wallet's popup
5. Add an expense — approve the signing popup
6. Watch it appear instantly in the list, stats, and chart, all read back live from the contract

---

## 🧪 Testing

- **Contract:** 6 `cargo test` unit tests — covering id sequencing, deletion, aggregate summary math, clearing all expenses, per-wallet storage isolation, and input validation (rejecting a zero/negative amount)
- **Frontend:** 13 Vitest + React Testing Library tests — covering currency formatting, address shortening, stats aggregation, and form validation (rejects empty description / non-positive amount, converts rupees to paise correctly, disables submit while a transaction is pending)

Run them yourself:

```bash
# contract
cd contract && cargo test

# frontend
cd frontend && npm test
```

---

## ⚙️ CI/CD

`.github/workflows/ci.yml` runs on every push/PR to `main`:
- **frontend job:** `npm ci` → `eslint` → `vitest run` → `vite build`
- **contract job:** `cargo test` → `cargo build --target wasm32-unknown-unknown --release`

---

## 🌐 Links

1. Live Demo: `PASTE_YOUR_NETLIFY_OR_VERCEL_URL_HERE`
2. Contract: `https://stellar.expert/explorer/testnet/contract/CC6JLUEVOL7DXE5BBQACEGEPSSUQMZLHXAPO6SCPGDIDJS2E24VXFVEV`
3. Explorer (sample tx): `https://stellar.expert/explorer/testnet/tx/dd1f22a1176cc378020a526eb5fc34db01f334e3e0175471930cc83e8bb949ce`
4. App Installation: [Freighter](https://freighter.app), [Rabet](https://rabet.io), [xBull](https://xbull.app)
5. Testnet Account Funding: `https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY`

---

### Suggested commit plan (10+ commits)

1. `chore: scaffold Vite React frontend`
2. `feat: add Soroban contract with add/delete/clear/get methods`
3. `test: add contract unit tests`
4. `feat: wallet connection layer (Freighter/Rabet/xBull)`
5. `feat: contract client (build/sign/submit transactions)`
6. `feat: expense form, list, stats, chart components`
7. `feat: dashboard page wired to on-chain data`
8. `feat: landing + wallet connect pages`
9. `style: mobile-responsive layout`
10. `test: add frontend unit/component tests`
11. `ci: add GitHub Actions pipeline`
12. `docs: write README`
13. `chore: deploy contract to testnet, wire up contract id`
14. `deploy: publish to Netlify`

---

## 🔮 Future Work

- Replace polling with true event streaming (Soroban RPC event subscription or an indexer) for instant cross-tab updates
- A second contract composing `get_summary` cross-contract (e.g. monthly budget alerts)
- Multi-currency support beyond INR
- Users can get their deleted expenses back again if they want in future(Only once).