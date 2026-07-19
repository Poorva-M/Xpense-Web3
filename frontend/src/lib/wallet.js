// ================================
// wallet.js — Stellar wallet connection layer
// Supports Freighter, Rabet, and xBull via Stellar Wallets Kit.
// ================================

import {
  StellarWalletsKit,
  WalletNetwork,
  FreighterModule,
  RabetModule,
  xBullModule,
  FREIGHTER_ID,
} from '@creit.tech/stellar-wallets-kit';

const NETWORK = import.meta.env.VITE_NETWORK === 'PUBLIC'
  ? WalletNetwork.PUBLIC
  : WalletNetwork.TESTNET;

// Single kit instance shared across the app.
export const kit = new StellarWalletsKit({
  network: NETWORK,
  selectedWalletId: FREIGHTER_ID,
  modules: [new FreighterModule(), new RabetModule(), new xBullModule()],
});

/**
 * Opens the wallet picker modal (Freighter / Rabet / xBull) and returns
 * the connected public address once the user picks one and approves it.
 */
export function openWalletModal() {
  return new Promise((resolve, reject) => {
    kit
      .openModal({
        modalTitle: 'Connect a Stellar wallet',
        onWalletSelected: async (option) => {
          try {
            kit.setWallet(option.id);
            const { address } = await kit.getAddress();
            resolve({ id: option.id, name: option.name, address });
          } catch (err) {
            reject(err);
          }
        },
        onClosed: (err) => {
          if (err) reject(err);
        },
      })
      .catch(reject);
  });
}

/** Sign a transaction XDR with whichever wallet is currently selected. */
export async function signTransaction(xdr, { address, networkPassphrase }) {
  const { signedTxXdr } = await kit.signTransaction(xdr, {
    address,
    networkPassphrase,
  });
  return signedTxXdr;
}

export const NETWORK_PASSPHRASE =
  import.meta.env.VITE_NETWORK_PASSPHRASE ||
  'Test SDF Network ; September 2015';
